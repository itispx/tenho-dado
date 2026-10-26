import type { SessionPlayerView, SessionRollView, SessionView } from "@/types/session";

export const REGULAR_ROLLS = 3;

export type TurnPhase =
  | { kind: "regular"; playerId: string; round: number }
  | { kind: "tiebreak"; playerId: string; round: number }
  | { kind: "finished"; loserId: string }
  | { kind: "waiting" };

export interface PlayerScore {
  player: SessionPlayerView;
  regular: { round: number; value: number }[];
  total: number;
  tiebreaks: { round: number; value: number }[];
}

export function orderPlayers(players: SessionPlayerView[]): SessionPlayerView[] {
  return [...players].sort((a, b) => {
    const aOrder = a.turn_order ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.turn_order ?? Number.MAX_SAFE_INTEGER;

    if (aOrder !== bOrder) return aOrder - bOrder;

    return a.joined_at.localeCompare(b.joined_at);
  });
}

function groupRolls(rolls: SessionRollView[]) {
  const regular = new Map<string, Map<number, number>>();
  const tiebreak = new Map<string, Map<number, number>>();

  for (const roll of rolls) {
    const target = roll.is_tiebreak ? tiebreak : regular;
    const playerRolls = target.get(roll.session_player_id) ?? new Map<number, number>();

    playerRolls.set(roll.round, roll.value);
    target.set(roll.session_player_id, playerRolls);
  }

  return { regular, tiebreak };
}

/**
 * Descobre de quem é a próxima jogada. A ordem é sempre a sorteada no início
 * da sessão; no desempate, só os jogadores empatados na menor soma continuam.
 */
export function getTurnPhase(players: SessionPlayerView[], rolls: SessionRollView[]): TurnPhase {
  const ordered = orderPlayers(players);

  if (ordered.length === 0) return { kind: "waiting" };

  const { regular, tiebreak } = groupRolls(rolls);

  for (const player of ordered) {
    const playerRolls = regular.get(player.id) ?? new Map<number, number>();
    const nextRound = playerRolls.size + 1;

    if (nextRound <= REGULAR_ROLLS) {
      return { kind: "regular", playerId: player.id, round: nextRound };
    }
  }

  const totals = new Map(
    ordered.map((player) => {
      const values = [...(regular.get(player.id)?.values() ?? [])];
      const total = values.reduce((sum, value) => sum + value, 0);

      return [player.id, total] as const;
    }),
  );

  const lowestTotal = Math.min(...totals.values());
  let contenders = ordered.filter((player) => totals.get(player.id) === lowestTotal);

  if (contenders.length === 1) {
    return { kind: "finished", loserId: contenders[0].id };
  }

  for (let round = 1; round <= 100; round++) {
    const values = new Map<string, number>();
    let missingPlayer: SessionPlayerView | null = null;

    for (const player of contenders) {
      const value = tiebreak.get(player.id)?.get(round);

      if (value === undefined) {
        missingPlayer ??= player;
      } else {
        values.set(player.id, value);
      }
    }

    if (missingPlayer) {
      return { kind: "tiebreak", playerId: missingPlayer.id, round };
    }

    const lowestValue = Math.min(...values.values());
    const nextContenders = contenders.filter((player) => values.get(player.id) === lowestValue);

    if (nextContenders.length === 1) {
      return { kind: "finished", loserId: nextContenders[0].id };
    }

    contenders = nextContenders;
  }

  return { kind: "waiting" };
}

export function getPlayerScores(session: SessionView): PlayerScore[] {
  const ordered = orderPlayers(session.players);

  return ordered.map((player) => {
    const regular = session.rolls
      .filter((roll) => roll.session_player_id === player.id && !roll.is_tiebreak)
      .sort((a, b) => a.round - b.round)
      .map((roll) => ({ round: roll.round, value: roll.value }));

    const tiebreaks = session.rolls
      .filter((roll) => roll.session_player_id === player.id && roll.is_tiebreak)
      .sort((a, b) => a.round - b.round)
      .map((roll) => ({ round: roll.round, value: roll.value }));

    return {
      player,
      regular,
      total: regular.reduce((sum, roll) => sum + roll.value, 0),
      tiebreaks,
    };
  });
}

export function getCurrentPlayerId(phase: TurnPhase): string | null {
  if (phase.kind === "regular" || phase.kind === "tiebreak") return phase.playerId;

  return null;
}
