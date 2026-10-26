import clsx from "clsx";

import DiceFace from "@/components/ui/dice-face/dice-face";
import type { PlayerScore } from "@/lib/session-logic";

export interface PlayerScoreCardProps {
  score: PlayerScore;
  isCurrent?: boolean;
  isLoser?: boolean;
  isMe?: boolean;
}

function PlayerScoreCard({ score, isCurrent = false, isLoser = false, isMe = false }: PlayerScoreCardProps) {
  const meta = [
    score.player.is_host ? "criador" : null,
    isMe ? "você" : null,
    score.player.is_managed ? "gerido" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      aria-label={`Jogador ${score.player.username}`}
      className={clsx(
        "flex items-center gap-3 border-b border-ink-800 px-1 py-3 last:border-b-0",
        isLoser && "bg-danger-bg/60",
        isCurrent && !isLoser && "bg-victory-bg/50",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={clsx("truncate text-sm font-semibold", isLoser ? "text-danger" : "text-ink-50")}>
          @{score.player.username}
        </p>
        <p className="truncate text-xs text-ink-400">{isLoser ? "o otário da vez" : meta || "—"}</p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="flex items-center gap-1.5" role="group" aria-label="Rodadas 1 a 3">
          {[1, 2, 3].map((round) => {
            const roll = score.regular.find((item) => item.round === round);

            return <DiceFace key={round} value={roll?.value ?? null} size="sm" tone={isLoser ? "danger" : "neutral"} />;
          })}
        </div>

        {score.tiebreaks.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-ink-400">desempate</span>
            {score.tiebreaks.map((roll) => (
              <DiceFace key={roll.round} value={roll.value} size="sm" tone="victory" />
            ))}
          </div>
        )}
      </div>

      <div className="flex w-9 shrink-0 flex-col items-end">
        <p className={clsx("text-lg font-semibold leading-none tabular-nums", isLoser ? "text-danger" : "text-ink-50")}>
          <span className="sr-only">Soma: </span>
          {score.total}
        </p>
        <p className="mt-1 text-xs leading-none text-ink-400">soma</p>
      </div>
    </article>
  );
}

export default PlayerScoreCard;
