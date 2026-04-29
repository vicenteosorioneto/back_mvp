# Guia de Integração - Auth MVP Agro

## Erro 400 Bad Request no Cadastro

O erro 400 ao chamar `POST /api/auth/register` geralmente ocorre por:

### ❌ Problemas Comuns

1. **Nomes de campo errados**
   - ❌ Enviando: `{ "nome": "...", "senha": "..." }`
   - ✅ Correto: `{ "name": "...", "password": "..." }`

2. **Campos obrigatórios faltando**
   - ❌ Enviando: `{ "email": "...", "password": "..." }` (sem name)
   - ✅ Correto: `{ "name": "...", "email": "...", "password": "..." }`

3. **Email em formato inválido**
   - ❌ `email: "usuário"`
   - ✅ `email: "usuario@example.com"`

4. **Senha muito curta**
   - ❌ `password: "abc"`
   - ✅ `password: "Senha123!"`

5. **Campo `role` com valor inválido**
   - ❌ `role: "administrador"`
   - ✅ `role: "admin"` ou `role: "produtor"` ou `role: "tecnico"`

---

## ✅ Payload Esperado Correto

### POST /api/auth/register

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "Senha123!",
  "role": "produtor"
}
```

**Campos:**
- `name` (string, obrigatório): Nome completo do usuário
- `email` (string, obrigatório): Email válido (formato: user@domain.com)
- `password` (string, obrigatório): Mínimo 6 caracteres
- `role` (string, opcional): `"admin"`, `"produtor"` ou `"tecnico"` (padrão: "produtor")

**Respostas:**

✅ **201 Created** - Cadastro com sucesso
```json
{
  "success": true,
  "data": {
    "id": "uuid-do-usuario",
    "name": "João Silva",
    "email": "joao@email.com",
    "role": "produtor"
  }
}
```

❌ **400 Bad Request** - Dados inválidos
```json
{
  "success": false,
  "message": "Campo \"name\" (nome) é obrigatório"
}
```

### Mensagens de Erro Específicas

| Erro | Causa |
|------|-------|
| `Campo "name" (nome) é obrigatório` | `name` não enviado |
| `Campo "email" é obrigatório` | `email` não enviado |
| `Campo "password" (senha) é obrigatório` | `password` não enviado |
| `Email inválido. Use formato: user@example.com` | Email em formato errado |
| `Senha deve ter no mínimo 6 caracteres` | Senha muito curta |
| `Perfil inválido. Use: admin, produtor ou tecnico` | `role` não reconhecido |

---

## 🔌 Exemplo de Integração Frontend (JavaScript)

### api.js - Cliente HTTP

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// ===== AUTH =====

/**
 * Cadastro de novo usuário
 * @param {Object} payload - { name, email, password, role }
 * @returns {Promise<Object>} { id, name, email, role }
 */
export async function registerUser(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao cadastrar');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Login de usuário
 * @param {Object} payload - { email, password }
 * @returns {Promise<Object>} { token, refreshToken, expiresAt, user }
 */
export async function loginUser(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao fazer login');
    }

    // Salvar token no localStorage
    localStorage.setItem('authToken', result.data.token);
    localStorage.setItem('user', JSON.stringify(result.data.user));

    return result.data;
  } catch (error) {
    throw error;
  }
}

export async function logoutUser() {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer logout');
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  } catch (error) {
    throw error;
  }
}

export async function getProfile() {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao buscar perfil');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}

export async function updateProfile(payload) {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao atualizar perfil');
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}
```

### app.js - Usando a API

```javascript
import { registerUser, loginUser, logoutUser, getProfile } from './api.js';

// ===== CADASTRO =====

async function handleRegister() {
  try {
    const payload = {
      name: document.getElementById('fullName').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      role: document.getElementById('role').value || 'produtor', // opcional
    };

    // Validar campos no frontend também
    if (!payload.name.trim()) {
      alert('❌ Nome é obrigatório');
      return;
    }
    if (!payload.email.trim()) {
      alert('❌ Email é obrigatório');
      return;
    }
    if (!payload.password.trim()) {
      alert('❌ Senha é obrigatória');
      return;
    }

    const user = await registerUser(payload);

    alert(`✅ Cadastro com sucesso! Bem-vindo, ${user.name}`);
    // Redirecionar para login
    window.location.href = '/login.html';
  } catch (error) {
    alert(`❌ Erro: ${error.message}`);
    console.error(error);
  }
}

// ===== LOGIN =====

async function handleLogin() {
  try {
    const payload = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    };

    const { user, token } = await loginUser(payload);

    alert(`✅ Login com sucesso! Bem-vindo, ${user.name}`);
    // Redirecionar para dashboard
    window.location.href = '/dashboard.html';
  } catch (error) {
    alert(`❌ Erro: ${error.message}`);
    console.error(error);
  }
}

// ===== LOGOUT =====

async function handleLogout() {
  try {
    await logoutUser();
    alert('✅ Logout realizado com sucesso');
    window.location.href = '/login.html';
  } catch (error) {
    alert(`❌ Erro ao fazer logout: ${error.message}`);
  }
}

// Exportar funções para usar no HTML
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
```

### index.html - Formulário de Cadastro

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cadastro - MVP Agro</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .container {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: bold;
    }

    input, select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    input:focus, select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s;
    }

    button:hover {
      background: #764ba2;
    }

    .text-center {
      text-align: center;
      margin-top: 1rem;
      color: #666;
    }

    .text-center a {
      color: #667eea;
      text-decoration: none;
    }

    .text-center a:hover {
      text-decoration: underline;
    }

    .helper-text {
      font-size: 0.8rem;
      color: #999;
      margin-top: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Cadastro MVP Agro</h1>

    <form onsubmit="handleRegister(); return false;">
      <div class="form-group">
        <label for="fullName">Nome Completo *</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          required
          placeholder="João Silva"
        >
        <div class="helper-text">Use seu nome completo</div>
      </div>

      <div class="form-group">
        <label for="email">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="joao@email.com"
        >
        <div class="helper-text">Use um email válido</div>
      </div>

      <div class="form-group">
        <label for="password">Senha *</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          minlength="6"
          placeholder="••••••••"
        >
        <div class="helper-text">Mínimo 6 caracteres</div>
      </div>

      <div class="form-group">
        <label for="role">Perfil (Opcional)</label>
        <select id="role" name="role">
          <option value="produtor">Produtor (Padrão)</option>
          <option value="tecnico">Técnico</option>
          <option value="admin">Administrador</option>
        </select>
        <div class="helper-text">Se deixar em branco, será "Produtor"</div>
      </div>

      <button type="submit">Cadastrar</button>

      <div class="text-center">
        Já tem conta? <a href="/login.html">Fazer login</a>
      </div>
    </form>
  </div>

  <script src="api.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

---

## 🧪 Testando com cURL

```bash
# Cadastro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "Senha123!",
    "role": "produtor"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "Senha123!"
  }'
```

---

## 📋 Checklist de Integração

- [ ] Frontend está enviando `name` (não `nome`)
- [ ] Frontend está enviando `password` (não `senha`)
- [ ] Frontend está enviando `email`
- [ ] Senha tem no mínimo 6 caracteres
- [ ] Email segue formato: `usuario@dominio.com`
- [ ] Frontend tratando erros corretamente
- [ ] Token sendo salvo no localStorage após login
- [ ] Token sendo enviado no header `Authorization: Bearer <token>`
- [ ] Frontend exibindo mensagem de erro real retornada pelo backend

---

## 🔒 Segurança

1. **NUNCA** armazene senha em localStorage
2. **SEMPRE** use HTTPS em produção
3. **SEMPRE** valide campos no frontend e backend
4. **NUNCA** exponha detalhes técnicos de erro para o usuário final

---

## 📞 Suporte

Se ainda tiver erro 400, verifique:

1. ✅ Os nomes dos campos estão corretos?
2. ✅ Todos os campos obrigatórios estão presentes?
3. ✅ Os valores estão no formato esperado?
4. ✅ A URL está correta: `http://localhost:5000/api/auth/register`?
5. ✅ O backend está rodando?


