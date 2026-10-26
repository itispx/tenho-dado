import { formatBRL } from "@/lib/format";
import type { AnalyticsEntry } from "@/types/scoreboard";
import type { ProfileOption } from "@/types/session";

export interface AnalyticsBarItem {
  id: string;
  label: string;
  value: number;
  displayValue: string;
}

export interface AnalyticsSummary {
  invalidRange: boolean;
  totalGames: number;
  totalSpent: number;
  averageSpent: number;
  lossItems: AnalyticsBarItem[];
  spendItems: AnalyticsBarItem[];
}

export function buildAnalytics(
  entries: AnalyticsEntry[],
  profiles: ProfileOption[],
  startDate: string,
  endDate: string,
): AnalyticsSummary {
  const invalidRange = Boolean(startDate && endDate && startDate > endDate);
  const from = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const to = endDate ? new Date(`${endDate}T23:59:59.999`) : null;

  const filtered = invalidRange
    ? []
    : entries.filter((entry) => {
        const date = new Date(entry.finished_at);

        if (Number.isNaN(date.getTime())) return false;
        if (from && date < from) return false;
        if (to && date > to) return false;

        return true;
      });

  const names = new Map(
    profiles.map((profile) => [profile.id, profile.isManaged ? `${profile.username} (gerido)` : profile.username]),
  );
  const lossCounts = new Map<string, number>();
  const spendTotals = new Map<string, number>();
  let totalSpent = 0;
  let spentGames = 0;

  for (const entry of filtered) {
    if (entry.loser_profile_id) {
      lossCounts.set(entry.loser_profile_id, (lossCounts.get(entry.loser_profile_id) ?? 0) + 1);
    }

    if (entry.loser_profile_id && entry.loser_spent !== null) {
      spendTotals.set(entry.loser_profile_id, (spendTotals.get(entry.loser_profile_id) ?? 0) + entry.loser_spent);
      totalSpent += entry.loser_spent;
      spentGames += 1;
    }
  }

  const lossItems: AnalyticsBarItem[] = [...lossCounts.entries()]
    .map(([profileId, count]) => ({
      id: profileId,
      label: names.get(profileId) ?? "?",
      value: count,
      displayValue: `${count}x`,
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  const spendItems: AnalyticsBarItem[] = [...spendTotals.entries()]
    .map(([profileId, amount]) => ({
      id: profileId,
      label: names.get(profileId) ?? "?",
      value: amount,
      displayValue: formatBRL(amount),
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  return {
    invalidRange,
    totalGames: filtered.length,
    totalSpent,
    averageSpent: spentGames > 0 ? totalSpent / spentGames : 0,
    lossItems,
    spendItems,
  };
}
