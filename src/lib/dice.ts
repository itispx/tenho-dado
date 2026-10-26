import type { DiceSides, DieType } from "@/types/dice";

export const DIE_SIDES: Record<DieType, DiceSides> = {
  d6: 6,
  d20: 20,
};

export const DIE_LABELS: Record<DieType, string> = {
  d6: "D6",
  d20: "D20",
};

export function isDieType(value: unknown): value is DieType {
  return value === "d6" || value === "d20";
}

export function isValidDieValue(value: number, die: DieType): boolean {
  return Number.isInteger(value) && value >= 1 && value <= DIE_SIDES[die];
}
