"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInFormAction, type AuthFormState } from "@/actions/auth";
import Button from "@/components/ui/button/button";
import ErrorMessage from "@/components/ui/error-message/error-message";
import Input from "@/components/ui/input/input";

const initialState: AuthFormState = { error: null };

function AuthForm() {
  const [state, formAction, isPending] = useActionState(signInFormAction, initialState);

  return (
    <div className="w-full max-w-sm mx-auto">
      <form action={formAction} className="flex flex-col gap-4">
        <Input
          id="login-username"
          label="Nome de usuário"
          name="username"
          type="text"
          placeholder="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={20}
          aria-describedby={state.error ? "login-error" : undefined}
          aria-invalid={Boolean(state.error)}
          required
        />

        <Input
          id="login-password"
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          aria-describedby={state.error ? "login-error" : undefined}
          aria-invalid={Boolean(state.error)}
          required
        />

        <Button isLoading={isPending} loadingLabel="Entrando…">
          Entrar
        </Button>

        <ErrorMessage id="login-error" message={state.error} />
      </form>

      <p className="text-sm text-ink-400 text-center mt-6">
        Não tem conta?{" "}
        <Link
          href="/register"
          className="text-ink-200 underline underline-offset-2 hover:text-ink-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory rounded-sm"
        >
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export default AuthForm;
