"use client";

import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";

import Card from "@/components/ui/card/card";
import ErrorMessage from "@/components/ui/error-message/error-message";
import Input from "@/components/ui/input/input";
import { buildAnalytics } from "@/lib/analytics";
import { formatBRL, toDateInputValue } from "@/lib/format";
import type { AnalyticsEntry } from "@/types/scoreboard";
import type { ProfileOption } from "@/types/session";

import BarChart from "./bar-chart";

export interface AnalyticsProps {
  entries: AnalyticsEntry[];
  profiles: ProfileOption[];
}

interface SummaryCellProps {
  label: string;
  value: string;
  detail?: string;
  variant?: "number" | "name";
}

type PeriodKey = "all" | "30" | "90";
type PeriodPreset = PeriodKey | "custom";

const presets: { key: PeriodKey; label: string }[] = [
  { key: "all", label: "Tudo" },
  { key: "30", label: "30 dias" },
  { key: "90", label: "90 dias" },
];

function presetRange(days: number) {
  const end = new Date();
  const start = new Date();

  start.setDate(start.getDate() - (days - 1));

  return { startDate: toDateInputValue(start.toISOString()), endDate: toDateInputValue(end.toISOString()) };
}

function formatInputDate(value: string): string {
  return value.split("-").reverse().join("/");
}

function SummaryCell({ label, value, detail, variant = "number" }: SummaryCellProps) {
  return (
    <div className="min-w-0 bg-ink-900 p-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p
        className={clsx(
          "mt-1.5 break-words font-semibold leading-tight tabular-nums text-ink-50",
          variant === "number" ? "text-xl" : "text-[15px]",
        )}
      >
        {value}
      </p>
      {detail && <p className="mt-1 text-xs leading-snug text-ink-400">{detail}</p>}
    </div>
  );
}

function Analytics({ entries, profiles }: AnalyticsProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [preset, setPreset] = useState<PeriodPreset>("all");

  const { invalidRange, totalGames, totalSpent, averageSpent, lossItems, spendItems } = useMemo(
    () => buildAnalytics(entries, profiles, startDate, endDate),
    [entries, profiles, startDate, endDate],
  );

  const topLoser = lossItems[0] ?? null;
  const hasFilter = Boolean(startDate || endDate);

  const rangeSummary =
    startDate || endDate
      ? `${startDate ? formatInputDate(startDate) : "início"} – ${endDate ? formatInputDate(endDate) : "hoje"}`
      : "Todo o período";

  function applyPreset(key: PeriodKey) {
    if (key === "all") {
      setStartDate("");
      setEndDate("");
    } else {
      const range = presetRange(key === "30" ? 30 : 90);

      setStartDate(range.startDate);
      setEndDate(range.endDate);
    }

    setPreset(key);
  }

  function clearFilter() {
    setStartDate("");
    setEndDate("");
    setPreset("all");
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.length === 0 ? (
        <Card as="section" className="text-center">
          <p className="text-[15px] font-semibold text-ink-50">Nenhuma partida finalizada ainda.</p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-ink-400">
            As análises aparecem assim que a primeira partida terminar.
          </p>
          <Link
            href="/game/quadro"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-lg border border-ink-700 px-3 text-sm font-semibold text-ink-200 transition-colors duration-150 hover:border-ink-600 hover:text-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
          >
            Ver o quadro
          </Link>
        </Card>
      ) : (
        <>
          <Card as="section" aria-labelledby="analytics-period">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <h2 id="analytics-period" className="text-[15px] font-semibold text-ink-50">
                Período
              </h2>

              <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Atalhos de período">
                {presets.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={preset === item.key}
                    onClick={() => applyPreset(item.key)}
                    className={clsx(
                      "inline-flex h-8 items-center justify-center rounded-pill border px-3 text-xs font-semibold transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900",
                      preset === item.key
                        ? "border-ink-600 bg-ink-800 text-ink-50"
                        : "border-ink-800 text-ink-400 hover:border-ink-700 hover:text-ink-200",
                    )}
                  >
                    {item.label}
                  </button>
                ))}

                {hasFilter && (
                  <button
                    type="button"
                    onClick={clearFilter}
                    className="inline-flex h-8 items-center justify-center rounded-pill px-2.5 text-xs font-semibold text-ink-400 transition-colors duration-150 hover:text-ink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
                  >
                    Limpar
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Input
                id="analytics-start"
                label="Data inicial"
                name="analytics-start"
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setPreset("custom");
                }}
              />

              <Input
                id="analytics-end"
                label="Data final"
                name="analytics-end"
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setPreset("custom");
                }}
              />
            </div>

            <p className="mt-2.5 text-xs text-ink-400" aria-live="polite">
              {rangeSummary} · {totalGames} {totalGames === 1 ? "partida" : "partidas"}
            </p>

            {invalidRange && (
              <div className="mt-3">
                <ErrorMessage message="A data inicial não pode ser depois da data final." />
              </div>
            )}
          </Card>

          <section
            className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink-800 bg-ink-800 md:grid-cols-4"
            aria-label="Resumo do período"
          >
            <SummaryCell label="Partidas" value={String(totalGames)} />
            <SummaryCell label="Total gasto" value={formatBRL(totalSpent)} />
            <SummaryCell
              label="Gasto médio"
              value={averageSpent > 0 ? formatBRL(averageSpent) : "—"}
              detail="por partida com gasto"
            />
            <SummaryCell
              label="Mais perdeu"
              value={topLoser ? `@${topLoser.label}` : "—"}
              detail={
                topLoser
                  ? `${topLoser.value} ${topLoser.value === 1 ? "derrota" : "derrotas"}`
                  : "sem derrotas no período"
              }
              variant="name"
            />
          </section>

          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            <BarChart
              title="Quem mais perdeu"
              items={lossItems}
              variant="danger"
              emptyText="Nenhuma derrota no período."
            />

            <BarChart
              title="Quem mais gastou"
              items={spendItems}
              variant="victory"
              emptyText="Nenhum gasto no período."
            />
          </div>

          <p className="text-center text-xs text-ink-400">O período considera a data de término de cada partida.</p>
        </>
      )}
    </div>
  );
}

export default Analytics;
