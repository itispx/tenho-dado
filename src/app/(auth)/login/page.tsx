import type { Metadata } from "next";

import AuthForm from "@/components/features/auth-form/auth-form";

export const metadata: Metadata = {
  title: "Entrar — Tenho Dado",
  description: "Entre ou crie sua conta para jogar.",
};

function LoginPage() {
  return (
    <main className="min-h-dvh bg-ink-950 flex flex-col items-center justify-center px-4 py-12">
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-[8%] left-[6%] text-7xl opacity-[0.04] rotate-[-18deg] select-none">⚀</span>
        <span className="absolute top-[12%] right-[10%] text-8xl opacity-[0.03] rotate-[22deg] select-none">⚅</span>
        <span className="absolute bottom-[18%] left-[12%] text-6xl opacity-[0.04] rotate-[10deg] select-none">⚃</span>
        <span className="absolute bottom-[10%] right-[8%] text-9xl opacity-[0.03] rotate-[-12deg] select-none">⚂</span>
      </div>

      <div className="w-full max-w-sm relative z-10 flex flex-col gap-8">
        <header className="text-center flex flex-col gap-2">
          <p className="text-4xl" aria-hidden="true">
            🎲
          </p>
          <h1 className="font-display text-5xl text-ink-50 tracking-wider uppercase leading-none">Tenho Dado</h1>
          <p className="text-ink-400 text-sm font-body">Você tem dado?</p>
        </header>

        <div className="bg-ink-900 border border-ink-800 rounded-2xl p-6 shadow-lg">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
