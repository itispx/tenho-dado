import clsx from "clsx";

type CardTone = "surface" | "victory" | "danger" | "plain";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article" | "li";
  tone?: CardTone;
  children: React.ReactNode;
}

const toneClasses: Record<CardTone, string> = {
  surface: "border-ink-800 bg-ink-900",
  plain: "border-ink-800 bg-transparent",
  victory: "border-victory/30 bg-victory-bg",
  danger: "border-danger/30 bg-danger-bg",
};

function Card({ as = "div", tone = "surface", className, children, ...rest }: CardProps) {
  const Tag = as as React.ElementType;

  return (
    <Tag className={clsx("rounded-lg border p-4", toneClasses[tone], className)} {...rest}>
      {children}
    </Tag>
  );
}

export default Card;
