"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { DICE_LAND_MS, DICE_ROLL_MS, HOP_KEYFRAMES } from "../dice-motion";

import { D20_FACE_BY_VALUE, D20_FACES, D20_FACE_SIZE, type D20Face } from "./d20-geometry";

type D20Tone = "neutral" | "victory" | "danger" | "muted";

type Angles = D20Face["angles"];

export interface DiceD20Props {
  value: number | null;
  tone?: D20Tone;
  /** Durante a rolagem o dado gira até assentar na face sorteada. */
  isRolling?: boolean;
  /** Muda a cada jogada registrada; é o gatilho da animação. */
  landKey?: string | number;
  decorative?: boolean;
  className?: string;
}

const DIE_SIZE = 96;
const FACE_OFFSET = (DIE_SIZE - D20_FACE_SIZE) / 2;
const TRIANGLE_CLIP_PATH = "polygon(50% 0%, 93.3% 75%, 6.7% 75%)";
const TRIANGLE_POINTS = "50,0 93.3,75 6.7,75";

const DEFAULT_ANGLES = D20_FACE_BY_VALUE[1].angles;
const FULL_TURNS = { x: 720, y: 1080, z: 360 };

const NUMBER_CLASSES: Record<D20Tone, string> = {
  neutral: "text-ink-50",
  victory: "text-victory",
  danger: "text-danger",
  muted: "text-ink-600",
};

const EDGE_CLASSES: Record<D20Tone, string> = {
  neutral: "text-ink-600",
  victory: "text-victory/35",
  danger: "text-danger/35",
  muted: "text-ink-700",
};

const RESULT_BG_CLASSES: Record<D20Tone, string> = {
  neutral: "bg-ink-700",
  victory: "bg-victory-bg",
  danger: "bg-danger-bg",
  muted: "bg-ink-800",
};

const RESULT_EDGE_CLASSES: Record<D20Tone, string> = {
  neutral: "text-ink-50",
  victory: "text-victory",
  danger: "text-danger",
  muted: "text-ink-600",
};

const DIM_EDGE_CLASSES: Record<D20Tone, string> = {
  neutral: "text-ink-700",
  victory: "text-victory/15",
  danger: "text-danger/15",
  muted: "text-ink-800",
};

const DIM_NUMBER_CLASSES: Record<D20Tone, string> = {
  neutral: "text-ink-500",
  victory: "text-victory/35",
  danger: "text-danger/35",
  muted: "text-ink-700",
};

const FACE_SHADES = [
  "brightness-[1.06]",
  "brightness-[0.9]",
  "brightness-[0.97]",
  "brightness-[0.84]",
  "brightness-[1.02]",
  "brightness-[0.93]",
];

function anglesToTransform({ x, y, z }: Angles): string {
  return `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
}

function DiceD20({ value, tone = "neutral", isRolling = false, landKey, decorative = false, className }: DiceD20Props) {
  const initialFace = value !== null ? D20_FACE_BY_VALUE[value] : undefined;

  const dieRef = useRef<HTMLSpanElement>(null);
  const hopRef = useRef<HTMLSpanElement>(null);
  const currentAngles = useRef<Angles>(initialFace?.angles ?? DEFAULT_ANGLES);
  const hasMounted = useRef(false);
  const lastLandKey = useRef<string | number | undefined>(undefined);

  const [initialTransform] = useState(() => anglesToTransform(initialFace?.angles ?? DEFAULT_ANGLES));

  // Começo de uma nova rolagem: cancela o que ficou preenchido do anterior.
  useEffect(() => {
    if (!isRolling) return;

    dieRef.current?.getAnimations().forEach((animation) => animation.cancel());
    hopRef.current?.getAnimations().forEach((animation) => animation.cancel());
  }, [isRolling]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      lastLandKey.current = landKey;
      return;
    }

    if (landKey === lastLandKey.current) return;

    lastLandKey.current = landKey;

    if (value === null) return;

    const face = D20_FACE_BY_VALUE[value];

    if (!face) return;

    const from = currentAngles.current;
    const to = face.angles;

    currentAngles.current = to;

    const die = dieRef.current;

    if (!die) return;

    // A orientação final fica no style: ao terminar a animação, o dado não pisca.
    die.style.transform = anglesToTransform(to);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) return;

    die.getAnimations().forEach((animation) => animation.cancel());
    hopRef.current?.getAnimations().forEach((animation) => animation.cancel());

    if (isRolling) {
      // Duas voltas em X, três em Y e uma em Z, alternando o sentido
      // conforme a face sorteada, até parar na face.
      const direction = value % 2 === 0 ? 1 : -1;
      const spinTo = {
        x: to.x + FULL_TURNS.x * direction,
        y: to.y + FULL_TURNS.y * direction,
        z: to.z + FULL_TURNS.z * direction,
      };

      die.animate([{ transform: anglesToTransform(from) }, { transform: anglesToTransform(spinTo) }], {
        duration: DICE_ROLL_MS,
        easing: "cubic-bezier(0.16, 0.72, 0.27, 1)",
      });

      hopRef.current?.animate(HOP_KEYFRAMES, { duration: DICE_ROLL_MS, fill: "both" });
      return;
    }

    // Chegada remota: só o encaixe, sem tumble.
    die.animate(
      [
        { transform: anglesToTransform({ x: to.x - 10, y: to.y - 12, z: to.z - 6 }) },
        { transform: anglesToTransform(to) },
      ],
      { duration: DICE_LAND_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [isRolling, landKey, value]);

  const hasValue = value !== null && value >= 1 && value <= 20;

  return (
    <span
      {...(decorative
        ? { "aria-hidden": true as const }
        : { role: "img", "aria-label": hasValue ? `D20: ${value}` : "D20 ainda não rolado" })}
      className={clsx("relative my-3 inline-flex size-24 shrink-0", className)}
    >
      <span
        ref={hopRef}
        className={clsx("size-full", isRolling && "scale-y-95")}
        style={{ transformStyle: "preserve-3d", perspective: "700px" }}
      >
        <span
          className="block size-full"
          style={{ transformStyle: "preserve-3d", transform: "rotateX(-4deg) rotateY(-6deg)" }}
        >
          <span
            ref={dieRef}
            className="relative block size-full"
            style={{ transformStyle: "preserve-3d", transform: initialTransform }}
          >
            {D20_FACES.map((face, index) => {
              const isResult = hasValue && !isRolling && face.value === value;
              const isDimmed = hasValue && !isRolling && !isResult;

              return (
                <span
                  key={face.value}
                  aria-hidden="true"
                  className="absolute [backface-visibility:hidden]"
                  style={{
                    left: FACE_OFFSET,
                    top: FACE_OFFSET,
                    width: D20_FACE_SIZE,
                    height: D20_FACE_SIZE,
                    transform: face.transform,
                  }}
                >
                  <span
                    className={clsx(
                      "absolute inset-0 transition-[filter,background-color] duration-200",
                      !hasValue ? "bg-ink-900" : isResult ? RESULT_BG_CLASSES[tone] : "bg-ink-800",
                      !hasValue
                        ? undefined
                        : isResult
                          ? "brightness-[1.08]"
                          : isDimmed
                            ? "brightness-[0.62]"
                            : FACE_SHADES[index % FACE_SHADES.length],
                    )}
                    style={{ clipPath: TRIANGLE_CLIP_PATH }}
                  />

                  <svg
                    className={clsx(
                      "absolute inset-0 size-full transition-colors duration-200",
                      !hasValue
                        ? EDGE_CLASSES.muted
                        : isResult
                          ? RESULT_EDGE_CLASSES[tone]
                          : isDimmed
                            ? DIM_EDGE_CLASSES[tone]
                            : EDGE_CLASSES[tone],
                    )}
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                  >
                    <polygon
                      points={TRIANGLE_POINTS}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={isResult ? 2.5 : 1.5}
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  {hasValue && (
                    <span
                      className={clsx(
                        "absolute inset-0 grid place-items-center font-semibold leading-none tabular-nums transition-colors duration-200",
                        isResult ? "text-2xl" : isDimmed ? "text-lg" : "text-xl",
                        isResult ? NUMBER_CLASSES[tone] : isDimmed ? DIM_NUMBER_CLASSES[tone] : NUMBER_CLASSES[tone],
                      )}
                    >
                      {face.value}
                    </span>
                  )}
                </span>
              );
            })}
          </span>
        </span>
      </span>
    </span>
  );
}

export default DiceD20;
