"use client";

import { useRef, useState } from "react";

import { cancelGameAction, rollDiceAction, submitManualRollAction } from "@/actions/session";
import Badge from "@/components/ui/badge/badge";
import Button from "@/components/ui/button/button";
import DiceCube from "@/components/ui/dice-cube/dice-cube";
import DiceFace from "@/components/ui/dice-face/dice-face";
import ErrorMessage from "@/components/ui/error-message/error-message";
import { SCOREBOARD_ADMIN_USERNAME, SESSION_MODE_LABELS } from "@/lib/constants";
import { canActForPlayer } from "@/lib/roll-permissions";
import { getPlayerScores, getTurnPhase } from "@/lib/session-logic";
import type { SessionView } from "@/types/session";

import PlayerScoreCard from "./player-score";

export interface SessionGameProps {
  session: SessionView;
  me: { id: string; username: string };
  onChanged: () => Promise<void>;
}

/** Duração do giro do cubo. O dado só termina de rolar depois disso. */
const ROLL_ANIM_MS = 850;

function SessionGame({ session, me, onChanged }: SessionGameProps) {
  const scores = getPlayerScores(session);
  const phase = getTurnPhase(session.players, session.rolls);
  const isHost = session.host_id === me.id;

  const currentPlayer =
    phase.kind === "regular" || phase.kind === "tiebreak"
      ? (session.players.find((player) => player.id === phase.playerId) ?? null)
      : null;

  const isMyTurn = currentPlayer?.profile_id === me.id;
  const isItspx = me.username === SCOREBOARD_ADMIN_USERNAME;
  const canRollNow = Boolean(
    currentPlayer && canActForPlayer(currentPlayer, me.id, { isHost, isScoreboardAdmin: isItspx }),
  );
  const canRollForCurrent = canRollNow && !isMyTurn;
  const hasTurn = phase.kind === "regular" || phase.kind === "tiebreak";

  const rollingRef = useRef(false);
  const manualRollRef = useRef(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const currentScore = currentPlayer ? scores.find((score) => score.player.id === currentPlayer.id) : null;
  const currentRolls = phase.kind === "tiebreak" ? (currentScore?.tiebreaks ?? []) : (currentScore?.regular ?? []);
  const lastValue = currentRolls.length > 0 ? currentRolls[currentRolls.length - 1].value : null;
  const landKey = currentPlayer ? `${currentPlayer.id}:${currentRolls.length}` : undefined;

  const phaseLabel =
    phase.kind === "regular"
      ? `Jogada ${phase.round} de 3`
      : phase.kind === "tiebreak"
        ? `Desempate · dado ${phase.round}`
        : "Fechando a sessão";

  const headline = !hasTurn
    ? phase.kind === "finished"
      ? "Calculando o perdedor"
      : "Preparando a mesa"
    : isMyTurn
      ? "Sua vez"
      : canRollForCurrent
        ? "Rolar por"
        : "Aguardando";

  async function handleRoll() {
    if (rollingRef.current) return;

    rollingRef.current = true;
    setIsRolling(true);
    setError(null);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let landed = false;

    try {
      const result = await rollDiceAction(session.id);

      if (result.error) {
        setError(result.error);
        return;
      }

      await onChanged();

      // O cubo gira só depois de saber a face: o tempo do giro é respeitado
      // mesmo quando o servidor responde antes. Sem animação, não há espera.
      if (!reduceMotion) {
        await new Promise((resolve) => setTimeout(resolve, ROLL_ANIM_MS));
      }

      landed = true;
    } catch {
      setError("Erro ao rolar o dado. Tente novamente.");
    } finally {
      if (landed) navigator.vibrate?.(12);

      setIsRolling(false);
      rollingRef.current = false;
    }
  }

  async function handleManualRoll(value: number) {
    if (manualRollRef.current) return;
    if (phase.kind !== "regular" && phase.kind !== "tiebreak") return;

    manualRollRef.current = true;
    setIsSubmittingManual(true);
    setError(null);

    try {
      const result = await submitManualRollAction(session.id, phase.playerId, value);

      if (result.error) {
        setError(result.error);
      } else {
        await onChanged();
      }
    } catch {
      setError("Erro ao registrar a jogada. Tente novamente.");
    } finally {
      setIsSubmittingManual(false);
      manualRollRef.current = false;
    }
  }

  async function handleCancelGame() {
    setIsCancelling(true);
    setError(null);

    const result = await cancelGameAction(session.id);

    if (result.error) {
      setError(result.error);
      setIsCancelling(false);
      return;
    }

    await onChanged();
    setIsCancelling(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-ink-800 bg-ink-900 p-5" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="victory">{SESSION_MODE_LABELS[session.mode]}</Badge>
          <p className="text-xs tabular-nums text-ink-400">{phaseLabel}</p>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4 text-center">
          <DiceCube value={lastValue} isRolling={isRolling} landKey={landKey} tone={isMyTurn ? "victory" : "neutral"} />

          <div className="flex flex-col gap-1">
            <h2 className="font-display text-4xl uppercase leading-none tracking-wide text-ink-50">{headline}</h2>
            <p className="text-xs text-ink-400">
              {currentPlayer ? `@${currentPlayer.username}${currentPlayer.is_managed ? " (gerido)" : ""}` : "Mesa"}
            </p>
          </div>

          {phase.kind === "tiebreak" && (
            <p className="rounded-md border border-victory/30 bg-victory-bg px-3 py-2 text-xs font-semibold text-victory">
              Empate na menor soma: vale só o dado extra.
            </p>
          )}

          {session.mode === "online" && canRollNow && hasTurn && (
            <Button type="button" onClick={handleRoll} isLoading={isRolling} loadingLabel="Rolando…">
              Rolar dado
            </Button>
          )}

          {session.mode === "manual" && isHost && hasTurn && (
            <div className="grid w-full grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleManualRoll(value)}
                  disabled={isSubmittingManual}
                  aria-label={`Registrar ${value}`}
                  className="flex items-center justify-center rounded-md border border-ink-700 bg-ink-950/40 py-2.5 transition-colors duration-150 hover:border-victory/50 hover:bg-victory-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:opacity-40"
                >
                  <DiceFace value={value} size="md" decorative />
                </button>
              ))}
            </div>
          )}

          {session.mode === "manual" && !isHost && hasTurn && (
            <p className="text-xs text-ink-400">O criador registra a jogada.</p>
          )}
        </div>
      </section>

      <section className="flex flex-col" aria-label="Placar da sessão">
        {scores.map((score) => (
          <PlayerScoreCard
            key={score.player.id}
            score={score}
            isCurrent={currentPlayer?.id === score.player.id}
            isMe={score.player.profile_id === me.id}
          />
        ))}
      </section>

      <ErrorMessage message={error} />

      {isHost && (
        <div className="flex items-center justify-center gap-2 py-1">
          {confirmCancel ? (
            <>
              <Button type="button" variant="ghost" size="sm" fullWidth={false} onClick={() => setConfirmCancel(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                fullWidth={false}
                onClick={handleCancelGame}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelando…" : "Confirmar cancelamento"}
              </Button>
            </>
          ) : (
            <Button type="button" variant="ghost" size="sm" fullWidth={false} onClick={() => setConfirmCancel(true)}>
              Cancelar jogo e voltar ao lobby
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default SessionGame;
