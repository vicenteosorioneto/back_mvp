# Funcionalidades e Arquitetura do Projeto

## Visao geral

Este projeto e um backend modular para um MVP Agro, construido em Node.js com Express e integrado ao Supabase para autenticacao, banco de dados e armazenamento de arquivos.

O codigo principal fica em `backend/src`. A raiz do repositorio tambem possui um `main.py`, mas ele e apenas o arquivo padrao gerado pelo PyCharm e nao participa da aplicacao.

## Stack principal

- Node.js com CommonJS.
- Express 5 para API HTTP.
- Supabase JS SDK para Auth, tabelas e Storage.
- Helmet para cabecalhos de seguranca.
- CORS configurado para o frontend e ambientes locais.
- Multer para upload de arquivos.
- PDFKit para gerar relatorios PDF.
- dotenv para variaveis de ambiente.
- Nodemon para desenvolvimento.

## Como a aplicacao inicia

O servidor e iniciado por `backend/src/server.js`, que importa `backend/src/app.js` e escuta a porta configurada.

Fluxo de inicializacao:

1. `src/server.js` carrega o app Express.
2. `src/app.js` registra middlewares globais.
3. `src/app.js` registra as rotas em `/api`.
4. `notFound` trata rotas inexistentes.
5. `errorHandler` centraliza respostas de erro.

Scripts disponiveis em `backend/package.json`:

```bash
npm run dev
npm start
```

## Variaveis de ambiente

As configuracoes sao lidas em `backend/src/shared/config/env.js`.

Variaveis usadas:

- `PORT`: porta do backend. Padrao: `5000`.
- `FRONTEND_URL`: origem principal permitida no CORS. Padrao: `http://localhost:3000`.
- `NODE_ENV`: ambiente de execucao. Padrao: `development`.
- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: chave service role usada pelo backend.

Observacao: a conexao Supabase exige `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`; sem elas a aplicacao falha ao iniciar.

## Arquitetura

O projeto segue uma organizacao modular por dominio:

```text
backend/src/
  app.js
  server.js
  database/
    supabase.js
    connection.js
    json/
  modules/
    activities/
    alerts/
    auth/
    cultures/
    dashboard/
    files/
    finance/
    financial-summary/
    history/
    properties/
    reports/
    uploads/
    weather/
  shared/
    config/
    errors/
    mappers/
    middlewares/
    utils/
```

O fluxo padrao de uma requisicao e:

```text
Route -> Controller -> Service -> Repository -> Supabase
```

- `routes.js`: define endpoints e middlewares por modulo.
- `controller.js`: recebe a requisicao, chama o service e formata a resposta HTTP.
- `service.js`: concentra validacoes e regras de negocio.
- `repository.js`: acessa tabelas ou Storage do Supabase.
- `shared/mappers`: converte campos entre `snake_case` do banco e `camelCase` da API.
- `shared/middlewares`: autenticacao, autorizacao, upload e tratamento de erro.

## Persistencia e banco de dados

A persistencia ativa usa Supabase.

Principais tabelas previstas pelos scripts SQL:

- `user_profiles`: perfil do usuario, nome, email, role e dados adicionais.
- `technician_assignments`: relacionamento entre tecnico e produtor.
- `properties`: propriedades rurais.
- `cultures`: culturas/plantios.
- `activities`: atividades vinculadas a culturas e propriedades.
- `alerts`: alertas gerados a partir de regras de negocio.
- `files`: metadados de arquivos enviados ao Supabase Storage.

O bucket de Storage usado para arquivos e `agro-files`.

Arquivos SQL relevantes:

- `backend/sql/create_tables_clean.sql`: schema principal.
- `backend/migration.sql`: migracoes adicionais, como `activities.tipo`, `cultures.area`, `files.culture_id` e `user_profiles.position`.
- `backend/sql/create_storage_bucket.sql`: cria o bucket `agro-files`.
- `backend/sql/fix_user_profiles_trigger.sql`: cria trigger para gerar perfil quando um usuario e criado no Supabase Auth.

Existe tambem `backend/src/database/connection.js` com funcoes para JSON legado, mas os repositories atuais usam `backend/src/database/supabase.js`.

## Autenticacao e autorizacao

A autenticacao usa Supabase Auth.

Endpoints de auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/me`

Roles aceitas:

- `admin`
- `produtor`
- `tecnico`

Middlewares:

- `requireAuth`: exige header `Authorization: Bearer <token>`, decodifica o JWT, valida expiracao e busca o usuario via Admin API do Supabase.
- `optionalAuth`: tenta autenticar se houver token, mas permite continuar sem usuario.
- `requireRole`: restringe acesso por perfil, embora nao esteja amplamente aplicado nas rotas atuais.

Escopo de dados:

- `admin`: ve todos os registros nos repositories que implementam escopo.
- `produtor`: ve registros cujo `owner_id` corresponde ao seu usuario.
- `tecnico`: usa `allowedIds` quando presente no perfil; se nao houver, cai para o proprio usuario.

Observacao tecnica: os middlewares decodificam o JWT localmente para extrair `sub` e `exp`, depois confirmam o usuario pela Admin API do Supabase.

## Funcionalidades

### Autenticacao

Permite registrar, autenticar, encerrar sessao e consultar/atualizar o perfil.

Regras principais:

- Registro exige `name`, `email` e `password`.
- Email deve ter formato valido.
- Senha deve ter no minimo 6 caracteres.
- Role deve ser `admin`, `produtor` ou `tecnico`.
- Login retorna `token`, `refreshToken`, `expiresAt` e dados do usuario.

### Propriedades

Modulo protegido por autenticacao.

Endpoints:

- `GET /api/properties`
- `GET /api/properties/:id`
- `POST /api/properties`
- `PUT /api/properties/:id`
- `DELETE /api/properties/:id`

Campos principais:

- `name`
- `city`
- `state`
- `hectares`
- `productionType`
- `ownerId`

Regras:

- Criacao exige `name`.
- Produtores so acessam propriedades proprias.
- Admin pode acessar qualquer propriedade.

### Culturas

Modulo legado com autenticacao opcional.

Endpoints:

- `GET /api/cultures`
- `GET /api/cultures/:id`
- `POST /api/cultures`
- `PUT /api/cultures/:id`
- `DELETE /api/cultures/:id`

Filtros suportados em listagem:

- `status`
- `propertyId`

Campos principais:

- `name`
- `area`
- `plantingDate`
- `harvestDate`
- `expectedRevenue`
- `propertyId`
- `status`
- `notes`

Regras:

- Criacao exige `name`, `plantingDate` e `harvestDate`.
- Data de colheita deve ser posterior a data de plantio.
- Status em portugues e normalizado para valores internos em ingles.
- Nao permite deletar uma cultura que tenha atividades vinculadas.

### Atividades

Modulo legado com autenticacao opcional.

Endpoints:

- `GET /api/activities`
- `GET /api/activities/:id`
- `POST /api/activities`
- `PUT /api/activities/:id`
- `PATCH /api/activities/:id/status`
- `DELETE /api/activities/:id`

Filtros suportados em listagem:

- `status`
- `tipo`
- `cultureId`
- `propertyId`
- `startDate`
- `endDate`

Campos principais:

- `title`
- `tipo`
- `date`
- `cultureId`
- `propertyId`
- `assignee`
- `cost`
- `status`
- `notes`
- `photoUrl`

Tipos conhecidos:

- `Plantio`
- `Irrigacao`
- `Adubacao`
- `Pulverizacao`
- `Colheita`
- `Manutencao`
- `Outro`

Regras:

- Criacao exige `title` e `date`.
- Se `cultureId` for enviado, a cultura precisa existir.
- Status em portugues e normalizado para `pending` ou `completed`.
- Atividades pendentes com data vencida sao retornadas como `delayed`.
- Upload de foto legado salva em disco em `backend/uploads`.

### Dashboard

Endpoint:

- `GET /api/dashboard`

Retorna indicadores consolidados:

- total de propriedades.
- total de culturas.
- culturas ativas.
- total de atividades.
- atividades pendentes, concluidas e atrasadas.
- colheitas previstas para os proximos 15 dias.
- custo total.
- receita esperada.
- lucro estimado.
- margem percentual.

### Financeiro

Endpoint protegido:

- `GET /api/finance`

Retorna:

- custo total.
- receita esperada.
- lucro estimado.
- margem percentual.
- custo e receita por cultura.
- custo por mes.
- custo por tipo de atividade.

### Resumo financeiro

Endpoint:

- `GET /api/financial-summary`

Retorna um resumo por cultura:

- receita esperada.
- custos totais das atividades.
- margem estimada.

### Historico

Endpoint:

- `GET /api/history`

Agrupa atividades por cultura e retorna:

- dados da cultura.
- custo total das atividades.
- lucro estimado.
- atividades ordenadas por data.

### Alertas

Modulo protegido por autenticacao.

Endpoints:

- `GET /api/alerts`
- `POST /api/alerts/generate`
- `PATCH /api/alerts/read-all`
- `PATCH /api/alerts/:id/read`
- `DELETE /api/alerts/:id`

Tipos de alerta gerados:

- atividade atrasada.
- atividade sem responsavel.
- atividade com custo elevado.
- colheita proxima.
- cultura sem atividades.

Regras:

- Custo elevado e definido como atividade com custo maior ou igual a `1000`.
- Colheita proxima considera os proximos `15` dias.
- O gerador evita duplicar alertas nao lidos com mesmo tipo e referencia.
- Alertas podem ser marcados como lidos individualmente ou em lote.

### Arquivos

Modulo protegido por autenticacao e integrado ao Supabase Storage.

Endpoints:

- `POST /api/files/upload`
- `GET /api/files`
- `DELETE /api/files/:id`

Filtros suportados em listagem:

- `activityId`
- `cultureId`

Tipos aceitos:

- JPEG, PNG, WebP e GIF.
- PDF.
- Word `.doc` e `.docx`.

Regras:

- Tamanho maximo: 10 MB.
- Upload e feito em memoria pelo Multer.
- O arquivo e salvo no bucket `agro-files`.
- Metadados sao persistidos na tabela `files`.
- Arquivo pode ser vinculado a uma atividade e/ou cultura.

### Relatorios

Endpoints:

- `GET /api/reports/csv`
- `GET /api/reports/pdf`

O CSV inclui:

- propriedades.
- culturas.
- atividades.
- resumo financeiro.

O PDF inclui:

- resumo financeiro.
- propriedades.
- culturas.
- atividades.

### Clima

Endpoint:

- `GET /api/weather`

Atualmente retorna dados simulados:

- temperatura `25`.
- condicao `Sunny`.
- local `Farm Area`.

### Uploads legados

Existe um modulo `uploads`, mas ele nao esta registrado em `src/app.js`.

Tambem existe upload legado dentro de atividades:

- `POST /api/activities` aceita `photo` via Multer.
- O arquivo e salvo em disco na pasta `backend/uploads`.
- Arquivos dessa pasta sao expostos por `GET /uploads/...`.

## Endpoints consolidados

Base local padrao:

```text
http://localhost:5000/api
```

Lista:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `GET /api/properties`
- `GET /api/properties/:id`
- `POST /api/properties`
- `PUT /api/properties/:id`
- `DELETE /api/properties/:id`
- `GET /api/cultures`
- `GET /api/cultures/:id`
- `POST /api/cultures`
- `PUT /api/cultures/:id`
- `DELETE /api/cultures/:id`
- `GET /api/activities`
- `GET /api/activities/:id`
- `POST /api/activities`
- `PUT /api/activities/:id`
- `PATCH /api/activities/:id/status`
- `DELETE /api/activities/:id`
- `GET /api/dashboard`
- `GET /api/finance`
- `GET /api/financial-summary`
- `GET /api/history`
- `GET /api/alerts`
- `POST /api/alerts/generate`
- `PATCH /api/alerts/read-all`
- `PATCH /api/alerts/:id/read`
- `DELETE /api/alerts/:id`
- `POST /api/files/upload`
- `GET /api/files`
- `DELETE /api/files/:id`
- `GET /api/reports/csv`
- `GET /api/reports/pdf`
- `GET /api/weather`

## Formato de resposta

A maior parte dos endpoints JSON retorna:

```json
{
  "success": true,
  "data": {}
}
```

Erros operacionais retornam:

```json
{
  "success": false,
  "message": "Mensagem do erro"
}
```

Relatorios CSV e PDF retornam arquivos como attachment.

## Seguranca e CORS

O app usa:

- `helmet()` para headers HTTP.
- `cors()` com credenciais habilitadas.
- origens permitidas:
  - `FRONTEND_URL`
  - `http://localhost:5173`
  - `http://127.0.0.1:5500`

## Pontos de atencao

- A documentacao antiga em `SETUP_PT_BR.md` e `backend/README.md` ainda menciona persistencia em JSON, mas o codigo atual dos repositories usa Supabase.
- `backend/src/database/connection.js` parece legado e nao e usado pelos repositories atuais.
- O schema principal em `create_tables_clean.sql` nao contem todos os campos adicionados depois; `migration.sql` complementa campos como `tipo`, `area`, `culture_id` e `position`.
- `technician_assignments` existe no SQL, mas o codigo atual nao carrega `allowedIds` a partir dessa tabela.
- Algumas rotas legadas usam `optionalAuth`; sem token, os dados podem ser consultados sem escopo de usuario, dependendo das politicas do Supabase e da service role usada pelo backend.
- `requireAuth` usa service role e Admin API. Isso facilita operacao no backend, mas exige cuidado para nao expor essa chave fora do servidor.
- O modulo `uploads` existe na pasta de modulos, mas nao esta registrado no Express.
- O arquivo `main.py` na raiz nao faz parte do backend Node.

## Resumo da arquitetura em uma frase

E uma API Express modular para gestao agropecuaria, organizada por dominios, com regras de negocio nos services, acesso a dados nos repositories e Supabase como backend de autenticacao, banco relacional e storage.
