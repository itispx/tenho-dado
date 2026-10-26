"use client";

import Button from "@/components/ui/button/button";
import DiceFace from "@/components/ui/dice-face/dice-face";
import { SCOREBOARD_ADMIN_USERNAME } from "@/lib/constants";
import { formatBRL } from "@/lib/format";
import { getPlayerScores } from "@/lib/session-logic";
import type { SessionView } from "@/types/session";

import PlayerScoreCard from "./player-score";
import SpentModal from "./spent-modal";

export interface SessionResultProps {
  session: SessionView;
  me: { id: string; username: string };
  onChanged: () => Promise<void>;
  onLeave: () => void;
}

function SessionResult({ session, me, onChanged, onLeave }: SessionResultProps) {
  const scores = getPlayerScores(session);
  const loserScore = scores.find((score) => score.player.profile_id === session.loser_profile_id) ?? null;
  const isLoser = session.loser_profile_id === me.id;
  const isItspx = me.username === SCOREBOARD_ADMIN_USERNAME;
  const isAdder = loserScore?.player.added_by === me.id;
  const canRegisterSpent = isLoser || isAdder || isItspx;
  const isDebtPending = canRegisterSpent && session.loser_spent === null;

  /** Quem responde pelo gasto quando o perdedor não registra por si. */
  const responsibleUsername =
    loserScore?.player.added_by_username ?? (loserScore?.player.is_managed ? SCOREBOARD_ADMIN_USERNAME : null);

  const orderedScores = [...scores].sort((a, b) => {
    const aIsLoser = a.player.profile_id === session.loser_profile_id;
    const bIsLoser = b.player.profile_id === session.loser_profile_id;

    if (aIsLoser) return 1;
    if (bIsLoser) return -1;

    return b.total - a.total;
  });

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-danger/30 bg-danger-bg p-5 text-center">
        <span aria-hidden="true" className="inline-block animate-laugh text-7xl leading-none">
          😂
        </span>

        <h2 className="mt-2 break-words font-display text-4xl uppercase leading-none tracking-wide text-ink-50">
          {loserScore ? `${loserScore.player.username} é o otário` : "Sessão encerrada"}
        </h2>

        {loserScore && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {loserScore.regular.map((roll) => (
              <DiceFace key={roll.round} value={roll.value} size="md" tone="danger" />
            ))}

            {loserScore.tiebreaks.map((roll) => (
              <DiceFace key={`tiebreak-${roll.round}`} value={roll.value} size="md" tone="danger" />
            ))}
          </div>
        )}

        {loserScore && (
          <p className="mt-2 text-sm text-ink-200">
            {loserScore.tiebreaks.length > 0 ? (
              "Perdeu no dado extra."
            ) : (
              <>
                Menor soma da mesa: <span className="font-semibold tabular-nums text-danger">{loserScore.total}</span>
              </>
            )}
          </p>
        )}
      </section>

      {session.loser_spent !== null && (
        <div className="flex items-center justify-between gap-3 border-y border-ink-800 py-3" aria-live="polite">
          <span className="text-sm text-ink-200">@{loserScore?.player.username} gastou</span>
          <span className="text-2xl font-semibold leading-none tabular-nums text-victory">
            {formatBRL(session.loser_spent)}
          </span>
        </div>
      )}

      {!canRegisterSpent && session.loser_spent === null && session.loser_profile_id !== null && (
        <p className="text-center text-xs text-ink-400" aria-live="polite">
          {responsibleUsername
            ? `Aguardando @${responsibleUsername} registrar quanto @${loserScore?.player.username} gastou…`
            : `Aguardando @${loserScore?.player.username} registrar quanto gastou…`}
        </p>
      )}

      <section className="flex flex-col" aria-label="Resultado da sessão">
        {orderedScores.map((score) => (
          <PlayerScoreCard
            key={score.player.id}
            score={score}
            isMe={score.player.profile_id === me.id}
            isLoser={score.player.profile_id === session.loser_profile_id}
          />
        ))}
      </section>

      {!isDebtPending && (
        <Button type="button" variant="outline" onClick={onLeave}>
          Voltar para a tela principal
        </Button>
      )}

      {isDebtPending && (
        <SpentModal
          sessionId={session.id}
          loserName={loserScore?.player.username ?? me.username}
          forSelf={isLoser}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}

export default SessionResult;
