-- ============================================================
-- MVP Agro — Migration Script
-- Execute no Supabase SQL Editor (ou psql)
-- ============================================================

-- 1. Campo "tipo" em activities (Plantio, Irrigação, Adubação, etc.)
ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'Outro';

-- Atividades existentes sem tipo recebem 'Outro'
UPDATE activities SET tipo = 'Outro' WHERE tipo IS NULL;

-- 2. Campo "area" em cultures (área plantada em hectares)
ALTER TABLE cultures
  ADD COLUMN IF NOT EXISTS area NUMERIC(10,2);

-- 3. Campo "culture_id" em files (vínculo do arquivo com uma cultura)
ALTER TABLE files
  ADD COLUMN IF NOT EXISTS culture_id UUID REFERENCES cultures(id) ON DELETE SET NULL;

-- 4. Campo "position" em user_profiles (cargo/função do usuário)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS position TEXT;

-- ============================================================
-- Índices opcionais para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_activities_tipo       ON activities(tipo);
CREATE INDEX IF NOT EXISTS idx_files_culture_id      ON files(culture_id);
CREATE INDEX IF NOT EXISTS idx_files_activity_id     ON files(activity_id);
