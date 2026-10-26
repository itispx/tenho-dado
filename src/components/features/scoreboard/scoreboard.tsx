"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/button/button";
import Card from "@/components/ui/card/card";
import type { ProfileOption, SessionView } from "@/types/session";

import ScoreboardEntryForm from "./scoreboard-entry-form";
import ScoreboardGameCard from "./scoreboard-game-card";

export interface ScoreboardProps {
  sessions: SessionView[];
  profiles: ProfileOption[];
  canManage: boolean;
}

function Scoreboard({ sessions, profiles, canManage }: ScoreboardProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<SessionView | "new" | null>(null);

  function handleSaved() {
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs tabular-nums text-ink-400">
          {sessions.length} {sessions.length === 1 ? "partida" : "partidas"}
        </p>

        {canManage && (
          <div className="flex items-center gap-2">
            <Link
              href="/game/jogadores"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-ink-700 px-3 text-sm font-semibold text-ink-200 transition-colors duration-150 hover:border-ink-600 hover:text-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-victory focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              Jogadores
            </Link>

            <Button type="button" size="sm" fullWidth={false} onClick={() => setEditing("new")}>
              Adicionar partida
            </Button>
          </div>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card as="section" className="text-center">
          <p className="text-sm text-ink-200">Nenhuma partida registrada ainda.</p>
          <p className="mt-1 text-xs text-ink-400">
            {canManage
              ? "Adicione uma partida retroativa para começar o histórico."
              : "Quando uma partida terminar, ela aparece aqui."}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <ScoreboardGameCard
              key={session.id}
              session={session}
              canManage={canManage}
              onEdit={() => setEditing(session)}
              onDeleted={() => router.refresh()}
            />
          ))}
        </div>
      )}

      {editing && (
        <ScoreboardEntryForm
          key={editing === "new" ? "new" : editing.id}
          session={editing === "new" ? null : editing}
          profiles={profiles}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default Scoreboard;
