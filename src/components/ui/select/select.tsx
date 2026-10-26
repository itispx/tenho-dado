import clsx from "clsx";

import ErrorMessage from "../error-message/error-message";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label?: string;
  error?: string | null;
  hint?: string;
}

function Select({ id, label, error, hint, className, children, ...selectProps }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-ink-200">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={id}
          className={clsx(
            "h-11 w-full appearance-none rounded-lg border border-ink-700 bg-ink-800 px-3 pr-10",
            "text-base text-ink-50 transition-colors duration-150",
            "hover:border-ink-600 focus:border-victory focus:outline-none focus:ring-1 focus:ring-victory",
            "disabled:opacity-40",
            className,
          )}
          {...selectProps}
        >
          {children}
        </select>

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
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {hint && <p className="text-xs text-ink-400">{hint}</p>}

      <ErrorMessage message={error} />
    </div>
  );
}

export default Select;
