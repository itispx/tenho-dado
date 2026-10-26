import Link from "next/link";

import DiceFace from "@/components/ui/dice-face/dice-face";

function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink-950 px-4 text-center">
      <DiceFace value={null} size="xl" decorative />

      <h1 className="font-display text-4xl uppercase tracking-wider text-ink-50">Página não encontrada</h1>

      <p className="max-w-xs text-sm text-ink-400">Essa página não existe ou o lobby expirou.</p>

      <Link
        href="/"
        className="mt-4 inline-flex h-9 items-center rounded-lg bg-ink-50 px-4 text-sm font-semibold text-ink-950 transition-colors duration-150 hover:bg-ink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        Voltar ao início
      </Link>
    </main>
  );
}

export default NotFound;
