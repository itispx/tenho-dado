"use server";

import { randomInt } from "node:crypto";

import { revalidatePath } from "next/cache";

import { SCOREBOARD_ADMIN_USERNAME } from "@/lib/constants";
import { getCurrentUser } from "@/lib/current-user";
import { DIE_SIDES, isDieType, isValidDieValue } from "@/lib/dice";
import { getProfileSummary, isScoreboardAdmin } from "@/lib/permissions";
import { canActForPlayer } from "@/lib/roll-permissions";
import { getTurnPhase } from "@/lib/session-logic";
import { loadSessionView } from "@/lib/session-repository";
import { adminClient } from "@/lib/supabase/admin";
import type { DieType } from "@/types/dice";
import type { SessionData, SessionMode, SessionStatus, SessionView } from "@/types/session";

export interface SessionActionState {
  error: string | null;
}

export interface LoadSessionDataResult extends SessionData {
  error: string | null;
}

const ACTIVE_STATUSES: SessionStatus[] = ["lobby", "playing"];

function revalidateGame() {
  revalidatePath("/game");
}

/**
 * Dívida de um jogador que foi adicionado manualmente por outra pessoa:
 * quem adicionou responde pelo gasto dele.
 */
async function findAddedPlayerDebtRow(userId: string): Promise<{ id: string } | null> {
  const { data: addedRows, error: addedError } = await adminClient
    .from("session_player")
    .select("session_id, profile_id")
    .eq("added_by", userId);

  if (addedError) {
    console.error("[loadSessionData] added players error", addedError);
    return null;
  }

  const pairs = addedRows ?? [];

  if (pairs.length === 0) return null;

  const { data: finishedRows, error: finishedError } = await adminClient
    .from("game_session")
    .select("id, loser_profile_id, finished_at")
    .in("id", [...new Set(pairs.map((pair) => pair.session_id))])
    .eq("status", "finished")
    .is("loser_spent", null)
    .order("finished_at", { ascending: false, nullsFirst: false });

  if (finishedError) {
    console.error("[loadSessionData] added players debt error", finishedError);
    return null;
  }

  const addedKey = new Set(pairs.map((pair) => `${pair.session_id}:${pair.profile_id}`));
  const owed = (finishedRows ?? []).find(
    (session) => session.loser_profile_id && addedKey.has(`${session.id}:${session.loser_profile_id}`),
  );

  return owed ? { id: owed.id } : null;
}

export async function loadSessionDataAction(): Promise<LoadSessionDataResult> {
  const user = await getCurrentUser();

  if (!user) return { active: null, pendingDebt: null, error: "Não autenticado." };

  const profile = await getProfileSummary(user.id);

  const { data: activeRow, error: activeError } = await adminClient
    .from("game_session")
    .select("id")
    .in("status", ACTIVE_STATUSES)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeError) {
    console.error("[loadSessionData] active error", activeError);
    return { active: null, pendingDebt: null, error: "Erro ao carregar a sessão." };
  }

  const { data: ownDebtRow, error: debtError } = await adminClient
    .from("game_session")
    .select("id")
    .eq("status", "finished")
    .eq("loser_profile_id", user.id)
    .is("loser_spent", null)
    .order("finished_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (debtError) {
    console.error("[loadSessionData] debt error", debtError);
    return { active: null, pendingDebt: null, error: "Erro ao carregar a sessão." };
  }

  let debtRow = ownDebtRow ?? (await findAddedPlayerDebtRow(user.id));

  if (!debtRow && profile?.username === SCOREBOARD_ADMIN_USERNAME) {
    const { data: managedProfiles, error: managedError } = await adminClient
      .from("profile")
      .select("id")
      .eq("is_managed", true);

    if (managedError) {
      console.error("[loadSessionData] managed profiles error", managedError);
      return { active: null, pendingDebt: null, error: "Erro ao carregar a sessão." };
    }

    const managedIds = (managedProfiles ?? []).map((managed) => managed.id);

    if (managedIds.length) {
      const { data: managedDebtRow, error: managedDebtError } = await adminClient
        .from("game_session")
        .select("id")
        .eq("status", "finished")
        .in("loser_profile_id", managedIds)
        .is("loser_spent", null)
        .order("finished_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      if (managedDebtError) {
        console.error("[loadSessionData] managed debt error", managedDebtError);
        return { active: null, pendingDebt: null, error: "Erro ao carregar a sessão." };
      }

      debtRow = managedDebtRow;
    }
  }

  const [active, pendingDebt] = await Promise.all([
    activeRow ? loadSessionView(activeRow.id) : Promise.resolve(null),
    debtRow ? loadSessionView(debtRow.id) : Promise.resolve(null),
  ]);

  return { active, pendingDebt, error: null };
}

export async function loadSessionByIdAction(sessionId: string): Promise<SessionView | null> {
  const user = await getCurrentUser();

  if (!user) return null;

  const session = await loadSessionView(sessionId);

  if (!session) return null;

  const isParticipant = session.players.some((player) => player.profile_id === user.id);

  return isParticipant ? session : null;
}

export async function createSessionAction(mode: SessionMode, die: DieType = "d6"): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Não autenticado." };

  if (mode !== "manual" && mode !== "online") {
    return { error: "Modo de jogo inválido." };
  }

  if (!isDieType(die)) {
    return { error: "Dado inválido." };
  }

  const { data: activeSession, error: activeError } = await adminClient
    .from("game_session")
    .select("id")
    .in("status", ACTIVE_STATUSES)
    .limit(1)
    .maybeSingle();

  if (activeError) {
    console.error("[createSession] active lookup error", activeError);
    return { error: "Erro ao verificar a sessão atual." };
  }

  if (activeSession) return { error: "Já existe uma sessão ativa no jogo." };

  const { data: session, error: sessionError } = await adminClient
    .from("game_session")
    .insert({ host_id: user.id, mode, die })
    .select("id")
    .single();

  if (sessionError) {
    console.error("[createSession] insert error", sessionError);

    if (sessionError.code === "23505") return { error: "Já existe uma sessão ativa no jogo." };

    return { error: "Erro ao criar a sessão." };
  }

  const { error: playerError } = await adminClient
    .from("session_player")
    .insert({ session_id: session.id, profile_id: user.id, turn_order: 1 });

  if (playerError) {
    console.error("[createSession] player insert error", playerError);
    await adminClient.from("game_session").delete().eq("id", session.id);
    return { error: "Erro ao entrar na sessão." };
  }

  revalidateGame();
  return { error: null };
}

export async function joinSessionAction(sessionId: string): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Não autenticado." };

  const { data: session, error: sessionError } = await adminClient
    .from("game_session")
    .select("id, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    console.error("[joinSession] lookup error", sessionError);
    return { error: "Erro ao entrar na sessão." };
  }

  if (!session || session.status !== "lobby") {
    return { error: "Esta sessão não está mais aceitando jogadores." };
  }

  const { error } = await adminClient.from("session_player").insert({ session_id: sessionId, profile_id: user.id });

  if (error) {
    console.error("[joinSession] insert error", error);

    if (error.code === "23505") return { error: "Você já está nesta sessão." };

    return { error: "Erro ao entrar na sessão." };
  }

  revalidateGame();
  return { error: null };
}

export async function addSessionPlayerAction(sessionId: string, profileId: string): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Não autenticado." };

  const session = await loadSessionView(sessionId);

  if (!session) return { error: "Sessão não encontrada." };
  if (session.status !== "lobby") return { error: "Só é possível adicionar jogadores no lobby." };

  if (session.host_id !== user.id && !(await isScoreboardAdmin(user.id))) {
    return { error: "Apenas o criador da sessão ou itspx pode adicionar jogadores." };
  }

  if (session.players.some((player) => player.profile_id === profileId)) {
    return { error: "Este jogador já está na sessão." };
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profile")
    .select("id")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError) {
    console.error("[addSessionPlayer] profile error", profileError);
    return { error: "Erro ao buscar o jogador." };
  }

  if (!profile) return { error: "Jogador não encontrado." };

  const { error } = await adminClient
    .from("session_player")
    .insert({ session_id: sessionId, profile_id: profileId, added_by: user.id });

  if (error) {
    console.error("[addSessionPlayer] insert error", error);

    if (error.code === "23505") return { error: "Este jogador já está na sessão." };

    return { error: "Erro ao adicionar jogador." };
  }

  revalidateGame();
  return { error: null };
}

export async function leaveSessionAction(sessionId: string): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Não autenticado." };

  const session = await loadSessionView(sessionId);

  if (!session) return { error: "Sessão não encontrada." };
  if (session.status !== "lobby") return { error: "Não é possível sair com a partida em andamento." };
  if (session.host_id === user.id) return { error: "O criador deve encerrar a sessão." };

  const player = session.players.find((item) => item.profile_id === user.id);

  if (!player) return { error: "Você não está nesta sessão." };

  const { error } = await adminClient.from("session_player").delete().eq("id", player.id);

  if (error) {
    console.error("[leaveSession] delete error", error);
    return { error: "Erro ao sair da sessão." };
  }

  revalidateGame();
  return { error: null };
}

export async function kickPlayerAction(sessionId: string, playerId: string): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Não autenticado." };

  const session = await loadSessionView(sessionId);

  if (!session) return { error: "Sessão não encontrada." };
  if (session.host_id !== user.id) return { error: "Apenas o criador pode remover jogadores." };
  if (session.status !== "lobby") return { error: "Só é possível remover jogadores no lobby." };

  const player = session.players.find((item) => item.id === playerId);

  if (!player) return { error: "Jogador não encontrado." };
  if (player.profile_id === session.host_id) return { error: "O criador não pode ser removido." };

  const { error } = await adminClient.from("session_player").delete().eq("id", playerId).eq("session_id", sessionId);

  if (error) {
    console.error("[kickPlayer] delete error", error);
    return { error: "Erro ao remover jogador." };
  }

  revalidateGame();
  return { error: null };
}

export async function startSessionAction(sessionId: string): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Não autenticado." };

  const session = await loadSessionView(sessionId);

  if (!session) return { error: "Sessão não encontrada." };
  if (session.host_id !== user.id) return { error: "Apenas o criador pode iniciar a sessão." };
  if (session.status !== "lobby") return { error: "A sessão já foi iniciada." };
  if (session.players.length < 2) return { error: "São necessários pelo menos 2 jogadores." };

  const shuffled = [...session.players];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = randomInt(index + 1);
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  for (const [index, player] of shuffled.entries()) {
    const { error } = await adminClient
      .from("session_player")
      .update({ turn_order: index + 1 })
      .eq("id", player.id);

    if (error) {
      console.error("[startSession] turn order error", error);
      return { error: "Erro ao sortear a ordem dos jogadores." };
    }
  }

  const { error: sessionError } = await adminClient
    .from("game_session")
    .update({ status: "playing", started_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("status", "lobby");

  if (sessionError) {
    console.error("[startSession] update error", sessionError);
    return { error: "Erro ao iniciar a sessão." };
  }

  revalidateGame();
  return { error: null };
}

export async function resendInviteAction(sessionId: string): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Não autenticado." };

  const session = await loadSessionView(sessionId);

  if (!session) return { error: "Sessão não encontrada." };
  if (session.host_id !== user.id) return { error: "Apenas o criador pode reenviar o convite." };
  if (session.status !== "lobby") return { error: "Só é possível convidar no lobby." };

  const { error } = await adminClient
    .from("game_session")
    .update({ invite_version: session.invite_version + 1 })
    .eq("id", sessionId);

  if (error) {
    console.error("[resendInvite] update error", error);
    return { error: "Erro ao reenviar o convite." };
  }

  revalidateGame();
  return { error: null };
}

export async function endSessionAction(sessionId: string): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Não autenticado." };

  const session = await loadSessionView(sessionId);

  if (!session) return { error: "Sessão não encontrada." };
  if (session.host_id !== user.id) return { error: "Apenas o criador pode encerrar a sessão." };

  const { error } = await adminClient.from("game_session").delete().eq("id", sessionId);

  if (error) {
    console.error("[endSession] delete error", error);
    return { error: "Erro ao encerrar a sessão." };
  }

  revalidateGame();
  return { error: null };
}

export async function cancelGameAction(sessionId: string): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Não autenticado." };

  const session = await loadSessionView(sessionId);

  if (!session) return { error: "Sessão não encontrada." };
  if (session.host_id !== user.id) return { error: "Apenas o criador pode cancelar a partida." };
  if (session.status !== "playing") return { error: "A partida não está em andamento." };

  const playerIds = session.players.map((player) => player.id);

  if (playerIds.length) {
    const { error: rollsError } = await adminClient.from("session_roll").delete().in("session_player_id", playerIds);

    if (rollsError) {
      console.error("[cancelGame] rolls delete error", rollsError);
      return { error: "Erro ao cancelar a partida." };
    }
  }

  for (const player of session.players) {
    const { error } = await adminClient.from("session_player").update({ turn_order: null }).eq("id", player.id);

    if (error) {
      console.error("[cancelGame] turn order reset error", error);
      return { error: "Erro ao cancelar a partida." };
    }
  }

  const { error: sessionError } = await adminClient
    .from("game_session")
    .update({
      status: "lobby",
      started_at: null,
      finished_at: null,
      loser_profile_id: null,
      loser_spent: null,
    })
    .eq("id", sessionId)
    .eq("status", "playing");

  if (sessionError) {
    console.error("[cancelGame] update error", sessionError);
    return { error: "Erro ao cancelar a partida." };
  }

  revalidateGame();
  return { error: null };
}

async function finalizeSession(sessionId: string) {
  const session = await loadSessionView(sessionId);

  if (!session || session.status !== "playing") return;

  const phase = getTurnPhase(session.players, session.rolls);

  if (phase.kind !== "finished") return;

  const loser = session.players.find((player) => player.id === phase.loserId);

  if (!loser) return;

  const { error } = await adminClient
    .from("game_session")
    .update({
      status: "finished",
      loser_profile_id: loser.profile_id,
      finished_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("status", "playing");

  if (error) {
    console.error("[finalizeSession] update error", error);
  }
}

export async function rollDiceAction(sessionId: string): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Não autenticado." };

  const session = await loadSessionView(sessionId);

  if (!session) return { error: "Sessão não encontrada." };
  if (session.status !== "playing") return { error: "A partida não está em andamento." };
  if (session.mode !== "online") return { error: "Esta sessão usa o dado manual." };

  const phase = getTurnPhase(session.players, session.rolls);

  if (phase.kind !== "regular" && phase.kind !== "tiebreak") {
    return { error: "A partida já terminou." };
  }

  const currentPlayer = session.players.find((player) => player.id === phase.playerId);

  if (!currentPlayer) return { error: "Jogador da vez não encontrado." };

  const isHost = session.host_id === user.id;
  const needsAdminCheck = currentPlayer.profile_id !== user.id && !isHost;
  const allowed = canActForPlayer(currentPlayer, user.id, {
    isHost,
    isScoreboardAdmin: needsAdminCheck ? await isScoreboardAdmin(user.id) : false,
  });

  if (!allowed) return { error: "Não é a sua vez." };

  const { error } = await adminClient.from("session_roll").insert({
    session_player_id: currentPlayer.id,
    value: randomInt(1, DIE_SIDES[session.die] + 1),
    round: phase.round,
    is_tiebreak: phase.kind === "tiebreak",
  });

  if (error) {
    console.error("[rollDice] insert error", error);

    if (error.code === "23505") return { error: "Esta jogada já foi registrada." };

    return { error: "Erro ao rolar o dado." };
  }

  await finalizeSession(sessionId);
  revalidateGame();

  return { error: null };
}

export async function submitManualRollAction(
  sessionId: string,
  playerId: string,
  value: number,
): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Não autenticado." };

  if (!Number.isInteger(value) || value < 1 || value > DIE_SIDES.d20) {
    return { error: "Valor de dado inválido." };
  }

  const session = await loadSessionView(sessionId);

  if (!session) return { error: "Sessão não encontrada." };
  if (session.host_id !== user.id) return { error: "Apenas o criador pode registrar as jogadas." };
  if (session.mode !== "manual") return { error: "Esta sessão usa o dado online." };
  if (session.status !== "playing") return { error: "A partida não está em andamento." };

  if (!isValidDieValue(value, session.die)) {
    return { error: `O valor deve estar entre 1 e ${DIE_SIDES[session.die]}.` };
  }

  const phase = getTurnPhase(session.players, session.rolls);

  if (phase.kind !== "regular" && phase.kind !== "tiebreak") {
    return { error: "A partida já terminou." };
  }

  if (phase.playerId !== playerId) return { error: "Não é a vez deste jogador." };

  const currentPlayer = session.players.find((player) => player.id === phase.playerId);

  if (!currentPlayer) return { error: "Jogador da vez não encontrado." };

  const { error } = await adminClient.from("session_roll").insert({
    session_player_id: currentPlayer.id,
    value,
    round: phase.round,
    is_tiebreak: phase.kind === "tiebreak",
  });

  if (error) {
    console.error("[submitManualRoll] insert error", error);

    if (error.code === "23505") return { error: "Esta jogada já foi registrada." };

    return { error: "Erro ao registrar a jogada." };
  }

  await finalizeSession(sessionId);
  revalidateGame();

  return { error: null };
}

export async function submitSpentAction(sessionId: string, amount: number): Promise<SessionActionState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Não autenticado." };

  if (!Number.isFinite(amount) || amount < 0 || amount > 10_000_000) {
    return { error: "Informe um valor válido." };
  }

  const session = await loadSessionView(sessionId);

  if (!session) return { error: "Sessão não encontrada." };
  if (session.status !== "finished") return { error: "A sessão ainda não terminou." };
  if (session.loser_spent !== null) return { error: "O valor já foi registrado." };

  const loserPlayer = session.loser_profile_id
    ? (session.players.find((player) => player.profile_id === session.loser_profile_id) ?? null)
    : null;

  if (!loserPlayer) return { error: "Perdedor não encontrado." };

  const isLoser = session.loser_profile_id === user.id;
  const isAdder = loserPlayer.added_by === user.id;

  if (!isLoser && !isAdder && !(await isScoreboardAdmin(user.id))) {
    return { error: "Apenas o perdedor, quem o adicionou ou itspx pode registrar o gasto." };
  }

  const rounded = Math.round(amount * 100) / 100;

  const { error } = await adminClient
    .from("game_session")
    .update({ loser_spent: rounded })
    .eq("id", sessionId)
    .is("loser_spent", null);

  if (error) {
    console.error("[submitSpent] update error", error);
    return { error: "Erro ao salvar o valor." };
  }

  revalidateGame();
  return { error: null };
}
