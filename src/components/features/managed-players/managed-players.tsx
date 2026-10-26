"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createManagedPlayerAction, deleteManagedPlayerAction } from "@/actions/managed-players";
import Button from "@/components/ui/button/button";
import Card from "@/components/ui/card/card";
import ErrorMessage from "@/components/ui/error-message/error-message";
import Input from "@/components/ui/input/input";
import { formatSessionDate } from "@/lib/format";
import type { ManagedPlayer } from "@/types/managed-player";
import type { ProfileOption } from "@/types/session";

import LinkManagedPlayerModal from "./link-managed-player-modal";

export interface ManagedPlayersProps {
  managed: ManagedPlayer[];
  real: ProfileOption[];
}

function ManagedPlayers({ managed, real }: ManagedPlayersProps) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [linkingPlayer, setLinkingPlayer] = useState<ManagedPlayer | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCreating) return;

    setIsCreating(true);
    setCreateError(null);

    try {
      const result = await createManagedPlayerAction(username);

      if (result.error) {
        setCreateError(result.error);
        return;
      }

      setUsername("");
      router.refresh();
    } catch {
      setCreateError("Erro de conexão. Tente novamente.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(playerId: string) {
    setDeletingId(playerId);
    setDeleteError(null);

    try {
      const result = await deleteManagedPlayerAction(playerId);

      if (result.error) {
        setDeleteError(result.error);
        return;
      }

      setConfirmDeleteId(null);
      router.refresh();
    } catch {
      setDeleteError("Erro de conexão. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card as="section">
        <h2 className="text-sm font-semibold text-ink-200">Novo jogador gerido</h2>
        <p className="mt-1 text-xs text-ink-400">
          Cria uma conta sem login, para ser usada nos jogos até a pessoa criar a conta real.
        </p>

        <form className="mt-4 flex flex-col gap-3" onSubmit={handleCreate}>
          <Input
            id="managed-username"
            label="Username"
            name="username"
            type="text"
            placeholder="Ex: gabriel"
            maxLength={20}
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setCreateError(null);
            }}
            disabled={isCreating}
            required
          />

          <ErrorMessage message={createError} />

          <Button type="submit" isLoading={isCreating}>
            Criar jogador
          </Button>
        </form>
      </Card>

      <Card as="section">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink-200">Jogadores geridos</h2>
          <p className="text-xs tabular-nums text-ink-400">{managed.length}</p>
        </div>

        {managed.length === 0 ? (
          <p className="mt-3 text-xs text-ink-400">Nenhum jogador gerido cadastrado.</p>
        ) : (
          <ul className="mt-2 flex flex-col">
            {managed.map((player) => (
              <li
                key={player.id}
                className="flex items-center justify-between gap-3 border-b border-ink-800 py-2 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-200">@{player.username}</p>
                  <p className="text-[11px] tabular-nums text-ink-400">
                    Criado em {formatSessionDate(player.created_at)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {confirmDeleteId === player.id ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        fullWidth={false}
                        onClick={() => setConfirmDeleteId(null)}
                        disabled={deletingId === player.id}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        fullWidth={false}
                        onClick={() => handleDelete(player.id)}
                        disabled={deletingId === player.id}
                      >
                        {deletingId === player.id ? "Excluindo…" : "Confirmar?"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        fullWidth={false}
                        onClick={() => {
                          setLinkingPlayer(player);
                          setDeleteError(null);
                        }}
                      >
                        Vincular
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        fullWidth={false}
                        onClick={() => {
                          setConfirmDeleteId(player.id);
                          setDeleteError(null);
                        }}
                      >
                        Excluir
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <ErrorMessage message={deleteError} />
      </Card>

      {linkingPlayer && (
        <LinkManagedPlayerModal
          key={linkingPlayer.id}
          player={linkingPlayer}
          realProfiles={real}
          onClose={() => setLinkingPlayer(null)}
          onLinked={() => {
            setLinkingPlayer(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

export default ManagedPlayers;
