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
        <h2 className="text-[15px] font-semibold text-ink-50">{title}</h2>
        {items.length > 0 && (
          <p className="text-xs text-ink-400">
            {items.length} {items.length === 1 ? "jogador" : "jogadores"}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-3 text-[13px] text-ink-400">{emptyText}</p>
      ) : (
        <ol className="mt-3 flex flex-col gap-3.5">
          {items.map((item, index) => {
            const percent = max > 0 ? (item.value / max) * 100 : 0;

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
                      "h-full rounded-pill transition-[width] duration-500 ease-out",
                      variant === "danger" ? "bg-danger" : "bg-victory",
                    )}
                    style={{ width: `${Math.max(percent, 2)}%` }}
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
