"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerFormAction, type AuthFormState } from "@/actions/auth";
import Button from "@/components/ui/button/button";
import ErrorMessage from "@/components/ui/error-message/error-message";
import Input from "@/components/ui/input/input";

const initialState: AuthFormState = { error: null };

export interface RegisterFormProps {
  requiresInvite: boolean;
}

function RegisterForm({ requiresInvite }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(registerFormAction, initialState);

  return (
    <div className="w-full max-w-sm mx-auto">
      <form action={formAction} className="flex flex-col gap-4">
        <Input
          id="register-username"
          label="Nome de usuário"
          name="username"
          type="text"
          placeholder="seunome"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={20}
          aria-describedby={state.error ? "register-error" : undefined}
          aria-invalid={Boolean(state.error)}
          required
        />

        <Input
          id="register-password"
          label="Senha"
          name="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          aria-describedby={state.error ? "register-error" : undefined}
          aria-invalid={Boolean(state.error)}
          required
        />

        {requiresInvite && (
          <Input
            id="register-invite"
            label="Código de convite"
            name="inviteCode"
            type="text"
            placeholder="Código do grupo"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={100}
            aria-describedby={state.error ? "register-error" : undefined}
            aria-invalid={Boolean(state.error)}
            required
          />
        )}

        <ErrorMessage id="register-error" message={state.error} />

        <Button isLoading={isPending} loadingLabel="Criando conta…">
          Criar conta
        </Button>
      </form>

      <p className="text-sm text-ink-400 text-center mt-6">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="text-ink-200 underline underline-offset-2 hover:text-ink-50 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory rounded-sm"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;
