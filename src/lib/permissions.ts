import { SCOREBOARD_ADMIN_USERNAME } from "@/lib/constants";
import { adminClient } from "@/lib/supabase/admin";

export interface ProfileSummary {
  id: string;
  username: string;
  is_managed: boolean;
}

export async function getProfileSummary(userId: string): Promise<ProfileSummary | null> {
  const { data, error } = await adminClient
    .from("profile")
    .select("id, username, is_managed")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[getProfileSummary] error", error);
    return null;
  }

  return data;
}

export async function isScoreboardAdmin(userId: string): Promise<boolean> {
  const profile = await getProfileSummary(userId);

  return profile?.username === SCOREBOARD_ADMIN_USERNAME;
}
