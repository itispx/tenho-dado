"use client";

import { useEffect } from "react";

import Button from "@/components/ui/button/button";
import DiceFace from "@/components/ui/dice-face/dice-face";

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink-950 px-4 text-center">
      <DiceFace value={1} size="xl" tone="danger" decorative />

      <h1 className="font-display text-4xl uppercase tracking-wider text-ink-50">Algo deu errado</h1>

      <p className="max-w-xs text-sm text-ink-400">Ocorreu um erro inesperado. Tente novamente.</p>

      <div className="mt-4">
        <Button type="button" size="sm" onClick={reset}>
          Tentar novamente
        </Button>
      </div>
    </main>
  );
}

export default ErrorPage;
