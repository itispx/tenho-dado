import clsx from "clsx";
import Link from "next/link";

export type ReportTab = "quadro" | "analytics";

const tabs: { key: ReportTab; href: string; label: string }[] = [
  { key: "quadro", href: "/game/quadro", label: "Quadro" },
  { key: "analytics", href: "/game/analytics", label: "Análises" },
];

export interface ReportTabsProps {
  current: ReportTab;
}

function ReportTabs({ current }: ReportTabsProps) {
  return (
    <nav aria-label="Relatórios" className="flex gap-1 rounded-lg border border-ink-800 bg-ink-900 p-1">
      {tabs.map((tab) => {
        const isCurrent = tab.key === current;

        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isCurrent ? "page" : undefined}
            className={clsx(
              "inline-flex h-11 flex-1 items-center justify-center rounded-md px-3 text-sm font-semibold transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
              isCurrent ? "bg-ink-800 text-ink-50" : "text-ink-400 hover:bg-ink-800/60 hover:text-ink-200",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default ReportTabs;
