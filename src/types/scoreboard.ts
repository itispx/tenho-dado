import type { DieType } from "./dice";

export interface ScoreboardInput {
  finishedAt: string;
  die: DieType;
  players: { profileId: string; rolls: [number, number, number] }[];
  loserProfileId: string;
  loserSpent: number;
}

export interface AnalyticsEntry {
  id: string;
  finished_at: string;
  loser_profile_id: string | null;
  loser_spent: number | null;
}
