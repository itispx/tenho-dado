"use client";

import clsx from "clsx";
import { useActionState, useState } from "react";

import { signIn, signUp, type AuthFormState } from "@/lib/auth/actions";

type Tab = "login" | "signup";

const initialState: AuthFormState = { error: null };

function AuthForm() {
  const [tab, setTab] = useState<Tab>("login");

  const [loginState, loginAction, isLoginPending] = useActionState(signIn, initialState);
  const [signupState, signupAction, isSignupPending] = useActionState(signUp, initialState);

  const isPending = isLoginPending || isSignupPending;
  const error = tab === "login" ? loginState.error : signupState.error;

  return (
    <div className="w-full max-w-sm mx-auto">
      <div
        role="tablist"
        aria-label="Modo de acesso"
        className="flex rounded-xl bg-ink-800 p-1 mb-6 border border-ink-700"
      >
        {(["login", "signup"] as Tab[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            aria-controls={`panel-${t}`}
            onClick={() => setTab(t)}
            className={clsx(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-fast",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-1 focus-visible:ring-offset-ink-800",
              tab === t ? "bg-ink-50 text-ink-950 shadow-sm" : "text-ink-400 hover:text-ink-200",
            )}
          >
            {t === "login" ? "Entrar" : "Criar conta"}
          </button>
        ))}
      </div>

      <div id="panel-login" role="tabpanel" hidden={tab !== "login"}>
        <form action={loginAction} className="flex flex-col gap-4">
          <Field
            id="login-email"
            label="E-mail"
            name="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
          />
          <Field
            id="login-password"
            label="Senha"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <ErrorMessage message={error} />
          <SubmitButton isLoading={isLoginPending} disabled={isPending}>
            Entrar
          </SubmitButton>
        </form>
      </div>

      <div id="panel-signup" role="tabpanel" hidden={tab !== "signup"}>
        <form action={signupAction} className="flex flex-col gap-4">
          <Field
            id="signup-email"
            label="E-mail"
            name="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            required
          />
          <Field
            id="signup-password"
            label="Senha"
            name="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            required
          />
          <ErrorMessage message={error} />
          <SubmitButton isLoading={isSignupPending} disabled={isPending}>
            Criar conta
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  name: string;
}

function Field({ id, label, name, ...inputProps }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink-200">
        {label}
      </label>
      <input
        id={id}
        name={name}
        className={clsx(
          "h-11 rounded-lg px-3 bg-ink-800 border border-ink-700",
          "text-ink-50 text-base placeholder:text-ink-400",
          "transition-colors duration-fast",
          "hover:border-ink-600",
          "focus:outline-none focus:border-ink-200 focus:ring-1 focus:ring-ink-200",
        )}
        {...inputProps}
      />
    </div>
  );
}

interface ErrorMessageProps {
  message: string | null;
}

function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      aria-live="polite"
      className="text-sm text-danger bg-danger-bg border border-danger/20 rounded-lg px-3 py-2"
    >
      {message}
    </p>
  );
}

interface SubmitButtonProps {
  isLoading: boolean;
  disabled: boolean;
  children: React.ReactNode;
}

function SubmitButton({ isLoading, disabled, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-disabled={disabled}
      aria-busy={isLoading}
      className={clsx(
        "h-12 rounded-xl font-semibold text-base mt-1",
        "bg-ink-50 text-ink-950",
        "transition-all duration-fast",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
        "hover:bg-ink-200 active:scale-[0.98]",
        disabled && "opacity-40 pointer-events-none",
      )}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span
            className="size-4 rounded-full border-2 border-ink-600 border-t-ink-950 animate-spin"
            aria-hidden="true"
          />
          Carregando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default AuthForm;
