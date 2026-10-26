"use client";

import { useState } from "react";

import { linkManagedPlayerAction } from "@/actions/managed-players";
import Button from "@/components/ui/button/button";
import ErrorMessage from "@/components/ui/error-message/error-message";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
import type { ManagedPlayer } from "@/types/managed-player";
import type { ProfileOption } from "@/types/session";

export interface LinkManagedPlayerModalProps {
  player: ManagedPlayer;
  realProfiles: ProfileOption[];
  onClose: () => void;
  onLinked: () => void;
}

function LinkManagedPlayerModal({ player, realProfiles, onClose, onLinked }: LinkManagedPlayerModalProps) {
  const suggested = realProfiles.find((profile) => profile.username.toLowerCase() === player.username.toLowerCase());

  const [realId, setRealId] = useState(suggested?.id ?? "");
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLink() {
    if (!realId || isLinking) return;

    setIsLinking(true);
    setError(null);

    try {
      const result = await linkManagedPlayerAction(player.id, realId);

      if (result.error) {
        setError(result.error);
        return;
      }

      onLinked();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsLinking(false);
    }
  }

  return (
    <Modal labelledBy="link-managed-title" onClose={onClose} isBusy={isLinking} width="sm">
      <h2
        id="link-managed-title"
        className="break-words font-display text-3xl uppercase leading-none tracking-wide text-ink-50"
      >
        Vincular @{player.username}
      </h2>

      <p className="mt-2 text-sm text-ink-400">
        Todo o histórico de <span className="font-semibold text-ink-200">@{player.username}</span> será transferido para
        a conta real. O perfil gerido será removido.
      </p>

      {realProfiles.length === 0 ? (
        <p className="mt-4 rounded-md border border-ink-800 bg-ink-950/50 px-3 py-2 text-sm text-ink-400">
          Nenhuma conta real disponível. Peça para a pessoa criar a conta primeiro.
        </p>
      ) : (
        <div className="mt-4">
          <Select
            id="link-real-profile"
            label="Conta real"
            value={realId}
            onChange={(event) => {
              setRealId(event.target.value);
              setError(null);
            }}
            disabled={isLinking}
          >
            <option value="">Selecione a conta real</option>
            {realProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                @{profile.username}
              </option>
            ))}
          </Select>
        </div>
      )}

      <ErrorMessage message={error} />

      <div className="mt-4 flex flex-col gap-2">
        <Button
          type="button"
          onClick={handleLink}
          isLoading={isLinking}
          disabled={!realId || realProfiles.length === 0 || isLinking}
        >
          Vincular conta
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={isLinking}>
          Cancelar
        </Button>
      </div>
    </Modal>
  );
}

export default LinkManagedPlayerModal;
