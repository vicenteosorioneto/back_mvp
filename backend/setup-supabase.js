#!/usr/bin/env node

/**
 * Script para criar tabelas no Supabase
 * Execute: node setup-supabase.js
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

async function createTables() {
  console.log('🚀 Criando tabelas no Supabase...');

  try {
    // 1. Criar função update_updated_at
    console.log('📝 Criando função update_updated_at...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `
    }).catch(() => {
      // Ignorar erro se já existe
      console.log('⚠️  Função update_updated_at já existe ou não pôde ser criada via RPC');
    });

    // 2. Criar tabela user_profiles
    console.log('📝 Criando tabela user_profiles...');
    const { error: userProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (userProfilesError && userProfilesError.message.includes('Could not find the table')) {
      // Tabela não existe, tentar criar via SQL direto
      console.log('⚠️  Tabela user_profiles não existe. Execute o SQL manualmente no Supabase Dashboard:');
      console.log('📋 SQL para user_profiles:');
      console.log(`
CREATE TABLE user_profiles (
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
      `);
    } else {
      console.log('✅ Tabela user_profiles já existe');
    }

    // 3. Verificar outras tabelas
    const tables = ['cultures', 'activities'];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && error.message.includes('Could not find the table')) {
        console.log(`❌ Tabela ${table} não existe`);
      } else {
        console.log(`✅ Tabela ${table} existe`);
      }
    }

    console.log('\n📋 Para criar as tabelas faltantes:');
    console.log('1. Acesse https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para SQL Editor');
    console.log('4. Execute o conteúdo do arquivo sql/create_tables.sql');
    console.log('\nOu execute: node create-tables-manual.js');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createTables();
