"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Button from "@/components/ui/button/button";
import Card from "@/components/ui/card/card";
import { formatBRL } from "@/lib/format";
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

  const totalSpent = sessions.reduce((sum, session) => sum + (session.loser_spent ?? 0), 0);
  const hasSpent = sessions.some((session) => session.loser_spent !== null);

  function handleSaved() {
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-ink-400">
          <span className="font-semibold tabular-nums text-ink-200">{sessions.length}</span>{" "}
          {sessions.length === 1 ? "partida" : "partidas"}
          {hasSpent && (
            <>
              <span aria-hidden="true"> · </span>
              <span className="font-semibold tabular-nums text-ink-200">{formatBRL(totalSpent)}</span> no total
            </>
          )}
        </p>

        {canManage && (
          <div className="ml-auto flex items-center gap-2">
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
          <p className="text-[15px] font-semibold text-ink-50">Nenhuma partida registrada ainda.</p>
          <p className="mt-1 text-[13px] text-ink-400">
            {canManage
              ? "Adicione uma partida retroativa para começar o histórico."
              : "Quando uma partida terminar, ela aparece aqui."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:items-start">
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
