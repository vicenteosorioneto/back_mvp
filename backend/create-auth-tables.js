#!/usr/bin/env node

/**
 * Criar tabelas de auth no Supabase
 * Execute: node create-auth-tables.js
 */

const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAuthTables() {
  console.log('🚀 Criando tabelas de autenticação no Supabase...\n');

  try {
    // SQL para criar as tabelas necessárias para auth
    const sqlStatements = [
      // 1. Função update_updated_at
      `CREATE OR REPLACE FUNCTION update_updated_at()
       RETURNS TRIGGER AS $$
       BEGIN
         NEW.updated_at = NOW();
         RETURN NEW;
       END;
       $$ LANGUAGE plpgsql;`,

      // 2. Tabela user_profiles
      `CREATE TABLE IF NOT EXISTS user_profiles (
         id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
         name        TEXT,
         email       TEXT,
         role        TEXT NOT NULL DEFAULT 'produtor'
                       CHECK (role IN ('admin', 'produtor', 'tecnico')),
         created_at  TIMESTAMPTZ DEFAULT NOW(),
         updated_at  TIMESTAMPTZ DEFAULT NOW()
       );`,

      // 3. Trigger para user_profiles
      `CREATE OR REPLACE TRIGGER user_profiles_updated_at
         BEFORE UPDATE ON user_profiles
         FOR EACH ROW EXECUTE FUNCTION update_updated_at();`,

      // 4. Tabela technician_assignments
      `CREATE TABLE IF NOT EXISTS technician_assignments (
         id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         technician_id   UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
         producer_id     UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
         created_at      TIMESTAMPTZ DEFAULT NOW(),
         UNIQUE (technician_id, producer_id)
       );`,

      // 5. Tabela properties
      `CREATE TABLE IF NOT EXISTS properties (
         id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         owner_id        UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
         name            TEXT NOT NULL,
         city            TEXT,
         state           TEXT,
         hectares        NUMERIC DEFAULT 0,
         production_type TEXT,
         created_at      TIMESTAMPTZ DEFAULT NOW(),
         updated_at      TIMESTAMPTZ DEFAULT NOW()
       );`,

      // 6. Trigger para properties
      `CREATE OR REPLACE TRIGGER properties_updated_at
         BEFORE UPDATE ON properties
         FOR EACH ROW EXECUTE FUNCTION update_updated_at();`,

      // 7. Tabela alerts
      `CREATE TABLE IF NOT EXISTS alerts (
         id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
         owner_id       UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
         type           TEXT NOT NULL,
         message        TEXT NOT NULL,
         severity       TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
         reference_id   UUID,
         reference_type TEXT,
         read           BOOLEAN DEFAULT FALSE,
         created_at     TIMESTAMPTZ DEFAULT NOW()
       );`,

      // 8. Index para alerts
      `CREATE INDEX IF NOT EXISTS alerts_owner_unread ON alerts (owner_id, read) WHERE read = FALSE;`,

      // 9. Tabela files
      `CREATE TABLE IF NOT EXISTS files (
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
       );`
    ];

    console.log(`📄 Executando ${sqlStatements.length} statements SQL...\n`);

    // Tentar executar via RPC (pode não funcionar)
    for (let i = 0; i < sqlStatements.length; i++) {
      console.log(`⚡ Statement ${i + 1}/${sqlStatements.length}...`);

      try {
        // Tentar via RPC
        const { error } = await supabase.rpc('exec_sql', { sql: sqlStatements[i] });
        if (error) {
          console.log(`   ⚠️  RPC falhou: ${error.message}`);
        } else {
          console.log(`   ✅ RPC OK`);
        }
      } catch (err) {
        console.log(`   ⚠️  RPC erro: ${err.message}`);
      }
    }

    console.log('\n🔍 Verificando se as tabelas foram criadas...\n');

    // Verificar tabelas
    const tables = ['user_profiles', 'technician_assignments', 'properties', 'alerts', 'files'];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error && error.message.includes('Could not find the table')) {
          console.log(`❌ ${table}: Ainda não existe`);
        } else {
          console.log(`✅ ${table}: Criada com sucesso!`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Erro ao verificar - ${err.message}`);
      }
    }

    console.log('\n📋 Se as tabelas não foram criadas automaticamente:');
    console.log('1. Copie o conteúdo do arquivo: backend/sql/create_tables.sql');
    console.log('2. Cole no SQL Editor do Supabase Dashboard');
    console.log('3. Execute o SQL');
    console.log('4. Execute: node test-auth.js');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

createAuthTables();
