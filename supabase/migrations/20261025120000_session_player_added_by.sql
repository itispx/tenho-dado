-- Quem adiciona um jogador manualmente à sessão passa a responder pelo gasto dele.
-- NULL = o jogador entrou sozinho pelo convite (ou é o criador da sessão).
ALTER TABLE session_player
  ADD COLUMN added_by uuid REFERENCES profile(id) ON DELETE SET NULL;

CREATE INDEX session_player_added_by_idx
  ON session_player (added_by)
  WHERE added_by IS NOT NULL;
