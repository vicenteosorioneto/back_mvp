# Backend MVP Agro

Este é o backend separado do projeto MVP Agro, construído com Node.js e Express.

## Configuração
1. Instale as dependências: `npm install`
2. Copie seus dados JSON existentes para `src/database/json/`
3. Execute em desenvolvimento: `npm run dev`
4. Execute em produção: `npm start`

## Base da API
- URL Base: `http://localhost:5000/api`

## Endpoints
- Culturas: `/api/cultures`
- Atividades: `/api/activities`
- Dashboard: `/api/dashboard`
- Clima: `/api/weather`
- Relatórios: `/api/reports`
- Upload: `/api/uploads`

## Notas de Migração
- O frontend agora deve chamar `http://localhost:5000/api/...` em vez de caminhos relativos.
- Veja o exemplo `api.js` na seção de frontend abaixo.
