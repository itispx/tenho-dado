import Link from "next/link";

function NotFound() {
  return (
    <main className="min-h-dvh bg-ink-950 flex flex-col items-center justify-center px-4 text-center gap-4">
      <p className="text-7xl" aria-hidden="true">
        ⚀
      </p>
      <h1 className="font-display text-4xl text-ink-50 tracking-wider uppercase">Página não encontrada</h1>
      <p className="text-ink-400 text-sm max-w-xs">Essa página não existe ou o lobby expirou.</p>
      <Link
        href="/game"
        className="mt-4 h-11 px-6 rounded-xl bg-ink-50 text-ink-950 font-semibold text-sm inline-flex items-center transition-all duration-fast hover:bg-ink-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        Voltar ao início
      </Link>
    </main>
  );
}

export default NotFound;
