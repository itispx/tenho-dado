// src/hooks/use-lobby.ts
"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Game, LobbyMember } from "@/types/game";

export interface UseLobbyOptions {
  gameId: string;
  initialMembers: LobbyMember[];
  initialGame: Game;
}

export interface UseLobbyReturn {
  members: LobbyMember[];
  game: Game;
  isConnected: boolean;
}

function useLobby({ gameId, initialMembers, initialGame }: UseLobbyOptions): UseLobbyReturn {
  const [members, setMembers] = useState<LobbyMember[]>(initialMembers);
  const [game, setGame] = useState<Game>(initialGame);
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`lobby:${gameId}`)

      // ── New player joined ─────────────────────────────────────────────────
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_player",
          filter: `game_id=eq.${gameId}`,
        },
        async (payload) => {
          const newRow = payload.new as {
            id: string;
            game_id: string;
            player_id: string;
            lives: number;
            extra_days: number;
            joined_at: string;
          };

          const { data: profile } = await supabase
            .from("profile")
            .select("username")
            .eq("id", newRow.player_id)
            .single();

          const member: LobbyMember = {
            id: newRow.id,
            gameId: newRow.game_id,
            playerId: newRow.player_id,
            lives: newRow.lives,
            extraDays: newRow.extra_days,
            joinedAt: newRow.joined_at,
            username: profile?.username ?? "?",
          };

          setMembers((prev) => {
            if (prev.some((m) => m.playerId === member.playerId)) return prev;
            return [...prev, member];
          });
        },
      )

      // ── Player left ───────────────────────────────────────────────────────
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "game_player",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const old = payload.old as { id?: string; player_id?: string };
          setMembers((prev) => prev.filter((m) => (old.player_id ? m.playerId !== old.player_id : m.id !== old.id)));
        },
      )

      // ── Game updated (status, creator_id on ownership transfer) ──────────
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setGame((prev) => ({ ...prev, ...(payload.new as Game) }));
        },
      )

      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return { members, game, isConnected };
}

export default useLobby;
