import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { loadManagedPlayersAction } from "@/actions/managed-players";
import ManagedPlayers from "@/components/features/managed-players/managed-players";
import PageHeader from "@/components/features/session/page-header";
import ErrorMessage from "@/components/ui/error-message/error-message";
import { SCOREBOARD_ADMIN_USERNAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Jogadores" };

async function ManagedPlayersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profile").select("username").eq("id", user.id).single();

  if (profile?.username !== SCOREBOARD_ADMIN_USERNAME) redirect("/game");

  const { managed, real, error } = await loadManagedPlayersAction();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ink-950 px-4 py-8">
      <div className="flex w-full max-w-md flex-col gap-6">
        <PageHeader title="Jogadores" subtitle="Contas geridas e vínculos" backHref="/game/quadro" />

        <ErrorMessage message={error} />

        {!error && <ManagedPlayers managed={managed} real={real} />}
      </div>
    </main>
  );
}

export default ManagedPlayersPage;
