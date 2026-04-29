#!/usr/bin/env node

/**
 * Script para criar tabelas no Supabase
 * Execute: node create-tables.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'sql', 'create_tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir o SQL em statements individuais (por ponto e vírgula)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 Executando ${statements.length} statements SQL...`);

    // Executar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executando statement ${i + 1}/${statements.length}...`);

        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.warn(`⚠️  Aviso no statement ${i + 1}: ${error.message}`);
            // Continua mesmo com avisos (como "table already exists")
          }
        } catch (err) {
          console.warn(`⚠️  Erro no statement ${i + 1}: ${err.message}`);
          // Continua mesmo com erros (como "table already exists")
        }
      }
    }

    console.log('✅ Tabelas criadas/verficadas com sucesso!');

    // Verificar se as tabelas existem
    console.log('🔍 Verificando tabelas criadas...');

    const tables = [
      'user_profiles',
      'technician_assignments',
      'properties',
      'cultures',
      'activities',
      'alerts',
      'files'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: ${err.message}`);
      }
    }

    console.log('\n🎉 Setup completo! Agora você pode testar o cadastro.');
    console.log('Execute: node test-auth.js');

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    process.exit(1);
  }
}

createTables();
