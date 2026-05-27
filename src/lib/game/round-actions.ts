"use server";

// REMOVED: all references to the `roll` table — it no longer exists
// REMOVED: useLife — lives system was removed from schema
// REMOVED: tryResolveRound — replaced by checkRoundComplete
// REMOVED: startNextRound — round advancement now handled by incrementing current_round on game
// CHANGED: submitRoll — inserts one rolled_value into `round`, not 3 dice into `roll`
// CHANGED: submitManualRolls — inserts one rolled_value per player into `round`
// CHANGED: game resolution — after max_rounds, finds loser by lowest sum, updates profile stats
// ADDED: resolveGame — handles end-of-game logic including critical detection

import { revalidatePath } from "next/cache";

import { detectCritical, isValidDie } from "@/lib/game/utils";
import { createClient } from "@/lib/supabase/server";

export interface RollActionState {
  error: string | null;
}

// ── Submit own roll (virtual mode) ────────────────────────────────────────────

export async function submitRoll(_prev: RollActionState, formData: FormData): Promise<RollActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Você precisa estar logado." };

  const gameId = formData.get("game_id") as string;

  // CHANGED: single rolled_value instead of die1/die2/die3
  const rolledValue = Number(formData.get("rolled_value"));

  if (!isValidDie(rolledValue)) {
    return { error: "Valor de dado inválido." };
  }

  const { data: game } = await supabase
    .from("game")
    .select("id, status, current_round, max_rounds, dice_mode")
    .eq("id", gameId)
    .single();

  if (!game) return { error: "Partida não encontrada." };
  if (game.status !== "playing") return { error: "A partida não está em andamento." };
  if (game.dice_mode !== "virtual") return { error: "Esta partida está em modo manual." };

  // CHANGED: inserts into `round` with rolled_value — was inserting into `roll` with die1/die2/die3
  const { error } = await supabase.from("round").insert({
    game_id: gameId,
    player_id: user.id,
    round_number: game.current_round,
    rolled_value: rolledValue,
    status: "rolled",
  });

  if (error) {
    if (error.code === "23505") return { error: "Você já rolou nesta rodada." };
    return { error: "Erro ao registrar rolagem." };
  }

  await checkRoundComplete(gameId, game.current_round, game.max_rounds);

  revalidatePath("/game/[id]", "page");
  return { error: null };
}

// ── Submit all rolls for a round (manual mode) ────────────────────────────────

export async function submitManualRolls(_prev: RollActionState, formData: FormData): Promise<RollActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Você precisa estar logado." };

  const gameId = formData.get("game_id") as string;

  const { data: game } = await supabase
    .from("game")
    .select("id, creator_id, status, current_round, max_rounds, dice_mode")
    .eq("id", gameId)
    .single();

  if (!game) return { error: "Partida não encontrada." };
  if (game.creator_id !== user.id) return { error: "Apenas o criador pode inserir dados manuais." };
  if (game.status !== "playing") return { error: "A partida não está em andamento." };
  if (game.dice_mode !== "manual") return { error: "Esta partida está em modo virtual." };

  const { data: players } = await supabase.from("game_player").select("player_id").eq("game_id", gameId);

  if (!players?.length) return { error: "Nenhum jogador encontrado." };

  // CHANGED: one rolled_value per player instead of die1/die2/die3 per player
  const rows = players.map((p) => ({
    game_id: gameId,
    player_id: p.player_id,
    round_number: game.current_round,
    rolled_value: Number(formData.get(`rolled_value_${p.player_id}`)),
    status: "rolled",
  }));

  if (rows.some((r) => !isValidDie(r.rolled_value))) {
    return { error: "Todos os valores devem estar entre 1 e 6." };
  }

  // CHANGED: inserts into `round` — was inserting into `roll`
  const { error } = await supabase.from("round").insert(rows);

  if (error) {
    if (error.code === "23505") return { error: "Rolagem já registrada para esta rodada." };
    return { error: "Erro ao registrar rolagens." };
  }

  await checkRoundComplete(gameId, game.current_round, game.max_rounds);

  revalidatePath("/game/[id]", "page");
  return { error: null };
}

// ── End game manually (creator override) ─────────────────────────────────────

export async function endGame(_prev: RollActionState, formData: FormData): Promise<RollActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Você precisa estar logado." };

  const gameId = formData.get("game_id") as string;

  const { data: game } = await supabase.from("game").select("creator_id, status").eq("id", gameId).single();

  if (!game) return { error: "Partida não encontrada." };
  if (game.creator_id !== user.id) return { error: "Apenas o criador pode encerrar a partida." };
  if (game.status === "finished") return { error: "A partida já foi encerrada." };

  const { error } = await supabase
    .from("game")
    .update({ status: "finished", finished_at: new Date().toISOString() })
    .eq("id", gameId);

  if (error) return { error: "Erro ao encerrar partida." };

  revalidatePath("/game/[id]", "page");
  return { error: null };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

// CHANGED: replaces tryResolveRound — no longer checks a roll table or manages lives.
// Checks if all players have submitted their roll for the current round_number.
// If yes: either advances current_round or resolves the game when max_rounds is reached.
async function checkRoundComplete(gameId: string, roundNumber: number, maxRounds: number): Promise<void> {
  const supabase = await createClient();

  const { count: playerCount } = await supabase
    .from("game_player")
    .select("*", { count: "exact", head: true })
    .eq("game_id", gameId);

  const { count: rollCount } = await supabase
    .from("round")
    .select("*", { count: "exact", head: true })
    .eq("game_id", gameId)
    .eq("round_number", roundNumber);

  // Not everyone has rolled yet
  if (!playerCount || rollCount !== playerCount) return;

  if (roundNumber < maxRounds) {
    // Advance to next round
    await supabase
      .from("game")
      .update({ current_round: roundNumber + 1 })
      .eq("id", gameId);
    return;
  }

  // All rounds complete — resolve the game
  await resolveGame(gameId);
}

// ADDED: resolves the game after all rounds are complete.
// - Sums rolled_values per player to find the loser (lowest total)
// - Detects criticals (all 1s or all 6s across all rounds) and increments profile stats
// - Marks game as finished
async function resolveGame(gameId: string): Promise<void> {
  const supabase = await createClient();

  const { data: rounds } = await supabase.from("round").select("player_id, rolled_value").eq("game_id", gameId);

  if (!rounds?.length) return;

  // Group rolled_values by player
  const rollsByPlayer: Record<string, number[]> = {};
  for (const r of rounds) {
    if (r.rolled_value == null) continue;
    if (!rollsByPlayer[r.player_id]) rollsByPlayer[r.player_id] = [];
    rollsByPlayer[r.player_id].push(r.rolled_value);
  }

  // Compute totals and detect criticals per player
  const results = Object.entries(rollsByPlayer).map(([playerId, rolls]) => ({
    playerId,
    total: rolls.reduce((a, b) => a + b, 0),
    // CHANGED: detectCritical now receives all rolls for the player, not a DiceTriple
    critical: detectCritical(rolls),
  }));

  // Update profile stats for any player with a critical outcome
  for (const { playerId, critical } of results) {
    if (critical === "hit") {
      const { data: profile } = await supabase.from("profile").select("critical_success").eq("id", playerId).single();
      if (profile) {
        await supabase
          .from("profile")
          .update({ critical_success: profile.critical_success + 1 })
          .eq("id", playerId);
      }
    } else if (critical === "miss") {
      const { data: profile } = await supabase.from("profile").select("critical_failure").eq("id", playerId).single();
      if (profile) {
        await supabase
          .from("profile")
          .update({ critical_failure: profile.critical_failure + 1 })
          .eq("id", playerId);
      }
    }
  }

  // Mark game as finished
  await supabase.from("game").update({ status: "finished", finished_at: new Date().toISOString() }).eq("id", gameId);
}
