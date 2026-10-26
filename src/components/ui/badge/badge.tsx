import clsx from "clsx";

type BadgeVariant = "neutral" | "victory" | "danger" | "ok";

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-ink-700 bg-ink-800 text-ink-200",
  victory: "border-victory/30 bg-victory-bg text-victory",
  danger: "border-danger/30 bg-danger-bg text-danger",
  ok: "border-ok/30 bg-ok-bg text-ok",
};

function Badge({ variant = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-pill border px-2 py-0.5",
        "text-[11px] font-semibold uppercase tracking-wider",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
