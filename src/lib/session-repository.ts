import { adminClient } from "@/lib/supabase/admin";
import type {
  ProfileOption,
  SessionMode,
  SessionPlayerView,
  SessionRollView,
  SessionSource,
  SessionStatus,
  SessionView,
} from "@/types/session";

export async function loadProfiles(): Promise<ProfileOption[]> {
  const { data, error } = await adminClient
    .from("profile")
    .select("id, username, is_managed")
    .order("username", { ascending: true });

  if (error) {
    console.error("[loadProfiles] error", error);
    return [];
  }

  return (data ?? []).map((profile) => ({
    id: profile.id,
    username: profile.username,
    isManaged: profile.is_managed,
  }));
}

/**
 * Carrega várias sessões em lote: sessões, jogadores, jogadas e perfis.
 * A ordem retornada é a mesma dos IDs recebidos.
 */
export async function loadSessionViews(sessionIds: string[]): Promise<SessionView[]> {
  if (sessionIds.length === 0) return [];

  const { data: sessions, error: sessionsError } = await adminClient
    .from("game_session")
    .select("*")
    .in("id", sessionIds);

  if (sessionsError) {
    console.error("[loadSessionViews] sessions error", sessionsError);
    return [];
  }

  if (!sessions?.length) return [];

  const foundSessionIds = sessions.map((session) => session.id);

  const { data: playerRows, error: playersError } = await adminClient
    .from("session_player")
    .select("*")
    .in("session_id", foundSessionIds)
    .order("joined_at", { ascending: true });

  if (playersError) {
    console.error("[loadSessionViews] players error", playersError);
    return [];
  }

  const players = playerRows ?? [];
  const playerIds = players.map((player) => player.id);

  const { data: rollRows, error: rollsError } = playerIds.length
    ? await adminClient
        .from("session_roll")
        .select("*")
        .in("session_player_id", playerIds)
        .order("created_at", { ascending: true })
    : { data: [] as SessionRollView[], error: null };

  if (rollsError) {
    console.error("[loadSessionViews] rolls error", rollsError);
    return [];
  }

  const profileIds = [
    ...new Set([
      ...sessions.map((session) => session.host_id),
      ...players.map((player) => player.profile_id),
      ...players.map((player) => player.added_by).filter((id): id is string => Boolean(id)),
    ]),
  ];

  const { data: profiles, error: profilesError } = await adminClient
    .from("profile")
    .select("id, username, is_managed")
    .in("id", profileIds);

  if (profilesError) {
    console.error("[loadSessionViews] profiles error", profilesError);
    return [];
  }

  const usernames = new Map((profiles ?? []).map((profile) => [profile.id, profile.username]));
  const managedProfileIds = new Set(
    (profiles ?? []).filter((profile) => profile.is_managed).map((profile) => profile.id),
  );
  const playersBySession = new Map<string, SessionPlayerView[]>();

  for (const player of players) {
    const list = playersBySession.get(player.session_id) ?? [];

    list.push({
      id: player.id,
      session_id: player.session_id,
      profile_id: player.profile_id,
      username: usernames.get(player.profile_id) ?? "?",
      turn_order: player.turn_order,
      joined_at: player.joined_at,
      is_host: sessions.some((session) => session.id === player.session_id && session.host_id === player.profile_id),
      is_managed: managedProfileIds.has(player.profile_id),
      added_by: player.added_by,
      added_by_username: player.added_by ? (usernames.get(player.added_by) ?? null) : null,
    });

    playersBySession.set(player.session_id, list);
  }

  const rollsByPlayer = new Map<string, SessionRollView[]>();

  for (const roll of rollRows ?? []) {
    const list = rollsByPlayer.get(roll.session_player_id) ?? [];

    list.push({
      id: roll.id,
      session_player_id: roll.session_player_id,
      value: roll.value,
      round: roll.round,
      is_tiebreak: roll.is_tiebreak,
    });

    rollsByPlayer.set(roll.session_player_id, list);
  }

  const viewsById = new Map<string, SessionView>();

  for (const session of sessions) {
    const sessionPlayers = playersBySession.get(session.id) ?? [];
    const sessionRolls = sessionPlayers.flatMap((player) => rollsByPlayer.get(player.id) ?? []);

    viewsById.set(session.id, {
      id: session.id,
      host_id: session.host_id,
      host_username: usernames.get(session.host_id) ?? "?",
      mode: session.mode as SessionMode,
      status: session.status as SessionStatus,
      source: session.source as SessionSource,
      invite_version: session.invite_version,
      loser_profile_id: session.loser_profile_id,
      loser_spent: session.loser_spent === null ? null : Number(session.loser_spent),
      created_at: session.created_at,
      started_at: session.started_at,
      finished_at: session.finished_at,
      players: sessionPlayers,
      rolls: sessionRolls,
    });
  }

  return sessionIds.map((id) => viewsById.get(id)).filter((session): session is SessionView => Boolean(session));
}

export async function loadSessionView(sessionId: string): Promise<SessionView | null> {
  const [session] = await loadSessionViews([sessionId]);

  return session ?? null;
}
