"use client";

import clsx from "clsx";
import { useActionState } from "react";

import { createProfile, type ProfileFormState } from "@/lib/profile/actions";

const initialState: ProfileFormState = { error: null };

function SetupForm() {
  const [state, action, isPending] = useActionState(createProfile, initialState);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-sm font-semibold text-ink-200">
          Nome de usuário
        </label>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 text-base select-none">@</span>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="seunome"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={20}
            required
            className={clsx(
              "w-full h-12 rounded-xl pl-8 pr-4 bg-ink-800 border border-ink-700",
              "text-ink-50 text-base placeholder:text-ink-400 font-mono",
              "transition-colors duration-fast",
              "hover:border-ink-600",
              "focus:outline-none focus:border-ink-200 focus:ring-1 focus:ring-ink-200",
            )}
          />
        </div>

        <p className="text-xs text-ink-400">3–20 caracteres. Apenas letras minúsculas, números e _.</p>
      </div>

      {state.error && (
        <p
          role="alert"
          aria-live="polite"
          className="text-sm text-danger bg-danger-bg border border-danger/20 rounded-lg px-3 py-2"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        aria-disabled={isPending}
        className={clsx(
          "h-12 rounded-xl font-semibold text-base",
          "bg-ink-50 text-ink-950",
          "transition-all duration-fast",
          "hover:bg-ink-200 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
          isPending && "opacity-40 pointer-events-none",
        )}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="size-4 rounded-full border-2 border-ink-600 border-t-ink-950 animate-spin"
              aria-hidden="true"
            />
            Salvando...
          </span>
        ) : (
          "Entrar no jogo"
        )}
      </button>
    </form>
  );
}

export default SetupForm;
