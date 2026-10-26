-- O dado passa a ser escolhido por sessão: três jogadas de d6 (padrão) ou d20.

ALTER TABLE game_session
  ADD COLUMN die text NOT NULL DEFAULT 'd6' CHECK (die IN ('d6', 'd20'));

ALTER TABLE session_roll DROP CONSTRAINT IF EXISTS session_roll_value_check;

ALTER TABLE session_roll
  ADD CONSTRAINT session_roll_value_check CHECK (value BETWEEN 1 AND 20);
