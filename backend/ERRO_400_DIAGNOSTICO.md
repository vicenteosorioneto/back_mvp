# 🐛 Diagnóstico e Correção - Erro 400 no Cadastro MVP Agro

## 🔍 O Problema

Frontend chama `POST http://localhost:5000/api/auth/register` mas recebe:
```
400 Bad Request
```

Sem saber exatamente qual é o problema.

---

## ✅ Solução Implementada

### 1. Backend melhorado com mensagens de erro claras

Arquivo: `backend/src/modules/auth/auth.service.js`

Antes:
```javascript
if (!name || !email || !password) 
  throw new AppError('Nome, email e senha são obrigatórios', 400);
```

Depois:
```javascript
if (!name) throw new AppError('Campo "name" (nome) é obrigatório', 400);
if (!email) throw new AppError('Campo "email" é obrigatório', 400);
if (!password) throw new AppError('Campo "password" (senha) é obrigatório', 400);

// Também valida:
// - Formato do email
// - Tamanho mínimo da senha
// - Perfil válido
```

**Benefícios:**
- ✅ Mensagem específica indicando qual campo está errado
- ✅ Fácil para frontend exibir ao usuário
- ✅ Ajuda a depurar problemas

---

## 📝 Payloads Corretos vs Errados

### ❌ ERRADO - Nomes de campo inválidos

```json
{
  "nome": "João",
  "email": "joao@email.com",
  "senha": "Senha123!"
}
```

**Erro retornado:**
```json
{
  "success": false,
  "message": "Campo \"name\" (nome) é obrigatório"
}
```

### ✅ CORRETO

```json
{
  "name": "João",
  "email": "joao@email.com",
  "password": "Senha123!"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "João",
    "email": "joao@email.com",
    "role": "produtor"
  }
}
```

---

## 🧪 Teste Rápido

### Com Node.js

```bash
cd backend
node test-auth.js
```

Executa 7 testes automatizados:
1. ✅ Cadastro com dados válidos
2. ✅ Rejeita cadastro sem nome
3. ✅ Rejeita cadastro sem email
4. ✅ Rejeita cadastro sem senha
5. ✅ Rejeita email inválido
6. ✅ Rejeita senha curta (< 6 caracteres)
7. ✅ Rejeita role inválido

### Com cURL

```bash
# TESTE 1: Dados válidos (deve retornar 201)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@email.com",
    "password": "Senha123!"
  }'

# Esperado:
# {
#   "success": true,
#   "data": { "id": "...", "name": "João Silva", ... }
# }

# ─────────────────────────────────────────────────────

# TESTE 2: Sem nome (deve retornar 400)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "password": "Senha123!"
  }'

# Esperado:
# {
#   "success": false,
#   "message": "Campo \"name\" (nome) é obrigatório"
# }
```

---

## 🎯 Checklist para Corrigir no Frontend

Se receber erro 400, verificar em ordem:

- [ ] **Nomes dos campos** são `name`, `email`, `password`?
  - ❌ Não está `nome`, `email_user`, `passwd`?
  
- [ ] **Todos os 3 campos obrigatórios** estão presentes?
  - ✅ name
  - ✅ email
  - ✅ password
  
- [ ] **Email** segue formato `user@domain.com`?
  - ❌ Não é `usuario` ou `abc`?
  
- [ ] **Senha** tem no mínimo **6 caracteres**?
  - ❌ Não é `abc` ou `12345`?
  
- [ ] **Role** é um destes (se enviado)?
  - ✅ `admin`
  - ✅ `produtor` (padrão)
  - ✅ `tecnico`

---

## 📚 Documentação Completa

Ver arquivo: `AUTH_INTEGRATION_GUIDE.md`

Contém:
- ✅ Todos os payloads esperados
- ✅ Exemplo completo de frontend (HTML/JS)
- ✅ Código de cliente HTTP (fetch)
- ✅ Todas as mensagens de erro possíveis
- ✅ Boas práticas de segurança

---

## 🔧 Como Integrar no Frontend Existente

### Passo 1: Atualizar estrutura de dados

**Antes:**
```javascript
const userData = {
  nome: inputNome.value,
  email: inputEmail.value,
  senha: inputSenha.value,
};
```

**Depois:**
```javascript
const userData = {
  name: inputNome.value,
  email: inputEmail.value,
  password: inputSenha.value,
  role: 'produtor', // opcional
};
```

### Passo 2: Enviar com nomes corretos

**Antes:**
```javascript
fetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify(userData),
});
```

**Depois:**
```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: userData.nome,
    email: userData.email,
    password: userData.senha,
  }),
});
```

### Passo 3: Exibir erro do backend

**Antes:**
```javascript
.catch(error => alert('Erro ao cadastrar'));
```

**Depois:**
```javascript
.then(response => response.json())
.then(data => {
  if (!data.success) {
    // Exibir a mensagem REAL do backend
    alert(`❌ ${data.message}`);
  } else {
    alert(`✅ Cadastro com sucesso!`);
  }
})
.catch(error => alert(`❌ Erro: ${error.message}`));
```

---

## 🚀 Próximas Etapas

1. ✅ **Corrigir frontend** para enviar nomes corretos de campos
2. ✅ **Testar com Node.js**: `node backend/test-auth.js`
3. ✅ **Verificar logs** do backend quando testar
4. ✅ **Salvar token** do JWT após login bem-sucedido
5. ✅ **Enviar token** em próximas requisições autenticadas

---

## 💡 Dicas

- **Sempre valide no frontend também** (evita requisições desnecessárias)
- **Mostre mensagem de erro do backend** para o usuário (agora são específicas)
- **Teste com cURL primeiro** para isolaro problema entre frontend e backend
- **Verifique console do navegador** (DevTools → Network → ver o response)
- **Salve o token após login** para não pedir login repetidamente

---

## 📞 Suporte

Se ainda tiver erro 400 após aplicar as correções:

1. Execute: `node backend/test-auth.js` para ver se está funcionando
2. Use cURL para testar a URL e dados exatos
3. Verifique se o backend está rodando: `node backend/src/server.js`
4. Procure por "registered user" ou similar nos logs
5. Valide os dados enviando via Postman/Insomnia


