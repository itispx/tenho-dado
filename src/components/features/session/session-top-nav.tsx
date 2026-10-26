import Link from "next/link";

function TableIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3v18h18" />
      <path d="M7 15v3" />
      <path d="M12 10v8" />
      <path d="M17 6v12" />
    </svg>
  );
}

const linkClasses =
  "inline-flex h-10 items-center gap-2 rounded-pill border border-ink-700 bg-ink-900 px-4 text-sm font-semibold text-ink-200 transition-colors duration-150 hover:border-ink-600 hover:text-victory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950";

function SessionTopNav() {
  return (
    <nav aria-label="Atalhos do jogo" className="flex w-full items-center justify-between gap-3">
      <Link href="/game/quadro" className={linkClasses}>
        <TableIcon />
        <span>Quadro</span>
      </Link>

      <Link href="/game/analytics" className={linkClasses}>
        <span>Análises</span>
        <ChartIcon />
      </Link>
    </nav>
  );
}

export default SessionTopNav;
