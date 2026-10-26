"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { loadMoreScoreboardAction } from "@/actions/scoreboard";
import Button from "@/components/ui/button/button";
import ButtonLink from "@/components/ui/button-link/button-link";
import Card from "@/components/ui/card/card";
import ErrorMessage from "@/components/ui/error-message/error-message";
import { formatBRL } from "@/lib/format";
import type { ProfileOption, SessionView } from "@/types/session";

import ScoreboardEntryForm from "./scoreboard-entry-form";
import ScoreboardGameCard from "./scoreboard-game-card";

export interface ScoreboardProps {
  sessions: SessionView[];
  profiles: ProfileOption[];
  canManage: boolean;
  totalGames: number;
  totalSpent: number;
  hasMore: boolean;
}

interface LoadedSessions {
  base: SessionView[];
  extra: SessionView[];
  hasMore: boolean;
  error: string | null;
}

function Scoreboard({
  sessions,
  profiles,
  canManage,
  totalGames,
  totalSpent,
  hasMore: initialHasMore,
}: ScoreboardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<SessionView | "new" | null>(null);
  const [loaded, setLoaded] = useState<LoadedSessions>({
    base: sessions,
    extra: [],
    hasMore: initialHasMore,
    error: null,
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // A server refresh replaces the first page. Drop any loaded pages that came
  // from the previous version of it.
  const isStale = loaded.base !== sessions;

  const allSessions = [
    ...sessions,
    ...(isStale ? [] : loaded.extra.filter((extra) => !sessions.some((session) => session.id === extra.id))),
  ];
  const hasMore = isStale ? initialHasMore : loaded.hasMore;
  const loadMoreError = isStale ? null : loaded.error;

  function handleSaved() {
    setEditing(null);
    router.refresh();
  }

  async function handleLoadMore() {
    const active = isStale ? { base: sessions, extra: [], hasMore: initialHasMore, error: null } : loaded;

    setIsLoadingMore(true);
    setLoaded({ ...active, error: null });

    try {
      const result = await loadMoreScoreboardAction(allSessions.length);

      if (result.error) {
        setLoaded({ ...active, error: result.error });
        return;
      }

      const existingIds = new Set([...sessions, ...active.extra].map((session) => session.id));
      const nextSessions = result.sessions.filter((session) => !existingIds.has(session.id));

      setLoaded({
        base: sessions,
        extra: [...active.extra, ...nextSessions],
        hasMore: result.hasMore,
        error: null,
      });
    } catch {
      setLoaded({ ...active, error: "Erro de conexão. Tente novamente." });
    } finally {
      setIsLoadingMore(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.8125rem] text-ink-400">
          <span className="font-semibold tabular-nums text-ink-200">{allSessions.length}</span>
          {totalGames > allSessions.length && (
            <>
              {" de "}
              <span className="font-semibold tabular-nums text-ink-200">{totalGames}</span>
            </>
          )}{" "}
          {totalGames === 1 ? "partida" : "partidas"}
          {totalSpent > 0 && (
            <>
              <span aria-hidden="true"> · </span>
              <span className="font-semibold tabular-nums text-ink-200">{formatBRL(totalSpent)}</span> no total
            </>
          )}
        </p>

        {canManage && (
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <ButtonLink href="/game/jogadores">Jogadores</ButtonLink>

            <Button type="button" size="sm" fullWidth={false} onClick={() => setEditing("new")}>
              Adicionar partida
            </Button>
          </div>
        )}
      </div>

      {totalGames === 0 ? (
        <Card as="section" className="text-center">
          <p className="text-[0.9375rem] font-semibold text-ink-50">Nenhuma partida registrada ainda.</p>
          <p className="mt-1 text-[0.8125rem] text-ink-400">
            {canManage
              ? "Adicione uma partida retroativa para começar o histórico."
              : "Quando uma partida terminar, ela aparece aqui."}
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
            {allSessions.map((session) => (
              <ScoreboardGameCard
                key={session.id}
                session={session}
                canManage={canManage}
                onEdit={() => setEditing(session)}
                onDeleted={() => router.refresh()}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex flex-col items-center gap-2">
              <Button
                type="button"
                variant="outline"
                fullWidth={false}
                isLoading={isLoadingMore}
                loadingLabel="Carregando…"
                onClick={handleLoadMore}
              >
                Carregar mais partidas
              </Button>
              <ErrorMessage message={loadMoreError} />
            </div>
          )}
        </>
      )}

      {editing && (
        <ScoreboardEntryForm
          key={editing === "new" ? "new" : editing.id}
          session={editing === "new" ? null : editing}
          profiles={profiles}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default Scoreboard;
