import clsx from "clsx";

import { Pips } from "./pips";

type DiceSize = "sm" | "md" | "lg" | "xl" | "2xl";
type DiceTone = "neutral" | "victory" | "danger" | "muted";

export interface DiceFaceProps {
  value: number | null;
  size?: DiceSize;
  tone?: DiceTone;
  decorative?: boolean;
  className?: string;
}

const sizeClasses: Record<DiceSize, string> = {
  sm: "size-7 rounded-[6px] p-1 gap-0.5",
  md: "size-9 rounded-[8px] p-1.5 gap-0.5",
  lg: "size-12 rounded-lg p-2 gap-1",
  xl: "size-24 rounded-xl p-3 gap-1",
  "2xl": "size-28 rounded-xl p-3.5 gap-1",
};

const toneClasses: Record<DiceTone, string> = {
  neutral: "border-ink-700 bg-ink-800 text-ink-50",
  victory: "border-victory/50 bg-victory-bg text-victory",
  danger: "border-danger/50 bg-danger-bg text-danger",
  muted: "border-dashed border-ink-700 bg-ink-900 text-ink-600",
};

function DiceFace({ value, size = "md", tone = "neutral", decorative = false, className }: DiceFaceProps) {
  const hasValue = value !== null && value >= 1 && value <= 6;

  return (
    <span
      {...(decorative
        ? { "aria-hidden": true as const }
        : { role: "img", "aria-label": value ? `Dado: ${value}` : "Dado ainda não rolado" })}
      className={clsx(
        "grid shrink-0 select-none grid-cols-3 grid-rows-3 border",
        sizeClasses[size],
        hasValue ? toneClasses[tone] : toneClasses.muted,
        className,
      )}
    >
      {hasValue && <Pips value={value} />}
    </span>
  );
}

export default DiceFace;
