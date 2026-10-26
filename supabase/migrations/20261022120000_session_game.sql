-- O jogo deixa de ser organizado em grupos e passa a ter uma sessão única por vez.

DROP TABLE IF EXISTS group_member CASCADE;
DROP TABLE IF EXISTS game_group CASCADE;

CREATE TABLE game_session (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id           uuid        NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  mode              text        NOT NULL CHECK (mode IN ('manual', 'online')),
  status            text        NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'playing', 'finished')),
  invite_version    int         NOT NULL DEFAULT 1,
  loser_profile_id  uuid        REFERENCES profile(id) ON DELETE SET NULL,
  loser_spent       numeric(10, 2),
  created_at        timestamptz NOT NULL DEFAULT now(),
  started_at        timestamptz,
  finished_at       timestamptz
);

-- Só pode existir uma sessão aberta ou em andamento no jogo.
CREATE UNIQUE INDEX game_session_one_active
  ON game_session ((true))
  WHERE status IN ('lobby', 'playing');

CREATE INDEX game_session_status_idx ON game_session (status);
CREATE INDEX game_session_loser_idx ON game_session (loser_profile_id);

CREATE TABLE session_player (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid        NOT NULL REFERENCES game_session(id) ON DELETE CASCADE,
  profile_id  uuid        NOT NULL REFERENCES profile(id) ON DELETE CASCADE,
  turn_order  smallint,
  joined_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, profile_id)
);

CREATE INDEX session_player_session_idx ON session_player (session_id);

CREATE TABLE session_roll (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_player_id  uuid        NOT NULL REFERENCES session_player(id) ON DELETE CASCADE,
  value              smallint    NOT NULL CHECK (value BETWEEN 1 AND 6),
  round              smallint    NOT NULL CHECK (round >= 1),
  is_tiebreak        boolean     NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_player_id, is_tiebreak, round)
);

CREATE INDEX session_roll_player_idx ON session_roll (session_player_id);

-- O cliente autenticado apenas lê (necessário para o Realtime).
-- Todas as escritas passam pelas Server Actions usando a service role.
GRANT SELECT ON game_session, session_player, session_roll TO authenticated;
GRANT ALL ON game_session, session_player, session_roll TO service_role;

ALTER TABLE game_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_player ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_roll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sessions"
  ON game_session FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view session players"
  ON session_player FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view session rolls"
  ON session_roll FOR SELECT
  TO authenticated
  USING (true);

ALTER TABLE game_session REPLICA IDENTITY FULL;
ALTER TABLE session_player REPLICA IDENTITY FULL;
ALTER TABLE session_roll REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE game_session;
ALTER PUBLICATION supabase_realtime ADD TABLE session_player;
ALTER PUBLICATION supabase_realtime ADD TABLE session_roll;
