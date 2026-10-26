import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { loadAnalyticsAction } from "@/actions/scoreboard";
import Analytics from "@/components/features/analytics/analytics";
import PageHeader from "@/components/features/session/page-header";
import ReportTabs from "@/components/features/session/report-tabs";
import ErrorMessage from "@/components/ui/error-message/error-message";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Análises" };

async function AnalyticsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { entries, profiles, error } = await loadAnalyticsAction();

  return (
    <main className="flex min-h-dvh flex-col items-center bg-ink-950 px-4 py-6 sm:py-8">
      <div className="flex w-full max-w-md flex-col gap-5 md:max-w-2xl lg:max-w-3xl">
        <PageHeader title="Análises" subtitle="Derrotas e gastos por período" />

        <ReportTabs current="analytics" />

        <ErrorMessage message={error} />

        {!error && <Analytics entries={entries} profiles={profiles} />}
      </div>
    </main>
  );
}

export default AnalyticsPage;
