import type { Metadata } from "next";
import { redirect } from "next/navigation";

import SetupForm from "@/components/features/setup-form/setup-form";
import { getMyProfile } from "@/lib/profile/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Configurar perfil — Tenho Dado",
};

async function SetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getMyProfile();
  if (profile) redirect("/game");

  return (
    <main className="min-h-dvh bg-ink-950 flex flex-col items-center justify-center px-4 py-12">
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-[10%] right-[8%] text-8xl opacity-[0.03] rotate-[15deg] select-none">⚅</span>
        <span className="absolute bottom-[12%] left-[6%] text-7xl opacity-[0.03] rotate-[-10deg] select-none">⚀</span>
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-3xl" aria-hidden="true">
            🎲
          </p>
          <h1 className="font-display text-4xl text-ink-50 tracking-wider uppercase leading-none">Escolha um nome</h1>
          <p className="text-ink-400 text-sm">Outros jogadores vão te ver pelo seu @username.</p>
        </header>

        <div className="bg-ink-900 border border-ink-800 rounded-2xl p-6 shadow-lg">
          <SetupForm />
        </div>
      </div>
    </main>
  );
}

export default SetupPage;
