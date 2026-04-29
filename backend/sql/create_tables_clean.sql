-- MVP Agro - Schema completo
-- Execute no Supabase SQL Editor

-- TRIGGER de updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'produtor'
                CHECK (role IN ('admin', 'produtor', 'tecnico')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2. technician_assignments
CREATE TABLE IF NOT EXISTS technician_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id   UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  producer_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (technician_id, producer_id)
);

-- 3. properties
CREATE TABLE IF NOT EXISTS properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  city            TEXT,
  state           TEXT,
  hectares        NUMERIC DEFAULT 0,
  production_type TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. cultures
CREATE TABLE IF NOT EXISTS cultures (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id         UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  property_id      UUID REFERENCES properties(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  planting_date    DATE NOT NULL,
  harvest_date     DATE NOT NULL,
  notes            TEXT,
  expected_revenue NUMERIC DEFAULT 0,
  status           TEXT DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'cancelled')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas se não existirem
ALTER TABLE cultures ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
ALTER TABLE cultures ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;
ALTER TABLE cultures ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

CREATE OR REPLACE TRIGGER cultures_updated_at
  BEFORE UPDATE ON cultures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. activities
CREATE TABLE IF NOT EXISTS activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  culture_id  UUID REFERENCES cultures(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  responsible TEXT,
  cost        NUMERIC DEFAULT 0,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  notes       TEXT,
  photo_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas se não existirem
ALTER TABLE activities ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

CREATE OR REPLACE TRIGGER activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. alerts
CREATE TABLE IF NOT EXISTS alerts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id       UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  type           TEXT NOT NULL,
  message        TEXT NOT NULL,
  severity       TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  reference_id   UUID,
  reference_type TEXT,
  read           BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS alerts_owner_unread ON alerts (owner_id, read) WHERE read = FALSE;

-- 7. files
CREATE TABLE IF NOT EXISTS files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_id   UUID REFERENCES activities(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  original_name TEXT,
  mime_type     TEXT,
  size          INTEGER,
  storage_path  TEXT NOT NULL,
  url           TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
