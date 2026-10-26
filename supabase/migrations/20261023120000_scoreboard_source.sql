-- Diferencia partidas jogadas no app das partidas retroativas adicionadas pelo placar.

ALTER TABLE game_session
  ADD COLUMN source text NOT NULL DEFAULT 'live'
  CHECK (source IN ('live', 'retroactive'));

CREATE INDEX game_session_finished_idx
  ON game_session (finished_at DESC)
  WHERE status = 'finished';
