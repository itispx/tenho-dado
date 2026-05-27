import type { Tables } from "./database";

export type Profile = Tables<"profile">;
export type Game = Tables<"game">;
export type GamePlayer = Tables<"game_player">;
export type Round = Tables<"round">;
export type Roll = Tables<"roll">;

export interface LobbyMember {
  id: GamePlayer["id"];
  gameId: GamePlayer["game_id"];
  playerId: GamePlayer["player_id"];
  lives: GamePlayer["lives"];
  extraDays: GamePlayer["extra_days"];
  joinedAt: GamePlayer["joined_at"];
  username: Profile["username"];
}

export interface PlayerRoll {
  playerId: Roll["player_id"];
  username: string;
  die1: Roll["die1"];
  die2: Roll["die2"];
  die3: Roll["die3"];
  total: Roll["total"];
  critical: Roll["critical"];
  submittedAt: Roll["submitted_at"];
}

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
export type DiceTriple = [DiceValue, DiceValue, DiceValue];
export type CriticalHit = "hit" | "miss" | null;

export type DiceMode = Game["dice_mode"];
export type GameStatus = Game["status"];
export type RoundStatus = Round["status"];

export interface LobbyState {
  game: Game;
  members: LobbyMember[];
  isCreator: boolean;
}
