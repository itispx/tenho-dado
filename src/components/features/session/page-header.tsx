import Link from "next/link";

export interface PageHeaderProps {
  title: string;
  subtitle?: string | null;
  backHref?: string;
}

function PageHeader({ title, subtitle = null, backHref = "/game" }: PageHeaderProps) {
  return (
    <header className="flex items-center gap-3">
      <Link
        href={backHref}
        aria-label="Voltar"
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-ink-700 bg-ink-900 text-ink-200 transition-colors duration-150 hover:border-ink-600 hover:text-victory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Link>

      <div className="min-w-0">
        <h1 className="break-words font-display text-[2rem] uppercase leading-none tracking-wide text-ink-50 sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-xs text-ink-400">{subtitle}</p>}
      </div>
    </header>
  );
}

export default PageHeader;
