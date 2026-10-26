"use client";

import clsx from "clsx";

import { maskMoneyInput } from "@/lib/format";

export interface CurrencyInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  dataAutofocus?: boolean;
  size?: "md" | "lg";
  tone?: "victory" | "danger";
}

const sizeClasses = {
  md: "h-11",
  lg: "h-12",
} as const;

const toneClasses = {
  victory: "focus-within:border-victory focus-within:ring-1 focus-within:ring-victory",
  danger: "focus-within:border-danger focus-within:ring-1 focus-within:ring-danger",
} as const;

function CurrencyInput({
  id,
  name,
  value,
  onChange,
  disabled = false,
  required = false,
  dataAutofocus = false,
  size = "md",
  tone = "victory",
}: CurrencyInputProps) {
  return (
    <div
      className={clsx(
        "flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-800 px-3 transition-colors duration-150",
        sizeClasses[size],
        toneClasses[tone],
        disabled && "opacity-40",
      )}
    >
      <span aria-hidden="true" className="text-sm font-semibold text-ink-400">
        R$
      </span>

      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="0,00"
        value={value}
        onChange={(event) => onChange(maskMoneyInput(event.target.value))}
        disabled={disabled}
        required={required}
        data-autofocus={dataAutofocus ? "" : undefined}
        className="h-full w-full bg-transparent text-base tabular-nums text-ink-50 placeholder:text-ink-400 focus:outline-none"
      />
    </div>
  );
}

export default CurrencyInput;
