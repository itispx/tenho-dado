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
    <article className="rounded-lg border border-ink-800 bg-ink-900 p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs tabular-nums text-ink-400">
            {formatSessionDate(session.finished_at ?? session.created_at)}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-ink-200">
            {session.players.length} {session.players.length === 1 ? "jogador" : "jogadores"}
          </p>

          {session.source === "retroactive" && (
            <Badge variant="victory" className="mt-1.5">
              Retroativo
            </Badge>
          )}
        </div>

        {canManage && (
          <div className="flex shrink-0 items-center gap-1">
            {confirmDelete ? (
              <>
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
              </>
            ) : (
              <>
                <Button type="button" variant="ghost" size="sm" fullWidth={false} onClick={onEdit}>
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  fullWidth={false}
                  onClick={() => setConfirmDelete(true)}
                >
                  Excluir
                </Button>
              </>
            )}
          </div>
        )}
      </header>

      <div className="mt-3 flex flex-col">
        {scores.map((score) => (
          <PlayerScoreCard
            key={score.player.id}
            score={score}
            isLoser={score.player.profile_id === session.loser_profile_id}
          />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 border-t border-ink-800 pt-2.5">
        <span className="text-xs text-ink-400">Gasto do perdedor</span>
        <span
          className={
            session.loser_spent !== null
              ? "font-display text-2xl leading-none tabular-nums text-victory"
              : "text-xs text-ink-400"
          }
        >
          {session.loser_spent !== null ? formatBRL(session.loser_spent) : "Não informado"}
        </span>
      </div>

      <ErrorMessage message={deleteError} />
    </article>
  );
}

export default ScoreboardGameCard;
