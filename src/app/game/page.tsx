import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { loadSessionDataAction } from "@/actions/session";
import SessionHub from "@/components/features/session/session-hub";
import SessionTopNav from "@/components/features/session/session-top-nav";
import { loadProfiles } from "@/lib/session-repository";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Jogar" };

async function GamePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profile").select("id, username").eq("id", user.id).single();

  if (!profile) redirect("/login");

  const [{ active, pendingDebt, error }, profiles] = await Promise.all([loadSessionDataAction(), loadProfiles()]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ink-950 px-4 py-6">
      <div className="flex w-full max-w-md flex-col gap-6">
        <SessionTopNav />

        <h1 className="font-display text-5xl uppercase leading-none tracking-wider text-ink-50">Tenho Dado</h1>

        <SessionHub
          initialData={{ active, pendingDebt }}
          initialError={error}
          me={{ id: profile.id, username: profile.username }}
          profiles={profiles}
        />
      </div>
    </main>
  );
}

export default GamePage;
