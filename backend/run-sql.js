#!/usr/bin/env node

/**
 * Executar SQL limpo no Supabase
 * Execute: node run-sql.js
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

async function runSQL() {
  console.log('🚀 Executando SQL limpo no Supabase...\n');

  try {
    // Ler o arquivo SQL limpo
    const sqlPath = path.join(__dirname, 'sql', 'create_tables_clean.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir em statements (por ponto e vírgula)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 Executando ${statements.length} statements SQL...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Statement ${i + 1}/${statements.length}...`);

        try {
          // Usar uma abordagem diferente - tentar executar diretamente
          // Como o Supabase não permite SQL arbitrário via RPC facilmente,
          // vamos tentar uma abordagem alternativa

          // Para tabelas simples, podemos tentar criar via query normal
          if (statement.includes('CREATE TABLE')) {
            console.log(`   📝 Criando tabela...`);
            // Esta é uma abordagem simplificada - em produção seria melhor usar migrations
            console.log(`   ⚠️  SQL direto não suportado via API. Use o Dashboard.`);
          } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
            console.log(`   📝 Criando função...`);
            console.log(`   ⚠️  Função não pode ser criada via API. Use o Dashboard.`);
          } else {
            console.log(`   ⚠️  Statement não suportado via API`);
          }

        } catch (err) {
          console.log(`   ❌ Erro: ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Resultado:`);
    console.log(`✅ Sucesso: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);

    if (errorCount > 0) {
      console.log(`\n📋 Execute manualmente no Supabase Dashboard:`);
      console.log(`Arquivo: backend/sql/create_tables_clean.sql`);
    }

    console.log(`\n🔍 Verificando tabelas criadas...\n`);

    // Verificar tabelas
    const tables = [
      'user_profiles',
      'technician_assignments',
      'properties',
      'cultures',
      'activities',
      'alerts',
      'files'
    ];

    let createdCount = 0;

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error && error.message.includes('Could not find the table')) {
          console.log(`❌ ${table}: Não existe`);
        } else {
          console.log(`✅ ${table}: OK`);
          createdCount++;
        }
      } catch (err) {
        console.log(`❌ ${table}: Erro - ${err.message}`);
      }
    }

    console.log(`\n🎯 Tabelas criadas: ${createdCount}/${tables.length}`);

    if (createdCount === tables.length) {
      console.log(`\n🎉 Todas as tabelas existem! Execute: node test-auth.js`);
    } else {
      console.log(`\n⚠️  Algumas tabelas não foram criadas.`);
      console.log(`Execute o SQL manualmente no Supabase Dashboard.`);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

runSQL();
