"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  joinSessionAction,
  loadSessionByIdAction,
  loadSessionDataAction,
  type SessionActionState,
} from "@/actions/session";
import SignOut from "@/components/features/sign-out/sign-out";
import Card from "@/components/ui/card/card";
import ErrorMessage from "@/components/ui/error-message/error-message";
import { SESSION_MODE_LABELS } from "@/lib/constants";
import { getDismissedInviteKey, setDismissedInviteKey, subscribeDismissedInvite } from "@/lib/invite-storage";
import { supabase } from "@/lib/supabase/client";
import type { ProfileOption, SessionData, SessionView } from "@/types/session";

import CreateSession from "./create-session";
import InvitePopup from "./invite-popup";
import SessionGame from "./session-game";
import SessionLobby from "./session-lobby";
import SessionResult from "./session-result";

export interface SessionHubProps {
  initialData: SessionData;
  initialError: string | null;
  me: { id: string; username: string };
  profiles: ProfileOption[];
}

function SessionHub({ initialData, initialError, me, profiles }: SessionHubProps) {
  const initialActiveIsMine = initialData.active?.players.some((player) => player.profile_id === me.id) ?? false;

  const [active, setActive] = useState<SessionView | null>(initialData.active);
  const [current, setCurrent] = useState<SessionView | null>(
    initialData.pendingDebt ?? (initialActiveIsMine ? initialData.active : null),
  );
  const currentRef = useRef(current);
  const syncRequestRef = useRef(0);
  const [error, setError] = useState<string | null>(initialError);
  const dismissedInvite = useSyncExternalStore(subscribeDismissedInvite, getDismissedInviteKey, () => null);

  const updateCurrent = useCallback((session: SessionView | null) => {
    currentRef.current = session;
    setCurrent(session);
  }, []);

  const dismissInvite = useCallback(() => {
    if (!active || active.status !== "lobby") return;

    const key = `${active.id}:${active.invite_version}`;

    setDismissedInviteKey(key);
  }, [active]);

  const sync = useCallback(async () => {
    const requestId = ++syncRequestRef.current;

    try {
      const data = await loadSessionDataAction();

      if (requestId !== syncRequestRef.current) return;

      if (data.error) {
        setError(data.error);
        return;
      }

      setError(null);
      setActive(data.active);

      if (data.pendingDebt) {
        updateCurrent(data.pendingDebt);
        return;
      }

      const activeIsMine = data.active?.players.some((player) => player.profile_id === me.id) ?? false;

      if (activeIsMine) {
        updateCurrent(data.active);
        return;
      }

      const currentSession = currentRef.current;

      if (!currentSession) return;

      if (data.active && data.active.id === currentSession.id) {
        const key = `${data.active.id}:${data.active.invite_version}`;

        setDismissedInviteKey(key);
        updateCurrent(null);
        return;
      }

      const updated = await loadSessionByIdAction(currentSession.id);

      if (requestId !== syncRequestRef.current) return;

      updateCurrent(updated);
    } catch (syncError) {
      console.error("[sessionHub] sync error", syncError);
      setError("Erro de conexão. Tente novamente.");
    }
  }, [me.id, updateCurrent]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    function scheduleSync() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void sync();
      }, 80);
    }

    const channel = supabase
      .channel("tenho-dado-session")
      .on("postgres_changes", { event: "*", schema: "public", table: "game_session" }, scheduleSync)
      .on("postgres_changes", { event: "*", schema: "public", table: "session_player" }, scheduleSync)
      .on("postgres_changes", { event: "*", schema: "public", table: "session_roll" }, scheduleSync)
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [sync]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") void sync();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [sync]);

  const acceptInvite = useCallback(async (): Promise<SessionActionState> => {
    if (!active || active.status !== "lobby") {
      return { error: "Esta sessão não está mais aceitando jogadores." };
    }

    const result = await joinSessionAction(active.id);

    if (!result.error) await sync();

    return result;
  }, [active, sync]);

  const leaveResult = useCallback(() => {
    updateCurrent(null);
    void sync();
  }, [sync, updateCurrent]);

  const isActiveParticipant = active?.players.some((player) => player.profile_id === me.id) ?? false;
  const inviteKey = active && active.status === "lobby" ? `${active.id}:${active.invite_version}` : null;
  const invite =
    active && active.status === "lobby" && !isActiveParticipant && !current && inviteKey !== dismissedInvite
      ? active
      : null;

  return (
    <>
      <ErrorMessage message={error} />

      {current ? (
        current.status === "lobby" ? (
          <SessionLobby session={current} me={me} profiles={profiles} onChanged={sync} />
        ) : current.status === "playing" ? (
          <SessionGame session={current} me={me} onChanged={sync} />
        ) : (
          <SessionResult session={current} me={me} onChanged={sync} onLeave={leaveResult} />
        )
      ) : (
        <div className="flex flex-col gap-4">
          {active ? (
            <Card as="section">
              <h2 className="text-sm font-semibold text-ink-200">Sessão em andamento</h2>
              <p className="mt-1 text-sm font-semibold text-ink-50">
                @{active.host_username} · {SESSION_MODE_LABELS[active.mode]}
              </p>
              <p className="mt-2 text-xs text-ink-400">
                {active.status === "lobby"
                  ? "O criador ainda não iniciou. Se o convite não apareceu, peça para reenviar."
                  : "A partida já começou. Aguarde a próxima sessão."}
              </p>
            </Card>
          ) : (
            <CreateSession onCreated={sync} />
          )}

          <SignOut />
        </div>
      )}

      {invite && <InvitePopup key={invite.id} session={invite} onJoin={acceptInvite} onDismiss={dismissInvite} />}
    </>
  );
}

export default SessionHub;
