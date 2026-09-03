---
title: "Documentação Técnica — Sistema WenLock"
subtitle: "CRUD de Usuários Fullstack com Autenticação JWT"
author: "Emerson Sena de Souza"
date: \today
---

# 1. Visão Geral

O **WenLock** é uma aplicação fullstack de gestão de usuários (CRUD), desenvolvida como projeto de portfólio/avaliação técnica. A aplicação foi containerizada integralmente com Docker, permitindo subir todo o ambiente — banco de dados, backend e frontend — com um único comando.

**Repositório:** [github.com/emersonsena/user-management-system](https://github.com/emersonsena/user-management-system)

## 1.1 Links do Projeto

| Recurso | Link |
|---------|------|
| Repositório (mono-repo) | [github.com/emersonsena/user-management-system](https://github.com/emersonsena/user-management-system) |
| README raiz do projeto | [README.md](https://github.com/emersonsena/user-management-system/blob/main/README.md) |
| README do Backend | [backend/README.md](https://github.com/emersonsena/user-management-system/blob/main/backend/README.md) |
| README do Frontend | [frontend/README.md](https://github.com/emersonsena/user-management-system/blob/main/frontend/README.md) |

> Os links assumem a branch `main`. Se o projeto usar outra branch padrão, ajuste os links acima de acordo.

**Principais funcionalidades:**

- Autenticação de usuários via **JWT** (login, recuperação de senha)
- CRUD completo de usuários (criar, listar com busca e paginação, editar, excluir)
- Documentação interativa da API via **Swagger UI**
- Interface administrativa com layout de menu lateral fixo (sidebar), seguindo identidade visual própria ("WenLock")
- Ambiente 100% containerizado via **Docker Compose**

---

# 2. Arquitetura da Aplicação

A aplicação segue uma arquitetura de três camadas, orquestradas via `docker-compose`:

```
┌─────────────────────┐      HTTP/REST      ┌──────────────────────┐
│   Frontend (Angular) │ ───────────────────► │   Backend (NestJS)   │
│   Nginx :80          │ ◄─────────────────── │   Node.js :3000      │
└─────────────────────┘      JSON + JWT      └──────────┬───────────┘
                                                          │
                                                          │ TCP :3306
                                                          ▼
                                              ┌──────────────────────┐
                                              │   MySQL 8.0           │
                                              │   Container Docker    │
                                              └──────────────────────┘
```

Cada camada roda em seu próprio container Docker, comunicando-se através de uma rede interna (`app-network`), definida no `docker-compose.yml`. Apenas as portas necessárias são expostas ao host (80 para o frontend, 3000 para a API, 3306 para o banco).

---

# 3. Backend

## 3.1 Stack e Estrutura

O backend foi desenvolvido em **NestJS** (framework Node.js sobre TypeScript, com arquitetura modular inspirada em Angular), estruturado em módulos:

- **`AuthModule`** — autenticação e emissão de tokens JWT
- **`UsersModule`** — CRUD de usuários

## 3.2 Autenticação (JWT)

O fluxo de autenticação segue o padrão *stateless* com JSON Web Tokens:

1. O usuário envia `email`/`matrícula` + `senha` para o endpoint de login.
2. O backend localiza o usuário no banco e compara a senha informada com o hash armazenado, usando **bcrypt**.
3. Se a senha confere, o backend gera um **JWT assinado** (via `JwtModule`), contendo os dados essenciais do usuário no payload.
4. O token é devolvido ao frontend, que o armazena e o envia no header `Authorization: Bearer <token>` em requisições subsequentes.
5. Rotas protegidas usam um **Guard** (`AuthGuard`) que valida o token antes de liberar o acesso ao controller.

**Rotas do `AuthModule`:**

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Autentica o usuário e retorna o JWT |
| POST | `/auth/forgot-password` | Inicia fluxo de recuperação de senha |
| POST | `/auth/reset-password` | Redefine a senha do usuário |

## 3.3 Hash de Senhas com bcrypt

Nenhuma senha é armazenada em texto puro. Antes de persistir no banco, toda senha passa pelo **bcrypt**, que aplica um algoritmo de hashing unidirecional com *salt* automático, tornando inviável reverter o hash para descobrir a senha original — mesmo em caso de vazamento do banco de dados.

No login, a senha informada pelo usuário é comparada contra o hash salvo usando a função de verificação do bcrypt (que recalcula o hash com o mesmo salt e compara o resultado), nunca descriptografando o hash armazenado.

## 3.4 CRUD de Usuários

O `UsersModule` expõe as operações padrão de CRUD:

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/users` | Lista usuários (com paginação via `meta`) |
| GET | `/users/:id` | Busca um usuário específico |
| POST | `/users` | Cadastra um novo usuário |
| PUT | `/users/:id` | Atualiza um usuário existente |
| DELETE | `/users/:id` | Remove um usuário |

A resposta de listagem segue o formato:

```json
{
  "data": [ { "id": 1, "name": "...", "email": "...", "registration": "..." } ],
  "meta": {
    "totalItems": 11,
    "itemCount": 11,
    "itemsPerPage": 20,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

## 3.5 Documentação da API com Swagger

O backend expõe documentação interativa da API via **Swagger UI**, gerada automaticamente a partir de decorators do NestJS (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, etc.). Isso permite testar todos os endpoints diretamente pelo navegador, sem precisar de ferramentas externas como Postman, e serve como referência viva do contrato da API para quem for consumi-la.

## 3.6 Testes Unitários

A camada de **services** do backend (onde reside a lógica de negócio, isolada dos controllers e do transporte HTTP) possui cobertura de testes unitários, escritos com o framework de testes padrão do NestJS (**Jest**).

O foco nessa camada garante que regras de negócio — validações, hashing de senha com bcrypt, geração/verificação do JWT, tratamento de casos de erro (usuário não encontrado, credenciais inválidas, etc.) — sejam verificadas de forma isolada, com as dependências externas (banco de dados, módulos de terceiros) substituídas por *mocks*. Isso permite validar o comportamento da aplicação de forma rápida e determinística, sem depender de uma conexão real com o MySQL.

Para rodar os testes do backend:

```bash
cd backend
npm run test
```

Para gerar relatório de cobertura:

```bash
npm run test:cov
```

---

# 4. Banco de Dados

- **SGBD:** MySQL 8.0, rodando em container Docker dedicado
- **Persistência:** volume Docker nomeado (`mysql_data`), garantindo que os dados sobrevivam a reinícios do container
- **Healthcheck:** configurado no `docker-compose.yml` para garantir que o backend só inicie depois que o MySQL estiver pronto para aceitar conexões (`depends_on` com `condition: service_healthy`)

---

# 5. Frontend

## 5.1 Stack

Desenvolvido em **Angular** (standalone components, sem `NgModule`), com roteamento via lazy loading (`loadComponent`) para otimizar o carregamento inicial da aplicação.

## 5.2 Estrutura de Rotas e Layout

Para evitar duplicação de código, o menu lateral (sidebar) e o cabeçalho superior foram extraídos para um componente de layout único (`AppLayoutComponent`), que envolve todas as páginas autenticadas através de rotas filhas (*child routes*) e um `<router-outlet>`:

```
/                      → Splash (tela de abertura)
/login                 → Login
/forgot-password       → Recuperação de senha
/loading               → Loading pós-login
/app                   → AppLayoutComponent (sidebar + header)
  ├── /app/home           → Home
  ├── /app/users          → Listagem de usuários
  ├── /app/users/new      → Cadastro de usuário
  └── /app/users/:id/edit → Edição de usuário
```

Essa estrutura garante que o menu lateral seja renderizado **uma única vez** e permaneça fixo enquanto o usuário navega entre as telas internas — apenas o conteúdo do `router-outlet` é trocado.

## 5.3 Autenticação e Proteção de Rotas

Um **Route Guard funcional** (`authGuard`, `CanActivateFn`) protege as rotas que exigem autenticação, verificando a presença de um token JWT válido antes de liberar o acesso. Caso o usuário não esteja autenticado, é redirecionado automaticamente para `/login`.

## 5.4 Funcionalidades da Tela de Usuários

- **Busca em tempo real**, filtrando por nome, e-mail ou matrícula
- **Paginação client-side**, com controle de itens por página (15/25/50/100) e navegação entre páginas
- **Cadastro e edição** através de formulário reativo (`ReactiveFormsModule`), com validações:
  - Nome: obrigatório, apenas letras
  - E-mail: obrigatório, formato válido
  - Matrícula: obrigatória, apenas números
  - Senha: obrigatória no cadastro (mínimo 6 caracteres), opcional na edição
- **Exclusão** de usuários com confirmação

## 5.5 Identidade Visual

A interface segue um design system próprio ("WenLock"), com paleta de cores personalizada (definida via variáveis CSS), sidebar escura com navegação hierárquica (menu principal + submenu "Controle de Acesso"), e componentes reutilizáveis de formulário, tabela e paginação.

---

# 6. Containerização com Docker

## 6.1 Serviços

O `docker-compose.yml` define três serviços:

| Serviço | Imagem/Build | Porta | Função |
|---------|-------------|-------|--------|
| `mysql` | `mysql:8.0` | 3306 | Banco de dados relacional |
| `backend` | Build próprio (`./backend`) | 3000 | API REST (NestJS) |
| `frontend` | Build próprio (`./frontend`) | 80 | SPA Angular servida via Nginx |

## 6.2 Rede e Dependências

Todos os serviços compartilham uma rede bridge dedicada (`app-network`), permitindo que se comuniquem entre si pelo nome do serviço (ex: o backend acessa o banco via host `mysql`, não `localhost`). O backend só inicia após o healthcheck do MySQL confirmar que o banco está pronto (`depends_on.condition: service_healthy`).

## 6.3 Variáveis de Ambiente

Credenciais de banco e o segredo de assinatura do JWT (`JWT_SECRET`) são injetados via variáveis de ambiente no `docker-compose.yml`, mantendo a configuração sensível fora do código-fonte da aplicação.

## 6.4 Subindo o Ambiente

```bash
docker compose up --build
```

Isso builda as imagens do backend e frontend (caso ainda não existam ou tenham mudado) e sobe os três serviços. A aplicação fica acessível em:

- **Frontend:** `http://localhost`
- **API:** `http://localhost:3000`
- **Swagger:** `http://localhost:3000/api` *(ou o path configurado no projeto)*

## 6.5 Roteamento SPA no Nginx

Como o frontend é uma *Single Page Application*, o Nginx foi configurado para redirecionar qualquer rota desconhecida de volta ao `index.html`, permitindo que o Angular Router assuma o roteamento no client-side (essencial para que recarregar a página em rotas como `/app/users` funcione corretamente):

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

# 7. Resumo Técnico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Angular (standalone components), SCSS |
| Backend | NestJS (Node.js + TypeScript) |
| Autenticação | JWT (`@nestjs/jwt`) + bcrypt |
| Banco de Dados | MySQL 8.0 |
| Documentação da API | Swagger UI |
| Containerização | Docker + Docker Compose |
| Servidor Web (frontend) | Nginx |
| Testes | Jest (testes unitários dos services) |

**Repositório do projeto:** [https://github.com/emersonsena/user-management-system](https://github.com/emersonsena/user-management-system)

---

# 8. Passo a Passo — Como Testar a Aplicação

## 8.1 Pré-requisitos

- Docker e Docker Compose instalados
- Repositório clonado localmente:

```bash
git clone https://github.com/emersonsena/user-management-system.git
cd user-management-system
```

## 8.2 Subir o ambiente

```bash
docker compose up --build
```

Aguarde até os três containers aparecerem como `Running`/`Healthy`:

```
✔ Container mysql_crud    Healthy
✔ Container backend_crud  Running
✔ Container frontend_crud Running
```

## 8.3 Verificar se cada camada está respondendo

```bash
# Backend (API)
curl -I http://localhost:3000

# Swagger (documentação interativa da API)
curl -I http://localhost:3000/api

# Frontend (SPA)
curl -I http://localhost
```

Todos devem retornar `200 OK` (ou redirecionamento).

## 8.4 Testar a API diretamente pelo Swagger

Acesse `http://localhost:3000/api` no navegador. A partir daí é possível:

1. Testar o login (`POST /auth/login`) e copiar o token JWT retornado
2. Autorizar o Swagger com o token (botão **Authorize**, inserindo `Bearer <token>`)
3. Testar os endpoints protegidos do CRUD de usuários (`GET`, `POST`, `PUT`, `DELETE /users`)

## 8.5 Testar a aplicação completa pela interface

1. Acesse `http://localhost` no navegador
2. Aguarde a tela de splash e faça login com um usuário válido
3. Na tela **Home**, confirme que o menu lateral aparece corretamente
4. Navegue até **Controle de Acesso → Usuários**
5. Teste a busca por nome/e-mail/matrícula
6. Clique em **Cadastrar Usuário**, preencha o formulário e salve
7. Confirme que o novo usuário aparece na listagem
8. Teste **editar** e **excluir** um usuário existente

## 8.6 Rodar os testes unitários do backend

```bash
cd backend
npm run test
```

Para ver o relatório de cobertura:

```bash
npm run test:cov
```

## 8.7 Encerrar o ambiente

```bash
docker compose down
```

Para remover também os dados do banco (reset completo):

```bash
docker compose down -v
```

---

# 9. Considerações Finais

O projeto foi desenvolvido com foco em boas práticas de arquitetura fullstack: separação clara de responsabilidades entre frontend e backend, autenticação segura via JWT com hashing de senhas via bcrypt, documentação de API autoexplicativa via Swagger, e um ambiente de desenvolvimento/produção totalmente reprodutível através de containers Docker — eliminando o clássico problema de "funciona na minha máquina".