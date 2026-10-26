"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";

import { Pips } from "../dice-face/pips";

type CubeTone = "neutral" | "victory" | "danger" | "muted";

export interface DiceCubeProps {
  value: number | null;
  tone?: CubeTone;
  /** Durante a rolagem o cubo espera o valor e então gira até a face sorteada. */
  isRolling?: boolean;
  /** Muda a cada jogada registrada; é o gatilho da animação. */
  landKey?: string | number;
  decorative?: boolean;
  className?: string;
}

/** Lado da face em px (o cubo inteiro mede 96px). */
const HALF = 47;

/** Duração do giro até a face final, alinhada com o hop do palco. */
const SPIN_MS = 850;

/** Pouso curto de chegada (quando outro jogador rola). */
const LAND_MS = 260;

const ORIENTATION: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  6: { x: 0, y: 180 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  2: { x: -90, y: 0 },
  5: { x: 90, y: 0 },
};

/**
 * Faces canônicas: opostas somam 7, como num dado de verdade.
 * Em CSS o eixo Y aponta para baixo, então rotateX(90deg) é o topo.
 */
const FACES: { value: number; transform: string; shade: string }[] = [
  { value: 1, transform: `translateZ(${HALF}px)`, shade: "brightness-[1.03]" },
  { value: 6, transform: `rotateY(180deg) translateZ(${HALF}px)`, shade: "brightness-[0.9]" },
  { value: 3, transform: `rotateY(90deg) translateZ(${HALF}px)`, shade: "brightness-[0.95]" },
  { value: 4, transform: `rotateY(-90deg) translateZ(${HALF}px)`, shade: "brightness-[0.76]" },
  { value: 2, transform: `rotateX(90deg) translateZ(${HALF}px)`, shade: "brightness-[1.12]" },
  { value: 5, transform: `rotateX(-90deg) translateZ(${HALF}px)`, shade: "brightness-[0.68]" },
];

const TONE_CLASSES: Record<CubeTone, string> = {
  neutral: "border-ink-700 bg-ink-800 text-ink-50",
  victory: "border-victory/50 bg-victory-bg text-victory",
  danger: "border-danger/50 bg-danger-bg text-danger",
  muted: "border-ink-700 bg-ink-900 text-ink-600",
};

const HOP_KEYFRAMES: Keyframe[] = [
  { transform: "translateY(0) scale(1)", easing: "cubic-bezier(0.3, 0, 0.7, 0.3)" },
  { offset: 0.12, transform: "translateY(-16px) scale(0.97)", easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" },
  { offset: 0.38, transform: "translateY(-24px) scale(1.02)", easing: "cubic-bezier(0.6, 0, 0.9, 0.5)" },
  { offset: 0.56, transform: "translateY(0) scale(1)", easing: "cubic-bezier(0.2, 0.8, 0.4, 1)" },
  { offset: 0.7, transform: "translateY(0) scale(1.05, 0.92)", easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  { offset: 0.85, transform: "translateY(-3px) scale(0.99, 1.03)" },
  { transform: "translateY(0) scale(1)" },
];

function transformFor(x: number, y: number): string {
  return `rotateX(${x}deg) rotateY(${y}deg)`;
}

function orientationFor(value: number | null): { x: number; y: number } {
  return (value !== null && ORIENTATION[value]) || { x: 0, y: 0 };
}

function DiceCube({
  value,
  tone = "neutral",
  isRolling = false,
  landKey,
  decorative = false,
  className,
}: DiceCubeProps) {
  const cubeRef = useRef<HTMLSpanElement>(null);
  const hopRef = useRef<HTMLSpanElement>(null);
  const orientation = useRef({ x: 0, y: 0 });
  const lastLandKey = useRef<string | number | undefined>(undefined);

  // Começo de uma nova rolagem: cancela o que ficou preenchido do anterior.
  useEffect(() => {
    if (!isRolling) return;

    cubeRef.current?.getAnimations().forEach((animation) => animation.cancel());
    hopRef.current?.getAnimations().forEach((animation) => animation.cancel());
  }, [isRolling]);

  useEffect(() => {
    const cube = cubeRef.current;

    if (!cube) return;

    const isFirst = lastLandKey.current === undefined;
    const isNewRoll = landKey !== lastLandKey.current;

    if (!isFirst && !isNewRoll) return;

    const target = orientationFor(value);
    const from = orientation.current;
    const wasRolling = !isFirst && isRolling;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    lastLandKey.current = landKey;

    // O estado final fica no style: ao terminar a animação, o cubo não pisca.
    cube.style.transform = transformFor(target.x, target.y);
    orientation.current = target;

    if (isFirst || reduceMotion || value === null) return;

    cube.getAnimations().forEach((animation) => animation.cancel());

    if (wasRolling) {
      // Gira duas voltas em X e três em Y e para exatamente na face sorteada.
      cube.animate(
        [{ transform: transformFor(from.x, from.y) }, { transform: transformFor(target.x + 720, target.y + 1080) }],
        { duration: SPIN_MS, easing: "cubic-bezier(0.16, 0.72, 0.27, 1)" },
      );

      hopRef.current?.animate(HOP_KEYFRAMES, { duration: SPIN_MS, fill: "both" });
      return;
    }

    // Chegada remota: só o encaixe, sem tumble.
    cube.animate(
      [{ transform: transformFor(target.x - 10, target.y - 12) }, { transform: transformFor(target.x, target.y) }],
      { duration: LAND_MS, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [isRolling, landKey, value]);

  const hasValue = value !== null && value >= 1 && value <= 6;

  return (
    <span
      {...(decorative
        ? { "aria-hidden": true as const }
        : { role: "img", "aria-label": value ? `Dado: ${value}` : "Dado ainda não rolado" })}
      className={clsx("relative my-3 inline-flex size-24 shrink-0", className)}
    >
      <span
        ref={hopRef}
        className={clsx("size-full", isRolling && "scale-y-95")}
        style={{ transformStyle: "preserve-3d", perspective: "700px" }}
      >
        <span
          className="block size-full"
          style={{ transformStyle: "preserve-3d", transform: "rotateX(-14deg) rotateY(-18deg)" }}
        >
          <span ref={cubeRef} className="relative block size-full" style={{ transformStyle: "preserve-3d" }}>
            {FACES.map((face) => (
              <span
                key={face.value}
                data-face={face.value}
                style={{ transform: face.transform }}
                className={clsx(
                  "absolute inset-0 grid grid-cols-3 grid-rows-3 rounded-md border p-3",
                  "[backface-visibility:hidden]",
                  TONE_CLASSES[hasValue ? tone : "muted"],
                  hasValue && face.shade,
                )}
              >
                {hasValue && <Pips value={face.value} />}
              </span>
            ))}
          </span>
        </span>
      </span>
    </span>
  );
}

export default DiceCube;
