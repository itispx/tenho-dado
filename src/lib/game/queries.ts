import { createClient } from "@/lib/supabase/server";
import type { Game, GamePlayer, Round } from "@/types/game";

// REMOVED: Roll type import — roll table no longer exists
// CHANGED: rolls field replaced with rounds — round rows are the rolls now

export interface GamePageData {
  game: Game;
  players: GamePlayer[];
  usernames: Record<string, string>;
  // CHANGED: was `round: Round | null, rolls: Roll[]`
  // Now returns all rounds for the game — each row is one player's die result for one round_number
  rounds: Round[];
  error: string | null;
}

export async function getGamePageData(gameId: string): Promise<GamePageData> {
  const supabase = await createClient();

  const { data: game, error: gameError } = await supabase.from("game").select("*").eq("id", gameId).single();

  if (gameError || !game) {
    return {
      game: null as never,
      players: [],
      usernames: {},
      rounds: [], // CHANGED: was `round: null, rolls: []`
      error: "Partida não encontrada.",
    };
  }

  const { data: playerRows } = await supabase
    .from("game_player")
    .select("*, profile(username)")
    .eq("game_id", gameId)
    .order("joined_at", { ascending: true });

  const players: GamePlayer[] = (playerRows ?? []).map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { profile, ...rest } = row;
    return rest as GamePlayer;
  });

  const usernames: Record<string, string> = Object.fromEntries(
    (playerRows ?? []).map((row) => [row.player_id, (row.profile as { username: string } | null)?.username ?? "?"]),
  );

  // CHANGED: was two queries — one for the latest round, one for rolls from a roll table.
  // Now a single query for all rounds in the game ordered by round_number.
  // Each row is one player's die result (rolled_value) for a given round_number.
  const { data: rounds } = await supabase
    .from("round")
    .select("*")
    .eq("game_id", gameId)
    .order("round_number", { ascending: true });

  return { game, players, usernames, rounds: rounds ?? [], error: null };
}
