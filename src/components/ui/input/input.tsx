"use client";

import clsx from "clsx";
import { useState } from "react";

import ErrorMessage, { ErrorMessageProps } from "../error-message/error-message";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  name: string;
  secret?: boolean;
  error?: ErrorMessageProps["message"];
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
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
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
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
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

/**
 * O react-hook-form injeta um `ref` via props e ele sobrescreveria o nosso,
 * então o elemento é resolvido pelo id (que é obrigatório e único).
 */
function findInput(id: string): HTMLInputElement | null {
  return document.getElementById(id) as HTMLInputElement | null;
}

function Input({ id, label, name, className, error, ...inputProps }: InputProps) {
  const isPassword = inputProps.type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [inputProps["aria-describedby"], errorId].filter(Boolean).join(" ") || undefined;
  const invalid = error ? true : inputProps["aria-invalid"];

  function toggleVisibility() {
    const input = findInput(id);

    if (!input) return;

    const wasFocused = document.activeElement === input;
    const caret = input.selectionStart ?? input.value.length;
    const nextType = input.type === "password" ? "text" : "password";

    // Troca o type direto no DOM, dentro do gesto do usuário.
    input.type = nextType;

    if (inputProps.value === undefined) {
      // Reescrever o valor força o campo a redesenhar o conteúdo com o novo type.
      const current = input.value;

      input.value = "";
      input.value = current;
    }

    // Android/iOS não repintam um campo focado quando o type muda: sair e voltar
    // resolve, e o foco é devolvido na mesma batida para o teclado não fechar.
    if (wasFocused) input.blur();

    input.focus({ preventScroll: true });

    const position = Math.min(caret, input.value.length);

    input.setSelectionRange(position, position);

    // No Blink (Chrome/Samsung), o campo focado pode continuar desenhando as
    // bolinhas mesmo com type=text. A propriedade fala direto com o renderizador.
    if (nextType === "text") {
      input.style.setProperty("-webkit-text-security", "none");
    } else {
      input.style.removeProperty("-webkit-text-security");
    }

    // Mantém o estado do React (ícone e aria) alinhado com o DOM.
    setShowPassword(nextType === "text");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink-200">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          className={clsx(
            "h-11 w-full min-w-0 rounded-lg border border-ink-700 bg-ink-800 px-3",
            "text-base text-ink-50 placeholder:text-ink-400 transition-colors duration-150",
            "hover:border-ink-600 focus:border-victory focus:outline-none focus:ring-1 focus:ring-victory",
            "disabled:opacity-40",
            "[&::-ms-reveal]:hidden",
            isPassword && "pr-12",
            className,
          )}
          {...inputProps}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          type={isPassword && showPassword ? "text" : inputProps.type}
        />

        {isPassword && (
          <button
            type="button"
            onClick={toggleVisibility}
            // Não deixa o campo perder o foco (e o teclado fechar) ao tocar no olho.
            onMouseDown={(event) => event.preventDefault()}
            disabled={inputProps.disabled}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            aria-controls={id}
            className="absolute right-0 top-1/2 z-10 inline-flex size-11 -translate-y-1/2 touch-manipulation items-center justify-center rounded-md text-ink-400 transition-colors duration-150 hover:text-ink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory disabled:opacity-40"
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
      </div>

      <ErrorMessage id={errorId} message={error} />
    </div>
  );
}

export default Input;
