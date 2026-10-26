import clsx from "clsx";

export type ButtonVariant = "solid" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loadingLabel?: string;
}

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  solid:
    "bg-ink-50 text-ink-950 hover:bg-ink-200 active:bg-ink-200 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
  outline:
    "border border-ink-700 text-ink-200 hover:border-ink-600 hover:text-ink-50 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
  ghost: "text-ink-400 hover:bg-ink-800 hover:text-ink-50",
  danger: "text-danger hover:bg-danger-muted",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-11 gap-1.5 rounded-lg px-3 text-sm",
  md: "h-12 gap-2 rounded-xl px-5 text-base",
};

export function buttonClasses({ variant = "solid", size = "md", fullWidth = true, className }: ButtonStyleOptions) {
  return clsx(
    "inline-flex items-center justify-center font-semibold transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory",
    fullWidth && "w-full",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

function Button({
  isLoading = false,
  variant = "solid",
  size = "md",
  fullWidth = true,
  loadingLabel = "Carregando...",
  className,
  disabled,
  children,
  ...buttonProps
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      {...buttonProps}
      type={buttonProps.type ?? "submit"}
      className={clsx(
        buttonClasses({ variant, size, fullWidth, className }),
        isDisabled && "pointer-events-none",
        disabled && !isLoading && "opacity-40",
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
