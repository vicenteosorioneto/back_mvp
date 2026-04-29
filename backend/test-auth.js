#!/usr/bin/env node

/**
 * Test Script - Auth Integration Tests
 * Execute: node backend/test-auth.js
 *
 * Testa os endpoints de auth do MVP Agro
 */

const BASE_URL = 'http://localhost:5000/api';

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, label, message) {
  console.log(`${colors[color]}[${label}]${colors.reset} ${message}`);
}

async function test(name, fn) {
  try {
    log('blue', 'TEST', `Iniciando: ${name}`);
    await fn();
    log('green', 'PASS', `${name}`);
    return true;
  } catch (error) {
    log('red', 'FAIL', `${name}: ${error.message}`);
    return false;
  }
}

async function makeRequest(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  return { status: response.status, data };
}

async function runTests() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  MVP Agro - Auth Integration Tests${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  // ===== TESTE 1: Cadastro válido =====
  if (await test('Cadastro com dados válidos', async () => {
    const payload = {
      name: `Test User ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'produtor',
    };

    const { status, data } = await makeRequest('POST', '/auth/register', payload);

    if (status !== 201) {
      throw new Error(`Status esperado 201, recebido ${status}: ${data.message}`);
    }

    if (!data.success) {
      throw new Error(`Esperado success: true, recebido: ${data.success}`);
    }

    if (!data.data.id) {
      throw new Error('ID do usuário não retornado');
    }

    log('green', 'OK', `Usuário criado: ${data.data.name} (${data.data.email})`);
  })) {
    passed++;
  } else {
    failed++;
  }

  // ===== TESTE 2: Cadastro sem nome =====
  if (await test('Cadastro sem nome deve retornar 400', async () => {
    const payload = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const { status, data } = await makeRequest('POST', '/auth/register', payload);

    if (status !== 400) {
      throw new Error(`Status esperado 400, recebido ${status}`);
    }

    if (data.message !== 'Campo "name" (nome) é obrigatório') {
      throw new Error(`Mensagem inesperada: ${data.message}`);
    }

    log('green', 'OK', `Erro correto retornado: ${data.message}`);
  })) {
    passed++;
  } else {
    failed++;
  }

  // ===== TESTE 3: Cadastro sem email =====
  if (await test('Cadastro sem email deve retornar 400', async () => {
    const payload = {
      name: 'Test User',
      password: 'Password123!',
    };

    const { status, data } = await makeRequest('POST', '/auth/register', payload);

    if (status !== 400) {
      throw new Error(`Status esperado 400, recebido ${status}`);
    }

    if (data.message !== 'Campo "email" é obrigatório') {
      throw new Error(`Mensagem inesperada: ${data.message}`);
    }

    log('green', 'OK', `Erro correto retornado: ${data.message}`);
  })) {
    passed++;
  } else {
    failed++;
  }

  // ===== TESTE 4: Cadastro sem senha =====
  if (await test('Cadastro sem senha deve retornar 400', async () => {
    const payload = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const { status, data } = await makeRequest('POST', '/auth/register', payload);

    if (status !== 400) {
      throw new Error(`Status esperado 400, recebido ${status}`);
    }

    if (data.message !== 'Campo "password" (senha) é obrigatório') {
      throw new Error(`Mensagem inesperada: ${data.message}`);
    }

    log('green', 'OK', `Erro correto retornado: ${data.message}`);
  })) {
    passed++;
  } else {
    failed++;
  }

  // ===== TESTE 5: Cadastro com email inválido =====
  if (await test('Cadastro com email inválido deve retornar 400', async () => {
    const payload = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'Password123!',
    };

    const { status, data } = await makeRequest('POST', '/auth/register', payload);

    if (status !== 400) {
      throw new Error(`Status esperado 400, recebido ${status}`);
    }

    if (!data.message.includes('Email inválido')) {
      throw new Error(`Mensagem inesperada: ${data.message}`);
    }

    log('green', 'OK', `Erro correto retornado: ${data.message}`);
  })) {
    passed++;
  } else {
    failed++;
  }

  // ===== TESTE 6: Cadastro com senha curta =====
  if (await test('Cadastro com senha curta deve retornar 400', async () => {
    const payload = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'abc',
    };

    const { status, data } = await makeRequest('POST', '/auth/register', payload);

    if (status !== 400) {
      throw new Error(`Status esperado 400, recebido ${status}`);
    }

    if (!data.message.includes('no mínimo 6 caracteres')) {
      throw new Error(`Mensagem inesperada: ${data.message}`);
    }

    log('green', 'OK', `Erro correto retornado: ${data.message}`);
  })) {
    passed++;
  } else {
    failed++;
  }

  // ===== TESTE 7: Cadastro com role inválido =====
  if (await test('Cadastro com role inválido deve retornar 400', async () => {
    const payload = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'invalid_role',
    };

    const { status, data } = await makeRequest('POST', '/auth/register', payload);

    if (status !== 400) {
      throw new Error(`Status esperado 400, recebido ${status}`);
    }

    if (!data.message.includes('Perfil inválido')) {
      throw new Error(`Mensagem inesperada: ${data.message}`);
    }

    log('green', 'OK', `Erro correto retornado: ${data.message}`);
  })) {
    passed++;
  } else {
    failed++;
  }

  // ===== RESUMO =====
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ Testes passou: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Testes falharam: ${failed}${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════${colors.reset}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

// Executar testes
runTests().catch((error) => {
  log('red', 'ERROR', error.message);
  process.exit(1);
});

