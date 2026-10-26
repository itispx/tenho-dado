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
    <Card as="section">
      <h2 className="text-sm font-semibold text-ink-200">{title}</h2>

      {items.length === 0 ? (
        <p className="mt-3 text-xs text-ink-400">{emptyText}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((item) => {
            const percent = max > 0 ? (item.value / max) * 100 : 0;

            return (
              <li key={item.id}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-ink-200" title={`@${item.label}`}>
                    @{item.label}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-ink-50">{item.displayValue}</span>
                </div>

                <div className="mt-1 h-1.5 overflow-hidden rounded-pill bg-ink-800">
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
        </ul>
      )}
    </Card>
  );
}

export default BarChart;
