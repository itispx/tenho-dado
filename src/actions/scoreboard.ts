"use server";

import { revalidatePath } from "next/cache";

import { SCOREBOARD_ADMIN_USERNAME, SCOREBOARD_PAGE_SIZE } from "@/lib/constants";
import { getCurrentUser } from "@/lib/current-user";
import { getProfileSummary } from "@/lib/permissions";
import { loadProfiles, loadSessionViews } from "@/lib/session-repository";
import { adminClient } from "@/lib/supabase/admin";
import type { AnalyticsEntry, ScoreboardInput } from "@/types/scoreboard";
import type { ProfileOption, SessionView } from "@/types/session";

export interface ScoreboardActionResult {
  error: string | null;
}

export interface LoadScoreboardResult {
  sessions: SessionView[];
  profiles: ProfileOption[];
  canManage: boolean;
  totalGames: number;
  totalSpent: number;
  hasMore: boolean;
  error: string | null;
}

export interface LoadMoreScoreboardResult {
  sessions: SessionView[];
  hasMore: boolean;
  error: string | null;
}

export interface LoadAnalyticsResult {
  entries: AnalyticsEntry[];
  profiles: ProfileOption[];
  error: string | null;
}

interface ValidatedInput {
  finishedAt: string;
  players: { profileId: string; rolls: [number, number, number] }[];
  loserProfileId: string;
  loserSpent: number;
}

async function getScoreboardAdmin(): Promise<{ userId: string | null; error: string | null }> {
  const user = await getCurrentUser();

  if (!user) return { userId: null, error: "Não autenticado." };

  const profile = await getProfileSummary(user.id);

  if (!profile) {
    console.error("[scoreboard] admin profile not found");
    return { userId: null, error: "Erro ao verificar permissão." };
  }

  if (profile.username !== SCOREBOARD_ADMIN_USERNAME) {
    return { userId: null, error: "Apenas itspx pode alterar o quadro." };
  }

  return { userId: user.id, error: null };
}

function revalidateScoreboard() {
  revalidatePath("/game/quadro");
  revalidatePath("/game/analytics");
}

function parseFinishedAt(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString();
}

async function validateInput(input: ScoreboardInput): Promise<{ data: ValidatedInput | null; error: string | null }> {
  if (
    !input ||
    typeof input.finishedAt !== "string" ||
    !Array.isArray(input.players) ||
    typeof input.loserProfileId !== "string" ||
    typeof input.loserSpent !== "number"
  ) {
    return { data: null, error: "Dados inválidos." };
  }

  const finishedAt = parseFinishedAt(input.finishedAt);

  if (!finishedAt) return { data: null, error: "Informe uma data válida." };

  if (input.players.length < 2) {
    return { data: null, error: "Selecione pelo menos 2 jogadores." };
  }

  const profileIds: string[] = [];

  for (const player of input.players) {
    if (!player || typeof player.profileId !== "string" || !Array.isArray(player.rolls) || player.rolls.length !== 3) {
      return { data: null, error: "Cada jogador precisa ter 3 jogadas." };
    }

    for (const roll of player.rolls) {
      if (!Number.isInteger(roll) || roll < 1 || roll > 6) {
        return { data: null, error: "Os dados devem estar entre 1 e 6." };
      }
    }

    profileIds.push(player.profileId);
  }

  const uniqueProfileIds = new Set(profileIds);

  if (uniqueProfileIds.size !== profileIds.length) {
    return { data: null, error: "Cada jogador só pode aparecer uma vez." };
  }

  if (!uniqueProfileIds.has(input.loserProfileId)) {
    return { data: null, error: "O perdedor precisa ser um dos jogadores." };
  }

  if (!Number.isFinite(input.loserSpent) || input.loserSpent < 0 || input.loserSpent > 10_000_000) {
    return { data: null, error: "Informe um valor gasto válido." };
  }

  const profiles = await loadProfiles();
  const validProfileIds = new Set(profiles.map((profile) => profile.id));

  if (![...uniqueProfileIds].every((profileId) => validProfileIds.has(profileId))) {
    return { data: null, error: "Um dos jogadores não foi encontrado." };
  }

  return {
    data: {
      finishedAt,
      players: input.players,
      loserProfileId: input.loserProfileId,
      loserSpent: Math.round(input.loserSpent * 100) / 100,
    },
    error: null,
  };
}

async function loadFinishedSessionPage(offset: number, limit: number): Promise<LoadMoreScoreboardResult> {
  const { data: rows, error } = await adminClient
    .from("game_session")
    .select("id")
    .eq("status", "finished")
    .order("finished_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    console.error("[loadFinishedSessionPage] sessions error", error);
    return { sessions: [], hasMore: false, error: "Erro ao carregar o quadro." };
  }

  const ids = (rows ?? []).slice(0, limit).map((row) => row.id);
  const sessions = await loadSessionViews(ids);

  return { sessions, hasMore: (rows ?? []).length > limit, error: null };
}

export async function loadScoreboardAction(): Promise<LoadScoreboardResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      sessions: [],
      profiles: [],
      canManage: false,
      totalGames: 0,
      totalSpent: 0,
      hasMore: false,
      error: "Não autenticado.",
    };
  }

  const [profile, totalsResult, page, profiles] = await Promise.all([
    getProfileSummary(user.id),
    adminClient.from("game_session").select("loser_spent", { count: "exact" }).eq("status", "finished"),
    loadFinishedSessionPage(0, SCOREBOARD_PAGE_SIZE),
    loadProfiles(),
  ]);

  if (totalsResult.error || page.error) {
    return {
      sessions: [],
      profiles: [],
      canManage: false,
      totalGames: 0,
      totalSpent: 0,
      hasMore: false,
      error: page.error ?? "Erro ao carregar o quadro.",
    };
  }

  const totalSpent = (totalsResult.data ?? []).reduce((sum, row) => {
    return sum + (row.loser_spent === null ? 0 : Number(row.loser_spent));
  }, 0);

  return {
    sessions: page.sessions,
    profiles,
    canManage: profile?.username === SCOREBOARD_ADMIN_USERNAME,
    totalGames: totalsResult.count ?? totalsResult.data?.length ?? 0,
    totalSpent,
    hasMore: page.hasMore,
    error: null,
  };
}

export async function loadMoreScoreboardAction(offset: number): Promise<LoadMoreScoreboardResult> {
  const user = await getCurrentUser();

  if (!user) return { sessions: [], hasMore: false, error: "Não autenticado." };
  if (!Number.isInteger(offset) || offset < 0) {
    return { sessions: [], hasMore: false, error: "Posição inválida." };
  }

  return loadFinishedSessionPage(offset, SCOREBOARD_PAGE_SIZE);
}

export async function loadAnalyticsAction(): Promise<LoadAnalyticsResult> {
  const user = await getCurrentUser();

  if (!user) return { entries: [], profiles: [], error: "Não autenticado." };

  const { data: rows, error } = await adminClient
    .from("game_session")
    .select("id, finished_at, created_at, loser_profile_id, loser_spent")
    .eq("status", "finished")
    .order("finished_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[loadAnalytics] error", error);
    return { entries: [], profiles: [], error: "Erro ao carregar as análises." };
  }

  const profiles = await loadProfiles();
  const entries: AnalyticsEntry[] = (rows ?? []).map((row) => ({
    id: row.id,
    finished_at: row.finished_at ?? row.created_at,
    loser_profile_id: row.loser_profile_id,
    loser_spent: row.loser_spent === null ? null : Number(row.loser_spent),
  }));

  return { entries, profiles, error: null };
}

export async function createRetroactiveSessionAction(input: ScoreboardInput): Promise<ScoreboardActionResult> {
  const admin = await getScoreboardAdmin();

  if (admin.error || !admin.userId) return { error: admin.error ?? "Sem permissão." };

  const validation = await validateInput(input);

  if (validation.error || !validation.data) return { error: validation.error ?? "Dados inválidos." };

  const data = validation.data;

  const { data: session, error: sessionError } = await adminClient
    .from("game_session")
    .insert({
      host_id: admin.userId,
      mode: "manual",
      status: "finished",
      source: "retroactive",
      loser_profile_id: data.loserProfileId,
      loser_spent: data.loserSpent,
      finished_at: data.finishedAt,
      started_at: null,
    })
    .select("id")
    .single();

  if (sessionError) {
    console.error("[createRetroactiveSession] insert error", sessionError);
    return { error: "Erro ao criar a partida retroativa." };
  }

  const { data: playerRows, error: playersError } = await adminClient
    .from("session_player")
    .insert(
      data.players.map((player, index) => ({
        session_id: session.id,
        profile_id: player.profileId,
        turn_order: index + 1,
      })),
    )
    .select("id, profile_id");

  if (playersError || !playerRows) {
    console.error("[createRetroactiveSession] players error", playersError);
    await adminClient.from("game_session").delete().eq("id", session.id);
    return { error: "Erro ao adicionar os jogadores." };
  }

  const playerByProfile = new Map(playerRows.map((player) => [player.profile_id, player.id]));

  const rolls = data.players.flatMap((player) => {
    const playerId = playerByProfile.get(player.profileId);

    if (!playerId) return [];

    return player.rolls.map((value, index) => ({
      session_player_id: playerId,
      value,
      round: index + 1,
      is_tiebreak: false,
    }));
  });

  const { error: rollsError } = await adminClient.from("session_roll").insert(rolls);

  if (rollsError) {
    console.error("[createRetroactiveSession] rolls error", rollsError);
    await adminClient.from("game_session").delete().eq("id", session.id);
    return { error: "Erro ao salvar as jogadas." };
  }

  revalidateScoreboard();
  return { error: null };
}

export async function updateFinishedSessionAction(
  sessionId: string,
  input: ScoreboardInput,
): Promise<ScoreboardActionResult> {
  const admin = await getScoreboardAdmin();

  if (admin.error || !admin.userId) return { error: admin.error ?? "Sem permissão." };

  const { data: session, error: sessionError } = await adminClient
    .from("game_session")
    .select("id, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    console.error("[updateFinishedSession] lookup error", sessionError);
    return { error: "Erro ao buscar a partida." };
  }

  if (!session) return { error: "Partida não encontrada." };
  if (session.status !== "finished") return { error: "Só é possível editar partidas finalizadas." };

  const validation = await validateInput(input);

  if (validation.error || !validation.data) return { error: validation.error ?? "Dados inválidos." };

  const data = validation.data;

  const { data: existingPlayers, error: existingError } = await adminClient
    .from("session_player")
    .select("id, profile_id")
    .eq("session_id", sessionId);

  if (existingError) {
    console.error("[updateFinishedSession] existing players error", existingError);
    return { error: "Erro ao carregar os jogadores atuais." };
  }

  const existingByProfile = new Map((existingPlayers ?? []).map((player) => [player.profile_id, player]));
  const newProfileIds = new Set(data.players.map((player) => player.profileId));
  const removedPlayerIds = (existingPlayers ?? [])
    .filter((player) => !newProfileIds.has(player.profile_id))
    .map((player) => player.id);

  if (removedPlayerIds.length) {
    const { error: removeError } = await adminClient.from("session_player").delete().in("id", removedPlayerIds);

    if (removeError) {
      console.error("[updateFinishedSession] remove players error", removeError);
      return { error: "Erro ao remover jogadores antigos." };
    }
  }

  const playerByProfile = new Map<string, string>();

  for (const [index, player] of data.players.entries()) {
    const existing = existingByProfile.get(player.profileId);

    if (existing) {
      const { error } = await adminClient
        .from("session_player")
        .update({ turn_order: index + 1 })
        .eq("id", existing.id);

      if (error) {
        console.error("[updateFinishedSession] update turn order error", error);
        return { error: "Erro ao atualizar a ordem dos jogadores." };
      }

      playerByProfile.set(player.profileId, existing.id);
      continue;
    }

    const { data: inserted, error } = await adminClient
      .from("session_player")
      .insert({ session_id: sessionId, profile_id: player.profileId, turn_order: index + 1 })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("[updateFinishedSession] insert player error", error);
      return { error: "Erro ao adicionar jogador." };
    }

    playerByProfile.set(player.profileId, inserted.id);
  }

  const rolls = data.players.flatMap((player) => {
    const playerId = playerByProfile.get(player.profileId);

    if (!playerId) return [];

    return player.rolls.map((value, index) => ({
      session_player_id: playerId,
      value,
      round: index + 1,
      is_tiebreak: false,
    }));
  });

  const { error: rollsError } = await adminClient
    .from("session_roll")
    .upsert(rolls, { onConflict: "session_player_id,is_tiebreak,round" });

  if (rollsError) {
    console.error("[updateFinishedSession] rolls error", rollsError);
    return { error: "Erro ao atualizar as jogadas." };
  }

  const { error: updateError } = await adminClient
    .from("game_session")
    .update({
      finished_at: data.finishedAt,
      loser_profile_id: data.loserProfileId,
      loser_spent: data.loserSpent,
    })
    .eq("id", sessionId);

  if (updateError) {
    console.error("[updateFinishedSession] update session error", updateError);
    return { error: "Erro ao atualizar a partida." };
  }

  revalidateScoreboard();
  return { error: null };
}

export async function deleteFinishedSessionAction(sessionId: string): Promise<ScoreboardActionResult> {
  const admin = await getScoreboardAdmin();

  if (admin.error || !admin.userId) return { error: admin.error ?? "Sem permissão." };

  const { data: session, error: sessionError } = await adminClient
    .from("game_session")
    .select("id, status")
    .eq("id", sessionId)
    .maybeSingle();

  if (sessionError) {
    console.error("[deleteFinishedSession] lookup error", sessionError);
    return { error: "Erro ao buscar a partida." };
  }

  if (!session) return { error: "Partida não encontrada." };
  if (session.status !== "finished") return { error: "Só é possível excluir partidas finalizadas." };

  const { error } = await adminClient.from("game_session").delete().eq("id", sessionId);

  if (error) {
    console.error("[deleteFinishedSession] delete error", error);
    return { error: "Erro ao excluir a partida." };
  }

  revalidateScoreboard();
  return { error: null };
}
