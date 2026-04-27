# 🚀 Guia de Configuração do MVP Agro Backend - Versão Portuguesa

## ✅ O que foi criado

Um **backend modular e profissional** separado do frontend, pronto para produção, com arquitetura escalável.

---

## 📁 Estrutura de Pastas

```
backend/
├── src/
│   ├── modules/              # Módulos de negócio
│   │   ├── cultures/         # Gestão de Culturas
│   │   ├── activities/       # Gestão de Atividades
│   │   ├── dashboard/        # Dashboard e Estatísticas
│   │   ├── weather/          # Dados de Clima
│   │   ├── reports/          # Geração de Relatórios (CSV/PDF)
│   │   └── uploads/          # Upload de Imagens
│   ├── shared/               # Código compartilhado
│   │   ├── config/           # Configurações (variáveis de ambiente)
│   │   ├── middlewares/      # Middlewares (CORS, Erro, Upload)
│   │   ├── utils/            # Utilitários (Logger, Armazenamento de Arquivos)
│   │   └── errors/           # Tratamento de Erros
│   ├── database/             # Camada de Dados
│   │   ├── json/             # Arquivos JSON (culturas.json, activities.json)
│   │   └── connection.js     # Conexão com Banco (JSON ou BD no futuro)
│   ├── app.js                # Aplicação Express
│   └── server.js             # Servidor
├── uploads/                  # Pasta para Uploads
├── .env                      # Variáveis de Ambiente
├── .gitignore                # Arquivos a Ignorar no Git
├── package.json              # Dependências
└── README.md                 # Documentação
```

---

## 🔧 Dependências Instaladas

- **express** - Framework Web
- **cors** - Controle de Acesso (CORS)
- **dotenv** - Variáveis de Ambiente
- **multer** - Upload de Arquivos
- **pdfkit** - Geração de PDF
- **uuid** - IDs Únicos
- **fs-extra** - Operações com Arquivos
- **helmet** - Segurança HTTP
- **nodemon** (dev) - Reinicialização Automática

---

## 🚀 Como Iniciar

### 1. Instalar Dependências (se ainda não fez)
```bash
cd backend
npm install
```

### 2. Rodar em Desenvolvimento
```bash
npm run dev
```

O servidor estará rodando em: **http://localhost:5000**

### 3. Rodar em Produção
```bash
npm start
```

---

## 📡 Endpoints da API

### **Culturas**
- `GET /api/cultures` - Listar todas
- `GET /api/cultures/:id` - Obter uma
- `POST /api/cultures` - Criar
- `PUT /api/cultures/:id` - Atualizar
- `DELETE /api/cultures/:id` - Deletar

### **Atividades**
- `GET /api/activities` - Listar todas
- `GET /api/activities/:id` - Obter uma
- `POST /api/activities` - Criar
- `PUT /api/activities/:id` - Atualizar
- `DELETE /api/activities/:id` - Deletar

### **Dashboard**
- `GET /api/dashboard` - Obter estatísticas gerais

### **Clima**
- `GET /api/weather` - Obter dados de clima (simulado)

### **Relatórios**
- `GET /api/reports/csv` - Baixar relatório em CSV
- `GET /api/reports/pdf` - Baixar relatório em PDF

### **Upload**
- `POST /api/uploads` - Fazer upload de imagem

---

## 📝 Exemplo de Uso

### Criar uma Cultura
```bash
curl -X POST http://localhost:5000/api/cultures \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Milho",
    "plantingDate": "2026-04-01",
    "harvestDate": "2026-08-01",
    "expectedRevenue": 4000,
    "notes": "Plantio inicial"
  }'
```

### Listar Culturas
```bash
curl http://localhost:5000/api/cultures
```

---

## 🔒 Validações e Regras de Negócio

### Culturas
- ✅ Nome é obrigatório
- ✅ Data de colheita deve ser após data de plantio
- ✅ Não permite deletar cultura com atividades vinculadas

### Atividades
- ✅ Título é obrigatório
- ✅ Data é obrigatória
- ✅ Validação de Culture ID
- ✅ Status padrão: `pending`
- ✅ Custo padrão: `0`

---

## 🌐 Integração com Frontend

### Arquivo `api.js` (Frontend)

Crie este arquivo no seu frontend:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

const apiRequest = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) throw new Error('Falha na requisição');
  return response.json();
};

// Culturas
const getCultures = () => apiRequest('/cultures');
const createCulture = (data) => apiRequest('/cultures', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
const updateCulture = (id, data) => apiRequest(`/cultures/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
const deleteCulture = (id) => apiRequest(`/cultures/${id}`, { method: 'DELETE' });

// Atividades
const getActivities = () => apiRequest('/activities');
const createActivity = (data) => apiRequest('/activities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
const updateActivity = (id, data) => apiRequest(`/activities/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
const deleteActivity = (id) => apiRequest(`/activities/${id}`, { method: 'DELETE' });

// Dashboard e Clima
const getDashboard = () => apiRequest('/dashboard');
const getWeather = () => apiRequest('/weather');

export {
  getCultures, createCulture, updateCulture, deleteCulture,
  getActivities, createActivity, updateActivity, deleteActivity,
  getDashboard, getWeather
};
```

### Usar no Frontend
```javascript
import { getCultures, createCulture } from './api.js';

// Listar
const culturas = await getCultures();

// Criar
await createCulture({
  name: 'Soja',
  plantingDate: '2026-05-01',
  harvestDate: '2026-10-01',
  expectedRevenue: 5000
});
```

---

## 📊 Dados do Dashboard

O endpoint `/api/dashboard` retorna:

```json
{
  "totalCultures": 5,
  "totalActivities": 12,
  "pendingActivities": 3,
  "completedActivities": 9,
  "upcomingHarvests": 2,
  "totalCost": 450.75,
  "totalRevenue": 15000,
  "margin": 14549.25
}
```

---

## 🔑 Variáveis de Ambiente (.env)

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Portas Permitidas por CORS
- `http://localhost:3000` (Vite/React)
- `http://localhost:5173` (Vite padrão)
- `http://127.0.0.1:5500` (Live Server)

---

## 📦 Padrão de Código

**Fluxo:** Route → Controller → Service → Repository

### Route (Define endpoints)
```javascript
router.get('/cultures', controller.getAll);
```

### Controller (Recebe requisição)
```javascript
const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
```

### Service (Lógica de negócio)
```javascript
const getAll = async () => {
  return await repository.getAll();
};
```

### Repository (Acesso a dados)
```javascript
const getAll = async () => {
  return await readCultures();
};
```

---

## 🧪 Checklist de Testes

- [ ] Backend rodando em `http://localhost:5000`
- [ ] `GET /api/cultures` retorna `[]` (vazio)
- [ ] `POST /api/cultures` cria uma cultura
- [ ] `GET /api/dashboard` retorna estatísticas
- [ ] `GET /api/weather` retorna dados de clima
- [ ] `GET /api/reports/csv` baixa CSV
- [ ] `GET /api/reports/pdf` baixa PDF
- [ ] Frontend consegue chamar API com CORS
- [ ] Dados persistem nos arquivos JSON
- [ ] Validações funcionam (ex: data inválida)
- [ ] Uploads funcionam

---

## 🚀 Próximos Passos

### Migração para Banco de Dados
1. Instalar Prisma: `npm install @prisma/client`
2. Configurar PostgreSQL/MySQL
3. Atualizar `src/database/connection.js`
4. Criar models no Prisma

### Deploy
1. Usar Vercel, Heroku ou servidor próprio
2. Configurar variáveis de ambiente
3. Usar `npm start` em produção

### Autenticação
1. Instalar JWT: `npm install jsonwebtoken`
2. Criar middleware de autenticação
3. Proteger rotas sensíveis

---

## ❓ Dúvidas Comuns

**P: Onde os dados são salvos?**
R: Atualmente em arquivos JSON em `src/database/json/`. Pronto para migrar para BD.

**P: Como adiciono mais módulos?**
R: Crie uma nova pasta em `src/modules/` com `routes.js`, `controller.js`, `service.js` e `repository.js`.

**P: Como faço deploy?**
R: Use Vercel, Heroku ou seu servidor. Configure `.env` e rode `npm start`.

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique o `.env`
2. Veja os logs do console
3. Valide o JSON no `src/database/json/`
4. Teste endpoints com Postman

---

✨ **Backend pronto para produção!** ✨

