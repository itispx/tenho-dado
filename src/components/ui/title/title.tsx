import DiceFace from "@/components/ui/dice-face/dice-face";

export interface TitleProps {
  title: string;
  subtitle: string | null;
}

function Title({ title, subtitle }: TitleProps) {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      <DiceFace value={5} size="lg" tone="victory" decorative />

      <h1 className="font-display text-5xl uppercase leading-none tracking-wider text-ink-50">{title}</h1>

      {subtitle && <p className="text-sm text-ink-400">{subtitle}</p>}
    </header>
  );
}

export default Title;
