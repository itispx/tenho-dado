"use client";

import { useState } from "react";

import { submitSpentAction } from "@/actions/session";
import Button from "@/components/ui/button/button";
import CurrencyInput from "@/components/ui/currency-input/currency-input";
import ErrorMessage from "@/components/ui/error-message/error-message";
import Modal from "@/components/ui/modal/modal";
import { parseMoneyInput } from "@/lib/format";

export interface SpentModalProps {
  sessionId: string;
  loserName: string;
  forSelf: boolean;
  onChanged: () => Promise<void>;
}

function SpentModal({ sessionId, loserName, forSelf, onChanged }: SpentModalProps) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = parseMoneyInput(amount);

    if (parsed === null || parsed < 0) {
      setError("Informe um valor válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitSpentAction(sessionId, parsed);

      if (result.error) {
        setError(result.error);
        return;
      }

      await onChanged();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal labelledBy="spent-title" describedBy="spent-description" tone="danger" isBusy={isSubmitting} width="sm">
      <div className="text-center">
        <span aria-hidden="true" className="inline-block animate-laugh text-6xl leading-none">
          😂
        </span>

        <h2
          id="spent-title"
          className="mt-2 break-words font-display text-3xl uppercase leading-none tracking-wide text-ink-50"
        >
          {loserName} é o otário
        </h2>

        <p id="spent-description" className="mt-2 text-sm text-ink-400">
          {forSelf
            ? "Registre quanto você gastou para liberar a saída."
            : `Registre quanto @${loserName} gastou para liberar a saída.`}
        </p>
      </div>

      <form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit}>
        <label htmlFor="spent-amount" className="text-sm font-semibold text-ink-200">
          {forSelf ? "Quanto você gastou?" : `Quanto @${loserName} gastou?`}
        </label>

        <CurrencyInput
          id="spent-amount"
          name="spent-amount"
          value={amount}
          onChange={setAmount}
          size="lg"
          tone="danger"
          dataAutofocus
          required
        />

        <p className="text-xs text-ink-400">Sem descrição. Só o valor.</p>

        <ErrorMessage message={error} />

        <Button type="submit" isLoading={isSubmitting}>
          Registrar gasto
        </Button>
      </form>
    </Modal>
  );
}

export default SpentModal;
