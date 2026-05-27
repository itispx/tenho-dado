"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Game, GamePlayer, Roll, Round } from "@/types/game";

export interface GameState {
  game: Game;
  players: GamePlayer[];
  round: Round | null;
  rolls: Roll[];
}

export interface UseGameOptions {
  initialGame: Game;
  initialPlayers: GamePlayer[];
  initialRound: Round | null;
  initialRolls: Roll[];
}

export interface UseGameReturn extends GameState {
  isConnected: boolean;
}

function useGame({ initialGame, initialPlayers, initialRound, initialRolls }: UseGameOptions): UseGameReturn {
  const [game, setGame] = useState<Game>(initialGame);
  const [players, setPlayers] = useState<GamePlayer[]>(initialPlayers);
  const [round, setRound] = useState<Round | null>(initialRound);
  const [rolls, setRolls] = useState<Roll[]>(initialRolls);
  const [isConnected, setConnected] = useState(false);

  const roundRef = useRef(round);
  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`game:${initialGame.id}`)

      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "roll",
        },
        (payload) => {
          const newRoll = payload.new as Roll;
          setRolls((prev) => {
            if (prev.some((r) => r.id === newRoll.id)) return prev;
            if (roundRef.current && newRoll.round_id !== roundRef.current.id) return prev;
            return [...prev, newRoll];
          });
        },
      )

      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "round",
          filter: `game_id=eq.${initialGame.id}`,
        },
        (payload) => {
          setRound((prev) => {
            if (!prev) return payload.new as Round;
            return { ...prev, ...(payload.new as Round) };
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "round",
          filter: `game_id=eq.${initialGame.id}`,
        },
        (payload) => {
          setRound(payload.new as Round);
          setRolls([]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game_player",
          filter: `game_id=eq.${initialGame.id}`,
        },
        (payload) => {
          const updated = payload.new as GamePlayer;
          setPlayers((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "game",
          filter: `id=eq.${initialGame.id}`,
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
  }, [initialGame.id]);

  return { game, players, round, rolls, isConnected };
}

export default useGame;
