import clsx from "clsx";

import type { DiceSides } from "@/types/dice";

import { Pips } from "./pips";

type DiceSize = "sm" | "md" | "lg" | "xl" | "2xl";
type DiceTone = "neutral" | "victory" | "danger" | "muted";

export interface DiceFaceProps {
  value: number | null;
  sides?: DiceSides;
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

/** O d20 é desenhado por contorno; aqui o tom vive no texto (currentColor). */
const toneTextClasses: Record<DiceTone, string> = {
  neutral: "text-ink-50",
  victory: "text-victory",
  danger: "text-danger",
  muted: "text-ink-600",
};

const numeralSizeClasses: Record<DiceSize, string> = {
  sm: "text-[0.625rem]",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-4xl",
  "2xl": "text-5xl",
};

function DiceFace({ value, sides = 6, size = "md", tone = "neutral", decorative = false, className }: DiceFaceProps) {
  const isD20 = sides === 20;
  const hasValue = value !== null && value >= 1 && value <= sides;
  const descriptor = isD20 ? "D20" : "Dado";

  return (
    <span
      {...(decorative
        ? { "aria-hidden": true as const }
        : { role: "img", "aria-label": hasValue ? `${descriptor}: ${value}` : `${descriptor} ainda não rolado` })}
      className={clsx(
        "relative grid shrink-0 select-none place-items-center",
        !isD20 && "grid-cols-3 grid-rows-3 border",
        sizeClasses[size],
        hasValue
          ? isD20
            ? toneTextClasses[tone]
            : toneClasses[tone]
          : isD20
            ? toneTextClasses.muted
            : toneClasses.muted,
        className,
      )}
    >
      {isD20 ? (
        <>
          <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" aria-hidden="true">
            <polygon
              points="50,3 92,27 92,73 50,97 8,73 8,27"
              fill="currentColor"
              fillOpacity="0.08"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <polygon
              points="50,20 76,35 76,65 50,80 24,65 24,35"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.28"
              strokeWidth="1.5"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {hasValue && (
            <span className={clsx("relative font-semibold leading-none tabular-nums", numeralSizeClasses[size])}>
              {value}
            </span>
          )}
        </>
      ) : (
        hasValue && <Pips value={value} />
      )}
    </span>
  );
}

export default DiceFace;
