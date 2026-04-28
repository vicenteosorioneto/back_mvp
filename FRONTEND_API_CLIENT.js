/**
 * API Client - MVP Agro
 *
 * Arquivo para integrar no frontend
 * Salve como: public/service/api.js ou frontend/api.js
 *
 * Uso:
 * import { registerUser, loginUser } from './api.js';
 *
 * const user = await registerUser({
 *   name: 'João',
 *   email: 'joao@example.com',
 *   password: 'Senha123!'
 * });
 */

const API_BASE_URL = 'http://localhost:5000/api';

// ===== HELPER PARA REQUISIÇÕES =====

/**
 * Faz uma requisição HTTP e trata erros
 * @param {string} method - GET, POST, PUT, DELETE
 * @param {string} endpoint - /auth/register, /cultures, etc
 * @param {Object} body - Dados para enviar (opcional)
 * @param {string} token - Token JWT para autenticação (opcional)
 * @returns {Promise<Object>}
 */
async function apiCall(method, endpoint, body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[API] ${method} ${endpoint}`);

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // Backend retorna um objeto com success:false e message
      const errorMessage = data.message || `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`[API ERROR] ${error.message}`);
    throw error;
  }
}

// ===== AUTH =====

/**
 * Cadastrar novo usuário
 * @param {Object} payload
 * @param {string} payload.name - Nome completo (obrigatório)
 * @param {string} payload.email - Email válido (obrigatório)
 * @param {string} payload.password - Mínimo 6 caracteres (obrigatório)
 * @param {string} payload.role - 'admin' | 'produtor' | 'tecnico' (opcional, padrão: produtor)
 * @returns {Promise<Object>} { id, name, email, role }
 * @throws {Error} Mensagem de erro do backend
 */
export async function registerUser(payload) {
  const result = await apiCall('POST', '/auth/register', payload);
  return result.data;
}

/**
 * Fazer login
 * @param {Object} payload
 * @param {string} payload.email - Email do usuário
 * @param {string} payload.password - Senha do usuário
 * @returns {Promise<Object>} { token, refreshToken, expiresAt, user }
 * @throws {Error}
 */
export async function loginUser(payload) {
  const result = await apiCall('POST', '/auth/login', payload);
  const { token, refreshToken, expiresAt, user } = result.data;

  // Salvar token no localStorage
  localStorage.setItem('authToken', token);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));

  return result.data;
}

/**
 * Fazer logout
 * @returns {Promise<void>}
 */
export async function logoutUser() {
  const token = getAuthToken();

  try {
    await apiCall('POST', '/auth/logout', null, token);
  } finally {
    // Limpar mesmo se falhar
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

/**
 * Obter perfil do usuário autenticado
 * @returns {Promise<Object>} { id, name, email, role, created_at, updated_at }
 * @throws {Error}
 */
export async function getProfile() {
  const token = getAuthToken();
  const result = await apiCall('GET', '/auth/me', null, token);
  return result.data;
}

/**
 * Atualizar perfil do usuário autenticado
 * @param {Object} payload - { name } (por enquanto)
 * @returns {Promise<Object>} Perfil atualizado
 * @throws {Error}
 */
export async function updateProfile(payload) {
  const token = getAuthToken();
  const result = await apiCall('PUT', '/auth/me', payload, token);
  return result.data;
}

// ===== CULTURAS =====

/**
 * Obter todas as culturas do usuário
 * @returns {Promise<Array>}
 */
export async function getCultures() {
  const token = getAuthToken();
  const result = await apiCall('GET', '/cultures', null, token);
  return result.data;
}

/**
 * Obter uma cultura específica
 * @param {string} id - ID da cultura
 * @returns {Promise<Object>}
 */
export async function getCultureById(id) {
  const token = getAuthToken();
  const result = await apiCall('GET', `/cultures/${id}`, null, token);
  return result.data;
}

/**
 * Criar nova cultura
 * @param {Object} payload - { name, plantingDate, harvestDate, expectedRevenue, notes }
 * @returns {Promise<Object>}
 */
export async function createCulture(payload) {
  const token = getAuthToken();
  const result = await apiCall('POST', '/cultures', payload, token);
  return result.data;
}

/**
 * Atualizar cultura
 * @param {string} id - ID da cultura
 * @param {Object} payload - Dados a atualizar
 * @returns {Promise<Object>}
 */
export async function updateCulture(id, payload) {
  const token = getAuthToken();
  const result = await apiCall('PUT', `/cultures/${id}`, payload, token);
  return result.data;
}

/**
 * Deletar cultura
 * @param {string} id - ID da cultura
 * @returns {Promise<void>}
 */
export async function deleteCulture(id) {
  const token = getAuthToken();
  await apiCall('DELETE', `/cultures/${id}`, null, token);
}

// ===== ATIVIDADES =====

/**
 * Obter todas as atividades
 * @returns {Promise<Array>}
 */
export async function getActivities() {
  const token = getAuthToken();
  const result = await apiCall('GET', '/activities', null, token);
  return result.data;
}

/**
 * Obter atividade específica
 * @param {string} id
 * @returns {Promise<Object>}
 */
export async function getActivityById(id) {
  const token = getAuthToken();
  const result = await apiCall('GET', `/activities/${id}`, null, token);
  return result.data;
}

/**
 * Criar atividade
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function createActivity(payload) {
  const token = getAuthToken();
  const result = await apiCall('POST', '/activities', payload, token);
  return result.data;
}

/**
 * Atualizar atividade
 * @param {string} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function updateActivity(id, payload) {
  const token = getAuthToken();
  const result = await apiCall('PUT', `/activities/${id}`, payload, token);
  return result.data;
}

/**
 * Deletar atividade
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteActivity(id) {
  const token = getAuthToken();
  await apiCall('DELETE', `/activities/${id}`, null, token);
}

// ===== DASHBOARD =====

/**
 * Obter dados do dashboard
 * @returns {Promise<Object>}
 */
export async function getDashboard() {
  const token = getAuthToken();
  const result = await apiCall('GET', '/dashboard', null, token);
  return result.data;
}

// ===== UTILITÁRIOS =====

/**
 * Obter token de autenticação do localStorage
 * @returns {string|null}
 */
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Obter usuário salvo do localStorage
 * @returns {Object|null}
 */
export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Verificar se usuário está autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!getAuthToken();
}

/**
 * Limpar todos os dados de autenticação
 */
export function clearAuth() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

// ===== EXEMPLO DE USO =====

/*
// Cadastro
try {
  const user = await registerUser({
    name: 'João Silva',
    email: 'joao@example.com',
    password: 'Senha123!',
  });
  console.log('Usuário criado:', user);
} catch (error) {
  console.error('Erro ao cadastrar:', error.message);
  alert(`❌ ${error.message}`);
}

// Login
try {
  const auth = await loginUser({
    email: 'joao@example.com',
    password: 'Senha123!',
  });
  console.log('Login com sucesso!', auth.user);
  // Redirecionar para dashboard
  window.location.href = '/dashboard.html';
} catch (error) {
  alert(`❌ ${error.message}`);
}

// Obter culturas
try {
  const cultures = await getCultures();
  console.log('Culturas:', cultures);
} catch (error) {
  alert(`❌ ${error.message}`);
}

// Criar cultura
try {
  const culture = await createCulture({
    name: 'Milho',
    plantingDate: '2026-04-01',
    harvestDate: '2026-08-01',
    expectedRevenue: 5000,
    notes: 'Plantio inicial',
  });
  console.log('Cultura criada:', culture);
} catch (error) {
  alert(`❌ ${error.message}`);
}

// Logout
try {
  await logoutUser();
  window.location.href = '/login.html';
} catch (error) {
  console.error('Erro ao fazer logout:', error.message);
}
*/

