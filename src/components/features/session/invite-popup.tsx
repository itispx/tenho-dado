"use client";

import { useState } from "react";

import type { SessionActionState } from "@/actions/session";
import Button from "@/components/ui/button/button";
import DiceFace from "@/components/ui/dice-face/dice-face";
import ErrorMessage from "@/components/ui/error-message/error-message";
import Modal from "@/components/ui/modal/modal";
import { SESSION_MODE_LABELS } from "@/lib/constants";
import type { SessionView } from "@/types/session";

export interface InvitePopupProps {
  session: SessionView;
  onJoin: () => Promise<SessionActionState>;
  onDismiss: () => void;
}

function InvitePopup({ session, onJoin, onDismiss }: InvitePopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await onJoin();

      if (result.error) setError(result.error);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal labelledBy="invite-title" onClose={onDismiss} isBusy={isLoading} width="sm">
      <div className="text-center">
        <DiceFace value={6} size="lg" tone="victory" decorative className="mx-auto" />

        <h2 id="invite-title" className="mt-3 font-display text-4xl uppercase leading-none tracking-wide text-ink-50">
          Tá na hora do dado
        </h2>

        <p className="mt-2 text-sm text-ink-400">
          @{session.host_username} abriu uma sessão de{" "}
          <span className="font-semibold text-victory">{SESSION_MODE_LABELS[session.mode]}</span>
          {session.die === "d20" ? " com D20" : ""}.
        </p>

        <p className="mt-1 text-xs text-ink-400">
          {session.players.length} {session.players.length === 1 ? "jogador já entrou" : "jogadores já entraram"}.
        </p>
      </div>

      <ErrorMessage message={error} />

      <div className="mt-4 flex flex-col gap-2">
        <Button type="button" onClick={handleJoin} isLoading={isLoading} data-autofocus>
          Entrar na sessão
        </Button>
        <Button type="button" variant="outline" onClick={onDismiss} disabled={isLoading}>
          Agora não
        </Button>
      </div>
    </Modal>
  );
}

export default InvitePopup;
