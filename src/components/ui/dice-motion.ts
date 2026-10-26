/** Duração do giro até a face final, alinhada com o hop do palco. */
export const DICE_ROLL_MS = 850;

/** Pouso curto de chegada (quando outro jogador rola). */
export const DICE_LAND_MS = 260;

export const HOP_KEYFRAMES: Keyframe[] = [
  { transform: "translateY(0) scale(1)", easing: "cubic-bezier(0.3, 0, 0.7, 0.3)" },
  { offset: 0.12, transform: "translateY(-16px) scale(0.97)", easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" },
  { offset: 0.38, transform: "translateY(-24px) scale(1.02)", easing: "cubic-bezier(0.6, 0, 0.9, 0.5)" },
  { offset: 0.56, transform: "translateY(0) scale(1)", easing: "cubic-bezier(0.2, 0.8, 0.4, 1)" },
  { offset: 0.7, transform: "translateY(0) scale(1.05, 0.92)", easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  { offset: 0.85, transform: "translateY(-3px) scale(0.99, 1.03)" },
  { transform: "translateY(0) scale(1)" },
];
