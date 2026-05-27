"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Game, LobbyMember } from "@/types/game";

export interface GameActionState {
  error: string | null;
}

// ── Create game ───────────────────────────────────────────────────────────────

export interface CreateGameState extends GameActionState {
  code?: string;
}

export async function createGame(_prev: CreateGameState, formData: FormData): Promise<CreateGameState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Você precisa estar logado." };

  const diceMode = formData.get("dice_mode") as "virtual" | "manual";
  const punishment = (formData.get("punishment") as string | null)?.trim() || null;

  // ADDED: read max_rounds from form, fallback to default 3, guard against < 1
  const rawMaxRounds = Number(formData.get("max_rounds"));
  const maxRounds = Number.isInteger(rawMaxRounds) && rawMaxRounds >= 1 ? rawMaxRounds : 3;

  if (!["virtual", "manual"].includes(diceMode)) {
    return { error: "Modo de dado inválido." };
  }

  const { data: codeData, error: codeError } = await supabase.rpc("generate_lobby_code");

  if (codeError || !codeData) {
    return { error: "Erro ao gerar código do lobby." };
  }

  const { data: game, error } = await supabase
    .from("game")
    .insert({
      code: codeData,
      creator_id: user.id,
      dice_mode: diceMode,
      punishment,
      max_rounds: maxRounds, // ADDED: persist max_rounds on creation
    })
    .select()
    .single();

  if (error || !game) {
    return { error: "Erro ao criar partida. Tente novamente." };
  }

  revalidatePath("/game");
  redirect(`/lobby/${game.code}`);
}

// ── Leave lobby ───────────────────────────────────────────────────────────────

export async function leaveLobby(_prev: GameActionState, formData: FormData): Promise<GameActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Você precisa estar logado." };

  const gameId = formData.get("game_id") as string;

  const { data: game } = await supabase.from("game").select("id, code, creator_id, status").eq("id", gameId).single();

  if (!game) return { error: "Partida não encontrada." };
  if (game.status !== "lobby") return { error: "Não é possível sair de uma partida em andamento." };

  const isCreator = game.creator_id === user.id;

  if (isCreator) {
    const { data: nextPlayer } = await supabase
      .from("game_player")
      .select("player_id")
      .eq("game_id", gameId)
      .neq("player_id", user.id)
      .order("joined_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!nextPlayer) {
      await supabase.from("game").delete().eq("id", gameId);
      redirect("/game");
    }

    await supabase.from("game").update({ creator_id: nextPlayer.player_id }).eq("id", gameId);
  }

  const { error } = await supabase.from("game_player").delete().eq("game_id", gameId).eq("player_id", user.id);

  if (error) return { error: "Erro ao sair do lobby." };

  revalidatePath(`/lobby/${game.code}`);
  redirect("/game");
}

// ── Join by code ──────────────────────────────────────────────────────────────

export async function joinByCode(_prev: GameActionState, formData: FormData): Promise<GameActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Você precisa estar logado." };

  const code = (formData.get("code") as string).trim().toUpperCase();

  if (!code || code.length !== 6) {
    return { error: "Código deve ter 6 caracteres." };
  }

  const { data: game, error: gameError } = await supabase
    .from("game")
    .select("id, code, status")
    .eq("code", code)
    .maybeSingle();

  if (gameError || !game) {
    return { error: "Código não encontrado. Verifique e tente novamente." };
  }

  if (game.status !== "lobby") {
    return { error: "Esta partida já começou ou foi encerrada." };
  }

  const { error: joinError } = await supabase
    .from("game_player")
    .insert({ game_id: game.id, player_id: user.id })
    .single();

  if (joinError && joinError.code !== "23505") {
    return { error: "Não foi possível entrar na partida." };
  }

  revalidatePath("/game");
  redirect(`/lobby/${game.code}`);
}

// ── Invite by username ────────────────────────────────────────────────────────

export interface InviteState extends GameActionState {
  success?: boolean;
}

export async function inviteByUsername(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Você precisa estar logado." };

  const gameId = formData.get("game_id") as string;
  const username = (formData.get("username") as string).trim().toLowerCase();

  if (!username) return { error: "Digite um nome de usuário." };

  const { data: game } = await supabase.from("game").select("id, creator_id, status").eq("id", gameId).single();

  if (!game) return { error: "Partida não encontrada." };
  if (game.creator_id !== user.id) return { error: "Apenas o criador pode convidar." };
  if (game.status !== "lobby") return { error: "A partida já começou." };

  const { data: profile } = await supabase.from("profile").select("id, username").eq("username", username).single();

  if (!profile) return { error: `Jogador "${username}" não encontrado.` };
  if (profile.id === user.id) return { error: "Você já está na partida." };

  const { error: insertError } = await supabase.from("game_player").insert({ game_id: gameId, player_id: profile.id });

  if (insertError) {
    if (insertError.code === "23505") {
      return { error: `${profile.username} já está no lobby.` };
    }
    return { error: "Não foi possível convidar o jogador." };
  }

  return { error: null, success: true };
}

// ── Start game ────────────────────────────────────────────────────────────────

export async function startGame(_prev: GameActionState, formData: FormData): Promise<GameActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Você precisa estar logado." };

  const gameId = formData.get("game_id") as string;

  const { data: game } = await supabase.from("game").select("id, creator_id, status").eq("id", gameId).single();

  if (!game) return { error: "Partida não encontrada." };
  if (game.creator_id !== user.id) return { error: "Apenas o criador pode iniciar." };
  if (game.status !== "lobby") return { error: "A partida já foi iniciada." };

  const { count } = await supabase
    .from("game_player")
    .select("*", { count: "exact", head: true })
    .eq("game_id", gameId);

  if (!count || count < 2) {
    return { error: "Mínimo de 2 jogadores para começar." };
  }

  const { error } = await supabase
    .from("game")
    .update({
      status: "playing",
      started_at: new Date().toISOString(),
      current_round: 1, // ADDED: explicitly start at round 1 so round_number is 1-indexed
    })
    .eq("id", gameId);

  if (error) return { error: "Erro ao iniciar a partida." };

  revalidatePath(`/lobby/${gameId}`);
  redirect(`/game/${gameId}`);
}

// ── Fetch lobby data ──────────────────────────────────────────────────────────

export async function getLobby(code: string): Promise<{
  game: Game | null;
  members: LobbyMember[];
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: game, error: gameError } = await supabase.from("game").select("*").eq("code", code).single();

  if (gameError || !game) {
    return { game: null, members: [], error: "Partida não encontrada." };
  }

  const { data: rows, error: membersError } = await supabase
    .from("game_player")
    .select("*, profile(username)")
    .eq("game_id", game.id)
    .order("joined_at", { ascending: true });

  if (membersError) {
    return { game, members: [], error: "Erro ao carregar jogadores." };
  }

  const members: LobbyMember[] = (rows ?? []).map((row) => ({
    id: row.id,
    gameId: row.game_id,
    playerId: row.player_id,
    joinedAt: row.joined_at,
    username: (row.profile as { username: string } | null)?.username ?? "?",
    // REMOVED: lives and extraDays — these columns don't exist in the schema
  }));

  return { game, members, error: null };
}
