"use server";

import { randomBytes, randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import { EMAIL_DOMAIN, SCOREBOARD_ADMIN_USERNAME } from "@/lib/constants";
import { getCurrentUser } from "@/lib/current-user";
import { getProfileSummary } from "@/lib/permissions";
import { adminClient } from "@/lib/supabase/admin";
import type { ManagedPlayer } from "@/types/managed-player";
import type { ProfileOption } from "@/types/session";

export interface ManagedActionResult {
  error: string | null;
}

export interface LoadManagedPlayersResult {
  managed: ManagedPlayer[];
  real: ProfileOption[];
  error: string | null;
}

async function requireAdmin(): Promise<{ userId: string | null; error: string | null }> {
  const user = await getCurrentUser();

  if (!user) return { userId: null, error: "Não autenticado." };

  const profile = await getProfileSummary(user.id);

  if (profile?.username !== SCOREBOARD_ADMIN_USERNAME) {
    return { userId: null, error: "Apenas itspx pode gerenciar jogadores." };
  }

  return { userId: user.id, error: null };
}

function revalidatePlayers() {
  revalidatePath("/game");
  revalidatePath("/game/quadro");
  revalidatePath("/game/analytics");
  revalidatePath("/game/jogadores");
}

export async function loadManagedPlayersAction(): Promise<LoadManagedPlayersResult> {
  const admin = await requireAdmin();

  if (admin.error || !admin.userId) {
    return { managed: [], real: [], error: admin.error ?? "Sem permissão." };
  }

  const { data: managedRows, error: managedError } = await adminClient
    .from("profile")
    .select("id, username, created_at")
    .eq("is_managed", true)
    .eq("managed_by", admin.userId)
    .order("username", { ascending: true });

  if (managedError) {
    console.error("[loadManagedPlayers] managed error", managedError);
    return { managed: [], real: [], error: "Erro ao carregar os jogadores geridos." };
  }

  const { data: realRows, error: realError } = await adminClient
    .from("profile")
    .select("id, username, is_managed")
    .eq("is_managed", false)
    .neq("id", admin.userId)
    .order("username", { ascending: true });

  if (realError) {
    console.error("[loadManagedPlayers] real error", realError);
    return { managed: [], real: [], error: "Erro ao carregar as contas reais." };
  }

  return {
    managed: (managedRows ?? []).map((profile) => ({
      id: profile.id,
      username: profile.username,
      created_at: profile.created_at,
    })),
    real: (realRows ?? []).map((profile) => ({
      id: profile.id,
      username: profile.username,
      isManaged: profile.is_managed,
    })),
    error: null,
  };
}

export async function createManagedPlayerAction(username: string): Promise<ManagedActionResult> {
  const admin = await requireAdmin();

  if (admin.error || !admin.userId) return { error: admin.error ?? "Sem permissão." };

  const cleanUsername = username.trim();

  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return { error: "O username deve ter entre 3 e 20 caracteres." };
  }

  const { data: existing, error: existingError } = await adminClient
    .from("profile")
    .select("id")
    .eq("username", cleanUsername)
    .limit(1);

  if (existingError) {
    console.error("[createManagedPlayer] existing error", existingError);
    return { error: "Erro ao verificar o username." };
  }

  if (existing?.length) return { error: "Já existe um jogador com esse username." };

  const managedEmail = `managed-${randomUUID()}@${EMAIL_DOMAIN}`;
  const password = randomBytes(32).toString("base64url");

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: managedEmail,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    console.error("[createManagedPlayer] auth error", createError);
    return { error: "Erro ao criar a conta gerida." };
  }

  const { error: profileError } = await adminClient.from("profile").insert({
    id: created.user.id,
    username: cleanUsername,
    is_managed: true,
    managed_by: admin.userId,
  });

  if (profileError) {
    console.error("[createManagedPlayer] profile error", profileError);
    await adminClient.auth.admin.deleteUser(created.user.id);
    return { error: "Erro ao criar o perfil gerido." };
  }

  revalidatePlayers();
  return { error: null };
}

export async function linkManagedPlayerAction(managedId: string, realId: string): Promise<ManagedActionResult> {
  const admin = await requireAdmin();

  if (admin.error || !admin.userId) return { error: admin.error ?? "Sem permissão." };

  if (managedId === realId) return { error: "Selecione uma conta real diferente." };

  const { data: managed, error: managedError } = await adminClient
    .from("profile")
    .select("id, username")
    .eq("id", managedId)
    .eq("is_managed", true)
    .eq("managed_by", admin.userId)
    .maybeSingle();

  if (managedError) {
    console.error("[linkManagedPlayer] managed error", managedError);
    return { error: "Erro ao buscar o jogador gerido." };
  }

  if (!managed) return { error: "Jogador gerido não encontrado." };

  const { data: real, error: realError } = await adminClient
    .from("profile")
    .select("id")
    .eq("id", realId)
    .eq("is_managed", false)
    .maybeSingle();

  if (realError) {
    console.error("[linkManagedPlayer] real error", realError);
    return { error: "Erro ao buscar a conta real." };
  }

  if (!real) return { error: "Conta real não encontrada." };
  if (realId === admin.userId) return { error: "Não vincule a sua própria conta." };

  const { data: managedPlayers, error: playersError } = await adminClient
    .from("session_player")
    .select("session_id")
    .eq("profile_id", managedId);

  if (playersError) {
    console.error("[linkManagedPlayer] managed players error", playersError);
    return { error: "Erro ao verificar as partidas do jogador." };
  }

  const sessionIds = [...new Set((managedPlayers ?? []).map((player) => player.session_id))];

  if (sessionIds.length) {
    const { data: activeSessions, error: activeError } = await adminClient
      .from("game_session")
      .select("id")
      .in("id", sessionIds)
      .in("status", ["lobby", "playing"])
      .limit(1);

    if (activeError) {
      console.error("[linkManagedPlayer] active error", activeError);
      return { error: "Erro ao verificar sessões ativas." };
    }

    if (activeSessions?.length) {
      return { error: "Finalize ou cancele a sessão ativa antes de vincular." };
    }

    const { data: conflicts, error: conflictsError } = await adminClient
      .from("session_player")
      .select("session_id")
      .eq("profile_id", realId)
      .in("session_id", sessionIds)
      .limit(1);

    if (conflictsError) {
      console.error("[linkManagedPlayer] conflicts error", conflictsError);
      return { error: "Erro ao verificar conflitos de partidas." };
    }

    if (conflicts?.length) {
      return {
        error: "As duas contas participaram da mesma partida. Ajuste ou exclua essa partida antes de vincular.",
      };
    }
  }

  const { data: pendingDebts, error: debtsError } = await adminClient
    .from("game_session")
    .select("id")
    .eq("loser_profile_id", managedId)
    .is("loser_spent", null)
    .eq("status", "finished")
    .limit(1);

  if (debtsError) {
    console.error("[linkManagedPlayer] debts error", debtsError);
    return { error: "Erro ao verificar gastos pendentes." };
  }

  if (pendingDebts?.length) {
    return { error: "Registre os gastos pendentes do jogador gerido antes de vincular." };
  }

  const { error: playersUpdateError } = await adminClient
    .from("session_player")
    .update({ profile_id: realId })
    .eq("profile_id", managedId);

  if (playersUpdateError) {
    console.error("[linkManagedPlayer] players update error", playersUpdateError);
    return { error: "Erro ao transferir as participações." };
  }

  const { error: hostUpdateError } = await adminClient
    .from("game_session")
    .update({ host_id: realId })
    .eq("host_id", managedId);

  if (hostUpdateError) {
    console.error("[linkManagedPlayer] host update error", hostUpdateError);
    return { error: "Erro ao transferir as sessões criadas." };
  }

  const { error: loserUpdateError } = await adminClient
    .from("game_session")
    .update({ loser_profile_id: realId })
    .eq("loser_profile_id", managedId);

  if (loserUpdateError) {
    console.error("[linkManagedPlayer] loser update error", loserUpdateError);
    return { error: "Erro ao transferir as derrotas." };
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(managedId);

  if (deleteError) {
    console.error("[linkManagedPlayer] delete error", deleteError);
    return { error: "O histórico foi transferido, mas não foi possível remover o perfil gerido." };
  }

  revalidatePlayers();
  return { error: null };
}

export async function deleteManagedPlayerAction(managedId: string): Promise<ManagedActionResult> {
  const admin = await requireAdmin();

  if (admin.error || !admin.userId) return { error: admin.error ?? "Sem permissão." };

  const { data: managed, error: managedError } = await adminClient
    .from("profile")
    .select("id")
    .eq("id", managedId)
    .eq("is_managed", true)
    .eq("managed_by", admin.userId)
    .maybeSingle();

  if (managedError) {
    console.error("[deleteManagedPlayer] lookup error", managedError);
    return { error: "Erro ao buscar o jogador gerido." };
  }

  if (!managed) return { error: "Jogador gerido não encontrado." };

  const { data: participations, error: participationsError } = await adminClient
    .from("session_player")
    .select("id")
    .eq("profile_id", managedId)
    .limit(1);

  if (participationsError) {
    console.error("[deleteManagedPlayer] participations error", participationsError);
    return { error: "Erro ao verificar as partidas do jogador." };
  }

  const { data: sessions, error: sessionsError } = await adminClient
    .from("game_session")
    .select("id")
    .or(`host_id.eq.${managedId},loser_profile_id.eq.${managedId}`)
    .limit(1);

  if (sessionsError) {
    console.error("[deleteManagedPlayer] sessions error", sessionsError);
    return { error: "Erro ao verificar as sessões do jogador." };
  }

  if (participations?.length || sessions?.length) {
    return { error: "Este jogador já tem histórico. Vincule a uma conta real em vez de excluir." };
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(managedId);

  if (deleteError) {
    console.error("[deleteManagedPlayer] delete error", deleteError);
    return { error: "Erro ao excluir o jogador gerido." };
  }

  revalidatePlayers();
  return { error: null };
}
