-- Perfis geridos pelo itspx: sem login próprio, usados nos jogos até serem
-- vinculados a uma conta real.

ALTER TABLE profile
  ADD COLUMN is_managed boolean NOT NULL DEFAULT false,
  ADD COLUMN managed_by uuid REFERENCES profile(id) ON DELETE SET NULL;

ALTER TABLE profile DROP CONSTRAINT IF EXISTS profile_username_key;

CREATE UNIQUE INDEX profile_username_real_unique
  ON profile (username)
  WHERE NOT is_managed;

CREATE UNIQUE INDEX profile_username_managed_unique
  ON profile (username)
  WHERE is_managed;

CREATE INDEX profile_managed_by_idx
  ON profile (managed_by)
  WHERE is_managed;

-- Contas reais não podem se auto-promover a geridas nem apontar outro gerente.
DROP POLICY IF EXISTS "User can insert own profile" ON profile;
CREATE POLICY "User can insert own profile"
  ON profile FOR INSERT
  WITH CHECK (auth.uid() = id AND NOT is_managed AND managed_by IS NULL);

DROP POLICY IF EXISTS "User can update own profile" ON profile;
CREATE POLICY "User can update own profile"
  ON profile FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND NOT is_managed AND managed_by IS NULL);
