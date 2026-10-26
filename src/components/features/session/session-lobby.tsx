"use client";

import { useRef, useState } from "react";

import {
  addSessionPlayerAction,
  endSessionAction,
  kickPlayerAction,
  leaveSessionAction,
  resendInviteAction,
  startSessionAction,
} from "@/actions/session";
import Badge from "@/components/ui/badge/badge";
import Button from "@/components/ui/button/button";
import Card from "@/components/ui/card/card";
import ErrorMessage from "@/components/ui/error-message/error-message";
import Select from "@/components/ui/select/select";
import { SCOREBOARD_ADMIN_USERNAME, SESSION_MODE_LABELS } from "@/lib/constants";
import { DIE_LABELS } from "@/lib/dice";
import type { ProfileOption, SessionView } from "@/types/session";

export interface SessionLobbyProps {
  session: SessionView;
  me: { id: string; username: string };
  profiles: ProfileOption[];
  onChanged: () => Promise<void>;
}

type BusyAction = "start" | "resend" | "end" | "leave" | null;

function SessionLobby({ session, me, profiles, onChanged }: SessionLobbyProps) {
  const isHost = session.host_id === me.id;
  const isItspx = me.username === SCOREBOARD_ADMIN_USERNAME;
  const canAddPlayers = isHost || isItspx;

  const startingRef = useRef(false);
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [kickingPlayerId, setKickingPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [addPlayerError, setAddPlayerError] = useState<string | null>(null);

  const availableProfiles = profiles.filter(
    (profile) => !session.players.some((player) => player.profile_id === profile.id),
  );

  async function handleAddPlayer() {
    if (!selectedProfileId || isAddingPlayer) return;

    setIsAddingPlayer(true);
    setAddPlayerError(null);

    try {
      const result = await addSessionPlayerAction(session.id, selectedProfileId);

      if (result.error) {
        setAddPlayerError(result.error);
      } else {
        setSelectedProfileId("");
        await onChanged();
      }
    } catch {
      setAddPlayerError("Erro de conexão. Tente novamente.");
    } finally {
      setIsAddingPlayer(false);
    }
  }

  async function handleStart() {
    if (startingRef.current) return;

    startingRef.current = true;
    setBusyAction("start");
    setError(null);

    try {
      const result = await startSessionAction(session.id);

      if (result.error) {
        setError(result.error);
      } else {
        await onChanged();
      }
    } catch {
      setError("Erro ao iniciar a sessão. Tente novamente.");
    } finally {
      setBusyAction(null);
      startingRef.current = false;
    }
  }

  async function handleResend() {
    setBusyAction("resend");
    setError(null);
    setNotice(null);

    const result = await resendInviteAction(session.id);

    if (result.error) {
      setError(result.error);
    } else {
      setNotice("Convite reenviado!");
    }

    await onChanged();
    setBusyAction(null);
  }

  async function handleEnd() {
    setBusyAction("end");
    setError(null);

    const result = await endSessionAction(session.id);

    if (result.error) {
      setError(result.error);
      setBusyAction(null);
      return;
    }

    await onChanged();
    setBusyAction(null);
  }

  async function handleLeave() {
    setBusyAction("leave");
    setError(null);

    const result = await leaveSessionAction(session.id);

    if (result.error) {
      setError(result.error);
      setBusyAction(null);
      return;
    }

    await onChanged();
    setBusyAction(null);
  }

  async function handleKick(playerId: string) {
    setKickingPlayerId(playerId);
    setError(null);

    const result = await kickPlayerAction(session.id, playerId);

    if (result.error) {
      setError(result.error);
    } else {
      await onChanged();
    }

    setKickingPlayerId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <Card as="section">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words font-display text-3xl uppercase leading-none tracking-wide text-ink-50">
              @{session.host_username}
            </h2>
            <p className="mt-1.5 text-xs text-ink-400">Sessão aberta</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="victory">{SESSION_MODE_LABELS[session.mode]}</Badge>
            {session.die === "d20" && <Badge variant="neutral">{DIE_LABELS.d20}</Badge>}
          </div>
        </div>

        <p className="mt-3 text-xs text-ink-400">
          {session.players.length < 2
            ? "Chame mais alguém: são necessários pelo menos 2 jogadores."
            : "Todos prontos. O criador pode iniciar quando quiser."}
        </p>
      </Card>

      <Card as="section" aria-live="polite">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-200">Jogadores</h3>
          <p className="text-xs tabular-nums text-ink-400">{session.players.length}</p>
        </div>

        <ul className="mt-2 flex flex-col">
          {session.players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between gap-2 border-b border-ink-800 py-2 last:border-b-0"
            >
              <span className="min-w-0 truncate text-sm text-ink-200">
                @{player.username}
                <span className="ml-1.5 text-[11px] text-ink-400">
                  {[
                    player.is_host ? "criador" : null,
                    player.profile_id === me.id ? "você" : null,
                    player.is_managed ? "gerido" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>

              {isHost && !player.is_host && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  fullWidth={false}
                  onClick={() => handleKick(player.id)}
                  disabled={kickingPlayerId === player.id}
                >
                  {kickingPlayerId === player.id ? "Removendo…" : "Remover"}
                </Button>
              )}
            </li>
          ))}
        </ul>

        {canAddPlayers && (
          <div className="mt-3 border-t border-ink-800 pt-3">
            {availableProfiles.length === 0 ? (
              <p className="text-xs text-ink-400">Todos os jogadores já estão na sessão.</p>
            ) : (
              <div className="flex flex-col gap-2">
                <Select
                  id="add-player"
                  aria-label="Jogador para adicionar"
                  value={selectedProfileId}
                  onChange={(event) => {
                    setSelectedProfileId(event.target.value);
                    setAddPlayerError(null);
                  }}
                  disabled={isAddingPlayer}
                >
                  <option value="">Adicionar jogador…</option>
                  {availableProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      @{profile.username}
                      {profile.isManaged ? " (gerido)" : ""}
                    </option>
                  ))}
                </Select>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddPlayer}
                  isLoading={isAddingPlayer}
                  disabled={!selectedProfileId || isAddingPlayer}
                >
                  Adicionar à sessão
                </Button>

                <p className="text-[11px] text-ink-400">Quem adiciona responde pelo gasto do jogador se ele perder.</p>

                <ErrorMessage message={addPlayerError} />
              </div>
            )}
          </div>
        )}
      </Card>

      <ErrorMessage message={error} />

      {notice && (
        <p role="status" className="rounded-md border border-ok/20 bg-ok-bg px-3 py-2 text-sm text-ok">
          {notice}
        </p>
      )}

      {isHost ? (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            onClick={handleStart}
            isLoading={busyAction === "start"}
            disabled={session.players.length < 2 || (busyAction !== null && busyAction !== "start")}
          >
            Iniciar sessão
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            isLoading={busyAction === "resend"}
            disabled={busyAction !== null && busyAction !== "resend"}
          >
            Reenviar convite
          </Button>

          <div className="flex items-center justify-center gap-2 py-1">
            {confirmEnd ? (
              <>
                <Button type="button" variant="ghost" size="sm" fullWidth={false} onClick={() => setConfirmEnd(false)}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  fullWidth={false}
                  onClick={handleEnd}
                  disabled={busyAction === "end"}
                >
                  {busyAction === "end" ? "Encerrando…" : "Confirmar encerramento"}
                </Button>
              </>
            ) : (
              <Button type="button" variant="ghost" size="sm" fullWidth={false} onClick={() => setConfirmEnd(true)}>
                Encerrar sessão
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={handleLeave}
          isLoading={busyAction === "leave"}
          disabled={busyAction !== null && busyAction !== "leave"}
        >
          Sair da sessão
        </Button>
      )}
    </div>
  );
}

export default SessionLobby;
