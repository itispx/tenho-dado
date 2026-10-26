"use client";

import { useMemo, useState } from "react";

import Button from "@/components/ui/button/button";
import Card from "@/components/ui/card/card";
import ErrorMessage from "@/components/ui/error-message/error-message";
import Input from "@/components/ui/input/input";
import { buildAnalytics } from "@/lib/analytics";
import { formatBRL } from "@/lib/format";
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
}

function SummaryCell({ label, value, detail }: SummaryCellProps) {
  return (
    <div className="bg-ink-900 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-1 truncate font-display text-2xl leading-none tabular-nums text-ink-50">{value}</p>
      {detail && <p className="mt-1 truncate text-xs tabular-nums text-ink-400">{detail}</p>}
    </div>
  );
}

function Analytics({ entries, profiles }: AnalyticsProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { invalidRange, totalGames, totalSpent, lossItems, spendItems } = useMemo(
    () => buildAnalytics(entries, profiles, startDate, endDate),
    [entries, profiles, startDate, endDate],
  );

  const topLoser = lossItems[0] ?? null;
  const topSpender = spendItems[0] ?? null;

  return (
    <div className="flex flex-col gap-4">
      <Card as="section">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink-200">Intervalo personalizado</h2>

          {(startDate || endDate) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              fullWidth={false}
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              Limpar filtro
            </Button>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input
            id="analytics-start"
            label="Data inicial"
            name="analytics-start"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />

          <Input
            id="analytics-end"
            label="Data final"
            name="analytics-end"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>

        <p className="mt-2 text-xs text-ink-400">Sem datas, considera todo o período.</p>

        {invalidRange && (
          <div className="mt-3">
            <ErrorMessage message="A data inicial não pode ser depois da data final." />
          </div>
        )}
      </Card>

      <section
        className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-ink-800 bg-ink-800"
        aria-label="Resumo do período"
      >
        <SummaryCell label="Partidas" value={String(totalGames)} />
        <SummaryCell label="Total gasto" value={formatBRL(totalSpent)} />
        <SummaryCell
          label="Mais perdeu"
          value={topLoser ? `@${topLoser.label}` : "—"}
          detail={topLoser ? topLoser.displayValue : undefined}
        />
        <SummaryCell
          label="Mais gastou"
          value={topSpender ? `@${topSpender.label}` : "—"}
          detail={topSpender ? topSpender.displayValue : undefined}
        />
      </section>

      <BarChart title="Quem mais perdeu" items={lossItems} variant="danger" emptyText="Nenhuma derrota no período." />

      <BarChart title="Quem mais gastou" items={spendItems} variant="victory" emptyText="Nenhum gasto no período." />

      <p className="text-center text-xs text-ink-400">O período considera a data de término de cada partida.</p>
    </div>
  );
}

export default Analytics;
