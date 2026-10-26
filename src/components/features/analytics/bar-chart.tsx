import clsx from "clsx";

import Card from "@/components/ui/card/card";
import type { AnalyticsBarItem } from "@/lib/analytics";

export interface BarChartProps {
  title: string;
  items: AnalyticsBarItem[];
  variant: "danger" | "victory";
  emptyText: string;
}

function BarChart({ title, items, variant, emptyText }: BarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 0);

  return (
    <Card as="section" aria-label={title}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[0.9375rem] font-semibold text-ink-50">{title}</h2>
        {items.length > 0 && (
          <p className="text-xs text-ink-400">
            {items.length} {items.length === 1 ? "jogador" : "jogadores"}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-[0.8125rem] text-ink-400">{emptyText}</p>
      ) : (
        <ol className="mt-3 flex flex-col gap-3.5">
          {items.map((item, index) => {
            const scale = max > 0 && item.value > 0 ? Math.max(item.value / max, 0.02) : 0;

            return (
              <li key={item.id}>
                <div className="flex items-baseline gap-3">
                  <span className="w-4 shrink-0 text-xs font-semibold tabular-nums text-ink-400">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-200" title={`@${item.label}`}>
                    @{item.label}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-50">{item.displayValue}</span>
                </div>

                <div className="ml-7 mt-1.5 h-2 overflow-hidden rounded-pill bg-ink-800" aria-hidden="true">
                  <div
                    className={clsx(
                      "h-full w-full origin-left rounded-pill transition-transform duration-500 ease-out motion-reduce:transition-none",
                      variant === "danger" ? "bg-danger" : "bg-victory",
                    )}
                    style={{ transform: `scaleX(${scale})` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

export default BarChart;
