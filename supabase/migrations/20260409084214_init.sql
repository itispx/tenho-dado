CREATE TABLE profile (
  id               uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username         text        UNIQUE NOT NULL,
  critical_success int         NOT NULL DEFAULT 0,
  critical_failure int         NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profile FOR SELECT
  USING (true);

CREATE POLICY "User can insert own profile"
  ON profile FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "User can update own profile"
  ON profile FOR UPDATE
  USING      (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE game (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code          text        UNIQUE NOT NULL,
  creator_id    uuid        NOT NULL REFERENCES profile(id),
  status        text        NOT NULL DEFAULT 'lobby'
                            CHECK (status IN ('lobby', 'playing', 'finished')),
  dice_mode     text        NOT NULL DEFAULT 'manual'
                            CHECK (dice_mode IN ('virtual', 'manual')),
  punishment    text,
  -- ADDED: max_rounds — how many rounds per game, defaults to 3, must be >= 1
  max_rounds    int         NOT NULL DEFAULT 3 CHECK (max_rounds >= 1),
  current_round int         NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  started_at    timestamptz,
  finished_at   timestamptz
);

ALTER TABLE game ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lobby games"
  ON game FOR SELECT
  USING (status = 'lobby');

CREATE POLICY "Auth users can create games"
  ON game FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creator can update game"
  ON game FOR UPDATE
  USING      (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE TABLE game_player (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id   uuid        NOT NULL REFERENCES game(id) ON DELETE CASCADE,
  player_id uuid        NOT NULL REFERENCES profile(id),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (game_id, player_id)
);

ALTER TABLE game_player ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view their games"
  ON game FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_player
      WHERE game_player.game_id   = game.id
        AND game_player.player_id = auth.uid()
    )
  );

CREATE POLICY "Players can view members of their games"
  ON game_player FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game
      WHERE game.id = game_player.game_id
    )
  );

CREATE POLICY "Player can join lobby game"
  ON game_player FOR INSERT
  WITH CHECK (
    player_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM game
      WHERE game.id     = game_player.game_id
        AND game.status = 'lobby'
    )
  );

CREATE POLICY "Player can leave lobby game"
  ON game_player FOR DELETE
  USING (
    player_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM game
      WHERE game.id     = game_player.game_id
        AND game.status = 'lobby'
    )
  );

CREATE POLICY "Creator can insert players"
  ON game_player FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game
      WHERE game.id         = game_player.game_id
        AND game.creator_id = auth.uid()
        AND game.status     = 'lobby'
    )
  );

CREATE POLICY "Creator can update player stats"
  ON game_player FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM game
      WHERE game.id         = game_player.game_id
        AND game.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game
      WHERE game.id         = game_player.game_id
        AND game.creator_id = auth.uid()
    )
  );

CREATE TABLE round (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id      uuid        NOT NULL REFERENCES public.game(id) ON DELETE CASCADE,
  player_id    uuid        NOT NULL REFERENCES public.profile(id),
  round_number int         NOT NULL,
  rolled_value int,
  status       text        NOT NULL DEFAULT 'rolling'
               CHECK (status IN ('rolling', 'rolled')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  -- CHANGED: added player_id to unique constraint — one roll per player per round
  -- was: UNIQUE (game_id, round_number)
  UNIQUE (game_id, round_number, player_id)
);

ALTER TABLE round ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view rounds of their games"
  ON round FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_player
      WHERE game_player.game_id   = round.game_id
        AND game_player.player_id = auth.uid()
    )
  );

CREATE POLICY "Player can insert own roll"
  ON round FOR INSERT
  WITH CHECK (
    player_id  = auth.uid()
    AND status = 'rolling'
    AND EXISTS (
      SELECT 1 FROM game_player
      WHERE game_player.game_id   = game_id
        AND game_player.player_id = auth.uid()
    )
  );

CREATE POLICY "Creator can insert rolls in manual mode"
  ON round FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game
      WHERE game.id         = game_id
        AND game.creator_id = auth.uid()
        AND game.dice_mode  = 'manual'
    )
  );

-- ── Functions ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_lobby_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars      text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  lobby_code text := '';
  i          int;
  taken      boolean;
BEGIN
  LOOP
    lobby_code := '';
    FOR i IN 1..6 LOOP
      lobby_code := lobby_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    SELECT count(*) > 0 INTO taken
      FROM public.game
     WHERE game.code = lobby_code;
    EXIT WHEN NOT taken;
  END LOOP;
  RETURN lobby_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.on_game_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.game_player (game_id, player_id)
  VALUES (new.id, new.creator_id)
  ON CONFLICT DO NOTHING;
  RETURN new;
END;
$$;

CREATE TRIGGER trg_auto_join_creator
  AFTER INSERT ON public.game
  FOR EACH ROW EXECUTE FUNCTION public.on_game_created();

-- ── Realtime ──────────────────────────────────────────────────────────────────

ALTER TABLE public.game         REPLICA IDENTITY FULL;
ALTER TABLE public.game_player  REPLICA IDENTITY FULL;
ALTER TABLE public.round        REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.game_player;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game;
ALTER PUBLICATION supabase_realtime ADD TABLE public.round;
-- create or replace function public.generate_lobby_code()
-- returns text
-- language plpgsql
-- as $$
-- declare
--   chars      text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
--   lobby_code text := '';
--   i          int;
--   taken      boolean;
-- begin
--   loop
--     lobby_code := '';
--     for i in 1..6 loop
--       lobby_code := lobby_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
--     end loop;
--     select count(*) > 0 into taken
--       from public.game
--      where game.code = lobby_code;
--     exit when not taken;
--   end loop;
--   return lobby_code;
-- end;
-- $$;
