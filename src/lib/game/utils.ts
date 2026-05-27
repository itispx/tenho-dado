// REMOVED: DiceTriple type usage — game now uses 1 die per round, not 3
// REMOVED: rollTriple — rolling 3 dice at once no longer applies
// REMOVED: sumTriple — no longer applicable
// REMOVED: isTriple — no longer applicable
// CHANGED: detectCritical — now takes all rolled_values across all rounds

import type { CriticalHit, DiceValue } from "@/types/game";

export function rollDie(): DiceValue {
  return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}

// CHANGED: was detectCritical([a, b, c]: DiceTriple) checking 3 dice in one roll.
// Now receives all rolled_values for a player across all rounds and checks
// whether every value is 6 (critical success) or every value is 1 (critical failure).
export function detectCritical(rolls: number[]): CriticalHit {
  if (rolls.length === 0) return null;
  if (rolls.every((v) => v === 6)) return "hit";
  if (rolls.every((v) => v === 1)) return "miss";
  return null;
}

export function isValidDie(value: unknown): value is DiceValue {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 6;
}
