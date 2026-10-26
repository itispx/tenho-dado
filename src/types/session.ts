import type { Tables } from "./database";
import type { DieType } from "./dice";

export type SessionMode = "manual" | "online";

export type SessionStatus = "lobby" | "playing" | "finished";

export type SessionSource = "live" | "retroactive";

export type GameSessionRow = Tables<"game_session">;
export type SessionPlayerRow = Tables<"session_player">;
export type SessionRollRow = Tables<"session_roll">;

export interface ProfileOption {
  id: string;
  username: string;
  isManaged: boolean;
}

export interface SessionPlayerView {
  id: string;
  session_id: string;
  profile_id: string;
  username: string;
  turn_order: number | null;
  joined_at: string;
  is_host: boolean;
  is_managed: boolean;
  /** Quem adicionou o jogador manualmente. NULL = entrou pelo convite. */
  added_by: string | null;
  added_by_username: string | null;
}

export interface SessionRollView {
  id: string;
  session_player_id: string;
  value: number;
  round: number;
  is_tiebreak: boolean;
}

export interface SessionView {
  id: string;
  host_id: string;
  host_username: string;
  mode: SessionMode;
  die: DieType;
  status: SessionStatus;
  source: SessionSource;
  invite_version: number;
  loser_profile_id: string | null;
  loser_spent: number | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  players: SessionPlayerView[];
  rolls: SessionRollView[];
}

export interface SessionData {
  active: SessionView | null;
  pendingDebt: SessionView | null;
}
