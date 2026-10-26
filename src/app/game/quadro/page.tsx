import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { loadScoreboardAction } from "@/actions/scoreboard";
import Scoreboard from "@/components/features/scoreboard/scoreboard";
import PageHeader from "@/components/features/session/page-header";
import ErrorMessage from "@/components/ui/error-message/error-message";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Quadro" };

async function ScoreboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { sessions, profiles, canManage, error } = await loadScoreboardAction();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ink-950 px-4 py-8">
      <div className="flex w-full max-w-md flex-col gap-6">
        <PageHeader title="Quadro" subtitle="Todas as partidas já finalizadas" />

        <ErrorMessage message={error} />

        {!error && <Scoreboard sessions={sessions} profiles={profiles} canManage={canManage} />}
      </div>
    </main>
  );
}

export default ScoreboardPage;
