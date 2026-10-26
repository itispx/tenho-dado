"use client";

import { useState } from "react";

import { deleteFinishedSessionAction } from "@/actions/scoreboard";
import Badge from "@/components/ui/badge/badge";
import Button from "@/components/ui/button/button";
import ErrorMessage from "@/components/ui/error-message/error-message";
import { formatBRL, formatSessionDate } from "@/lib/format";
import { getPlayerScores } from "@/lib/session-logic";
import type { SessionView } from "@/types/session";

import PlayerScoreCard from "../session/player-score";

export interface ScoreboardGameCardProps {
  session: SessionView;
  canManage: boolean;
  onEdit: () => void;
  onDeleted: () => void;
}

function ScoreboardGameCard({ session, canManage, onEdit, onDeleted }: ScoreboardGameCardProps) {
  const scores = getPlayerScores(session);
  const loser = scores.find((score) => score.player.profile_id === session.loser_profile_id) ?? null;
  const playedAt = session.finished_at ?? session.created_at;

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await deleteFinishedSessionAction(session.id);

      if (result.error) {
        setDeleteError(result.error);
        return;
      }

      onDeleted();
    } catch {
      setDeleteError("Erro de conexão. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <article
      aria-label={`Partida de ${formatSessionDate(playedAt)}`}
      className="rounded-lg border border-ink-800 bg-ink-900"
    >
      <header className="px-4 pt-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-400">
          <time dateTime={playedAt} className="tabular-nums">
            {formatSessionDate(playedAt)}
          </time>
          <span aria-hidden="true">·</span>
          <span>
            {session.players.length} {session.players.length === 1 ? "jogador" : "jogadores"}
          </span>
          {session.source === "retroactive" && <Badge variant="victory">Retroativo</Badge>}
        </div>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <h2 className="min-w-[8rem] flex-1 text-[0.9375rem] font-semibold leading-snug text-ink-200">
            {loser ? (
              <>
                <span className="break-words text-danger">@{loser.player.username}</span> perdeu
              </>
            ) : (
              "Partida encerrada"
            )}
          </h2>

          <div className="shrink-0 text-right">
            {session.loser_spent !== null ? (
              <>
                <p className="text-lg font-semibold leading-none tabular-nums text-ink-50">
                  {formatBRL(session.loser_spent)}
                </p>
                <p className="mt-1 text-xs text-ink-400">Gasto do perdedor</p>
              </>
            ) : (
              <p className="text-xs text-ink-400">Gasto não informado</p>
            )}
          </div>
        </div>
      </header>

      <div className="mt-3 border-t border-ink-800 px-3 py-1">
        {scores.map((score) => (
          <PlayerScoreCard
            key={score.player.id}
            score={score}
            isLoser={score.player.profile_id === session.loser_profile_id}
          />
        ))}
      </div>

      {canManage && (
        <footer className="mt-1 border-t border-ink-800 px-4 py-2">
          {confirmDelete ? (
            <div className="flex items-center justify-end gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                fullWidth={false}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Excluindo…" : "Confirmar?"}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-1">
              <Button type="button" variant="ghost" size="sm" fullWidth={false} onClick={onEdit}>
                Editar
              </Button>
              <Button type="button" variant="ghost" size="sm" fullWidth={false} onClick={() => setConfirmDelete(true)}>
                Excluir
              </Button>
            </div>
          )}
        </footer>
      )}

      {deleteError && (
        <div className="px-4 pb-3">
          <ErrorMessage message={deleteError} />
        </div>
      )}
    </article>
  );
}

export default ScoreboardGameCard;
