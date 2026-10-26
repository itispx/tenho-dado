"use client";

import clsx from "clsx";
import { useState } from "react";

import { createSessionAction } from "@/actions/session";
import Button from "@/components/ui/button/button";
import Card from "@/components/ui/card/card";
import ErrorMessage from "@/components/ui/error-message/error-message";
import type { SessionMode } from "@/types/session";

export interface CreateSessionProps {
  onCreated: () => Promise<void>;
}

const modes: { value: SessionMode; title: string; description: string }[] = [
  {
    value: "manual",
    title: "Dado manual",
    description: "O criador registra o que cada jogador tirou.",
  },
  {
    value: "online",
    title: "Dado online",
    description: "Cada jogador rola o próprio dado na sua vez.",
  },
];

function CreateSession({ onCreated }: CreateSessionProps) {
  const [mode, setMode] = useState<SessionMode>("manual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createSessionAction(mode);

      if (result.error) {
        setError(result.error);
        return;
      }

      await onCreated();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card as="section">
      <h2 className="font-display text-2xl uppercase leading-none tracking-wide text-ink-50">Iniciar jogo</h2>
      <p className="mt-2 text-xs text-ink-400">
        Só pode existir uma sessão ativa por vez. Todos que estiverem online recebem o convite.
      </p>

      <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label="Modo de jogo">
        {modes.map((option) => {
          const isSelected = mode === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setMode(option.value)}
              className={clsx(
                "flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
                isSelected ? "border-victory/50 bg-victory-bg" : "border-ink-700 bg-ink-950/40 hover:border-ink-600",
              )}
            >
              <span
                aria-hidden="true"
                className={clsx(
                  "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                  isSelected ? "border-victory" : "border-ink-600",
                )}
              >
                {isSelected && <span className="size-2 rounded-full bg-victory" />}
              </span>

              <span className="flex flex-col gap-0.5">
                <span className={clsx("text-sm font-semibold", isSelected ? "text-victory" : "text-ink-200")}>
                  {option.title}
                </span>
                <span className="text-xs text-ink-400">{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <ErrorMessage message={error} />
      </div>

      <div className="mt-3">
        <Button type="button" onClick={handleCreate} isLoading={isLoading}>
          Criar sessão
        </Button>
      </div>
    </Card>
  );
}

export default CreateSession;
