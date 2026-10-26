"use client";

import { useState } from "react";

import { createRetroactiveSessionAction, updateFinishedSessionAction } from "@/actions/scoreboard";
import Button from "@/components/ui/button/button";
import CurrencyInput from "@/components/ui/currency-input/currency-input";
import ErrorMessage from "@/components/ui/error-message/error-message";
import Input from "@/components/ui/input/input";
import Modal from "@/components/ui/modal/modal";
import Select from "@/components/ui/select/select";
import { parseMoneyInput, toDateInputValue, toMoneyInputValue } from "@/lib/format";
import { orderPlayers } from "@/lib/session-logic";
import type { ScoreboardInput } from "@/types/scoreboard";
import type { ProfileOption, SessionView } from "@/types/session";

export interface ScoreboardEntryFormProps {
  session: SessionView | null;
  profiles: ProfileOption[];
  onClose: () => void;
  onSaved: () => void;
}

type DiceValues = [number | "", number | "", number | ""];
type RollsByProfile = Record<string, DiceValues>;

function buildInitialRolls(session: SessionView | null): RollsByProfile {
  if (!session) return {};

  const result: RollsByProfile = {};

  for (const player of orderPlayers(session.players)) {
    const regular = session.rolls
      .filter((roll) => roll.session_player_id === player.id && !roll.is_tiebreak)
      .sort((a, b) => a.round - b.round);

    result[player.profile_id] = [
      regular.find((roll) => roll.round === 1)?.value ?? "",
      regular.find((roll) => roll.round === 2)?.value ?? "",
      regular.find((roll) => roll.round === 3)?.value ?? "",
    ];
  }

  return result;
}

function findLowest(rolls: RollsByProfile, profileIds: string[]): string | null {
  let lowestId: string | null = null;
  let lowestTotal = Number.POSITIVE_INFINITY;

  for (const profileId of profileIds) {
    const values = rolls[profileId];

    if (!values || values.length !== 3 || values.some((value) => value === "")) continue;

    const total = values.reduce<number>((sum, value) => sum + Number(value), 0);

    if (total < lowestTotal) {
      lowestTotal = total;
      lowestId = profileId;
    }
  }

  return lowestId;
}

function ScoreboardEntryForm({ session, profiles, onClose, onSaved }: ScoreboardEntryFormProps) {
  const orderedSessionPlayers = session ? orderPlayers(session.players) : [];
  const initialRolls = buildInitialRolls(session);

  const [date, setDate] = useState(toDateInputValue(session?.finished_at ?? session?.created_at ?? null));
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>(
    orderedSessionPlayers.map((player) => player.profile_id),
  );
  const [rollsByProfile, setRollsByProfile] = useState<RollsByProfile>(initialRolls);
  const [loserProfileId, setLoserProfileId] = useState(session?.loser_profile_id ?? "");
  const [spent, setSpent] = useState(toMoneyInputValue(session?.loser_spent ?? null));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

  function profileLabel(profileId: string): string {
    const profile = profileById.get(profileId);

    if (!profile) return "@?";

    return `@${profile.username}${profile.isManaged ? " (gerido)" : ""}`;
  }

  function togglePlayer(profileId: string) {
    setError(null);

    if (selectedProfileIds.includes(profileId)) {
      const nextIds = selectedProfileIds.filter((id) => id !== profileId);
      const nextRolls = { ...rollsByProfile };

      delete nextRolls[profileId];

      setSelectedProfileIds(nextIds);
      setRollsByProfile(nextRolls);

      if (loserProfileId === profileId) {
        setLoserProfileId(findLowest(nextRolls, nextIds) ?? "");
      }

      return;
    }

    setSelectedProfileIds([...selectedProfileIds, profileId]);
    setRollsByProfile({ ...rollsByProfile, [profileId]: ["", "", ""] });
  }

  function changeRoll(profileId: string, index: number, rawValue: string) {
    const current = rollsByProfile[profileId] ?? ["", "", ""];
    const nextValues: DiceValues = [...current] as DiceValues;

    nextValues[index] = rawValue === "" ? "" : Number(rawValue);

    const nextRolls = { ...rollsByProfile, [profileId]: nextValues };

    setRollsByProfile(nextRolls);
    setError(null);

    if (!loserProfileId) {
      const suggestion = findLowest(nextRolls, selectedProfileIds);

      if (suggestion) setLoserProfileId(suggestion);
    }
  }

  function handleSuggestLoser() {
    const allComplete = selectedProfileIds.every((profileId) => {
      const values = rollsByProfile[profileId];

      return values && values.length === 3 && values.every((value) => value !== "");
    });

    const suggestion = allComplete ? findLowest(rollsByProfile, selectedProfileIds) : null;

    if (!suggestion) {
      setError("Preencha os três dados de todos os jogadores.");
      return;
    }

    setLoserProfileId(suggestion);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!date) {
      setError("Informe a data da partida.");
      return;
    }

    if (selectedProfileIds.length < 2) {
      setError("Selecione pelo menos 2 jogadores.");
      return;
    }

    const players: ScoreboardInput["players"] = [];

    for (const profileId of selectedProfileIds) {
      const values = rollsByProfile[profileId];

      if (!values || values.length !== 3 || values.some((value) => value === "")) {
        setError("Preencha os três dados de todos os jogadores.");
        return;
      }

      const rolls: [number, number, number] = [Number(values[0]), Number(values[1]), Number(values[2])];

      if (rolls.some((value) => !Number.isInteger(value) || value < 1 || value > 6)) {
        setError("Os dados devem estar entre 1 e 6.");
        return;
      }

      players.push({ profileId, rolls });
    }

    if (!loserProfileId || !selectedProfileIds.includes(loserProfileId)) {
      setError("Selecione o perdedor da partida.");
      return;
    }

    const spentValue = parseMoneyInput(spent);

    if (spentValue === null || spentValue < 0) {
      setError("Informe um valor gasto válido.");
      return;
    }

    setIsSaving(true);

    try {
      const input: ScoreboardInput = {
        finishedAt: date,
        players,
        loserProfileId,
        loserSpent: spentValue,
      };

      const result = session
        ? await updateFinishedSessionAction(session.id, input)
        : await createRetroactiveSessionAction(input);

      if (result.error) {
        setError(result.error);
        return;
      }

      onSaved();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal labelledBy="scoreboard-entry-title" onClose={onClose} isBusy={isSaving}>
      <header className="flex items-start justify-between gap-3">
        <h2
          id="scoreboard-entry-title"
          className="font-display text-3xl uppercase leading-none tracking-wide text-ink-50"
        >
          {session ? "Editar partida" : "Nova partida retroativa"}
        </h2>

        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          aria-label="Fechar"
          className="-mr-1 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors duration-150 hover:bg-ink-800 hover:text-ink-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </header>

      <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          id="scoreboard-date"
          label="Data da partida"
          name="date"
          type="date"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setError(null);
          }}
          disabled={isSaving}
          required
        />

        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-ink-200">Jogadores</h3>

          <div className="max-h-44 overflow-y-auto rounded-md border border-ink-800 bg-ink-950/40 p-2">
            {profiles.length === 0 && <p className="px-2 py-1 text-xs text-ink-400">Nenhum perfil encontrado.</p>}

            {profiles.map((profile) => (
              <label
                key={profile.id}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-ink-200 transition-colors duration-150 hover:bg-ink-800/60"
              >
                <input
                  type="checkbox"
                  checked={selectedProfileIds.includes(profile.id)}
                  onChange={() => togglePlayer(profile.id)}
                  disabled={isSaving}
                  className="size-4 accent-victory"
                />
                @{profile.username}
                {profile.isManaged && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">gerido</span>
                )}
              </label>
            ))}
          </div>

          <p className="text-xs text-ink-400">Mínimo de 2 jogadores.</p>
        </section>

        {selectedProfileIds.length > 0 && (
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-ink-200">Jogadas</h3>

            {selectedProfileIds.map((profileId) => {
              const values = rollsByProfile[profileId] ?? ["", "", ""];
              const total = values.every((value) => value !== "")
                ? values.reduce<number>((sum, value) => sum + Number(value), 0)
                : null;

              return (
                <div key={profileId} className="rounded-md border border-ink-800 bg-ink-950/40 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-ink-200">{profileLabel(profileId)}</span>
                    <span className="font-display text-2xl leading-none tabular-nums text-ink-50">{total ?? "—"}</span>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="flex-1">
                        <Select
                          id={`roll-${profileId}-${index}`}
                          aria-label={`Dado ${index + 1} de ${profileLabel(profileId)}`}
                          value={values[index] ?? ""}
                          onChange={(event) => changeRoll(profileId, index, event.target.value)}
                          disabled={isSaving}
                          className="text-center"
                        >
                          <option value="">–</option>
                          {[1, 2, 3, 4, 5, 6].map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <div className="flex flex-col gap-1.5">
          <Select
            id="scoreboard-loser"
            label="Perdedor"
            value={loserProfileId}
            onChange={(event) => {
              setLoserProfileId(event.target.value);
              setError(null);
            }}
            disabled={isSaving}
          >
            <option value="">Selecione o perdedor</option>
            {selectedProfileIds.map((profileId) => (
              <option key={profileId} value={profileId}>
                {profileLabel(profileId)}
              </option>
            ))}
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            fullWidth={false}
            onClick={handleSuggestLoser}
            disabled={isSaving}
            className="self-start"
          >
            Usar menor soma
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="scoreboard-spent" className="text-sm font-semibold text-ink-200">
            Quanto o perdedor gastou?
          </label>

          <CurrencyInput
            id="scoreboard-spent"
            name="spent"
            value={spent}
            onChange={(value) => {
              setSpent(value);
              setError(null);
            }}
            disabled={isSaving}
            required
          />
        </div>

        <ErrorMessage message={error} />

        <div className="flex gap-2">
          <div className="flex-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
          </div>
          <div className="flex-1">
            <Button type="submit" isLoading={isSaving}>
              {session ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default ScoreboardEntryForm;
