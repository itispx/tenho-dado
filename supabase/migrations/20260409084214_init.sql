CREATE TABLE profile (
  id         uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   text        UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON profile TO authenticated, service_role;

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON profile FOR SELECT
  USING (true);

CREATE POLICY "User can insert own profile"
  ON profile FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "User can update own profile"
  ON profile FOR UPDATE
  USING  (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TABLE game_group (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  code        text        UNIQUE NOT NULL,
  punishment  text,
  created_by  uuid        NOT NULL REFERENCES profile(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON game_group TO authenticated, service_role;

ALTER TABLE game_group ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create groups"
  ON game_group FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creator can view their groups"
  ON game_group FOR SELECT
  USING (auth.uid() = created_by);

CREATE TABLE group_member (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id         uuid        NOT NULL REFERENCES game_group(id) ON DELETE CASCADE,
  profile_id       uuid        NOT NULL REFERENCES profile(id),
  is_master        boolean     NOT NULL DEFAULT false,
  critical_success int         NOT NULL DEFAULT 0,
  critical_failure int         NOT NULL DEFAULT 0,
  joined_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, profile_id)
);

GRANT ALL ON group_member TO authenticated, service_role;

ALTER TABLE group_member ENABLE ROW LEVEL SECURITY;

ALTER TABLE group_member REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE group_member;

CREATE POLICY "Authenticated users can view group members"
  ON group_member FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can join groups"
  ON group_member FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Master can add members to their groups"
  ON group_member FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_member gm
      WHERE gm.group_id   = group_member.group_id
        AND gm.profile_id = auth.uid()
        AND gm.is_master
    )
  );

CREATE POLICY "Creator can delete their group"
  ON game_group FOR DELETE
  USING (auth.uid() = created_by);

CREATE POLICY "Master can update group"
  ON game_group FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_member
      WHERE group_member.group_id   = game_group.id
        AND group_member.profile_id = auth.uid()
        AND group_member.is_master
    )
  );

CREATE POLICY "Master can remove members"
  ON group_member FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM group_member gm
      WHERE gm.group_id   = group_member.group_id
        AND gm.profile_id = auth.uid()
        AND gm.is_master
    )
  );
