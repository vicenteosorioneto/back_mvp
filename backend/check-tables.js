#!/usr/bin/env node

/**
 * Verificar tabelas do Supabase
 * Execute: node check-tables.js
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

async function checkTables() {
  console.log('🔍 Verificando tabelas no Supabase...\n');

  const tables = [
    'user_profiles',
    'technician_assignments',
    'properties',
    'cultures',
    'activities',
    'alerts',
    'files'
  ];

  let allExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error && error.message.includes('Could not find the table')) {
        console.log(`❌ ${table}: NÃO EXISTE`);
        allExist = false;
      } else {
        console.log(`✅ ${table}: OK`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ERRO - ${err.message}`);
      allExist = false;
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allExist) {
    console.log('🎉 Todas as tabelas existem! Pronto para testar.');
    console.log('Execute: node test-auth.js');
  } else {
    console.log('⚠️  Algumas tabelas não existem.');
    console.log('\n📋 PARA CRIAR AS TABELAS:');
    console.log('1. Acesse: https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para: SQL Editor');
    console.log('4. Cole e execute o conteúdo do arquivo:');
    console.log('   backend/sql/create_tables.sql');
    console.log('\nDepois execute: node test-auth.js');
  }

  console.log('='.repeat(50));
}

checkTables().catch(console.error);
