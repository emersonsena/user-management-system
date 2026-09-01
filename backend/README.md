# Backend — User API

API RESTful para CRUD de usuários, construída com NestJS, TypeORM, MySQL e autenticação JWT. Documentação interativa via Swagger.

## Tecnologias

- NestJS + TypeScript
- TypeORM + MySQL (driver `mysql2`)
- Autenticação JWT (`@nestjs/jwt`)
- Validação com `class-validator` / `class-transformer`
- Swagger (`@nestjs/swagger`)

## Estrutura

```
src/
├── users/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── app.module.ts
└── main.ts
```

## Variáveis de ambiente

Crie um arquivo `.env` a partir do `.env.example`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=crud_usuarios
JWT_SECRET=
```

Gere um valor seguro para `JWT_SECRET`:
```bash
openssl rand -hex 32
```

> A aplicação falha ao iniciar (propositalmente) se `JWT_SECRET` não estiver definida — é uma validação de segurança feita no `main.ts`.

## Como rodar localmente (sem Docker)

Pré-requisito: Node.js 24 (LTS) e um MySQL rodando localmente.

```bash
npm install
npm run start:dev
```

A API sobe em `http://localhost:3000`.

## Como rodar via Docker

Veja o `docker-compose.yml` na raiz do repositório — ele orquestra este serviço junto com o MySQL e o frontend.

```bash
# na raiz do repositório
docker-compose up --build
```

## Documentação da API (Swagger)

Com a aplicação rodando, acesse:
```
http://localhost:3000/api
```

## Endpoints principais

| Método | Rota          | Descrição                          |
|--------|---------------|-------------------------------------|
| POST   | `/users`      | Criar usuário                       |
| GET    | `/users`      | Listar usuários (busca + paginação) |
| GET    | `/users/:id`  | Buscar usuário por ID               |
| PATCH  | `/users/:id`  | Atualizar usuário                   |
| DELETE | `/users/:id`  | Remover usuário                     |

Query params de `GET /users`: `name` (filtro por nome), `page`, `limit`.

## Testes

```bash
npm run test        # testes unitários
npm run test:e2e    # testes end-to-end
npm run test:cov     # relatório de cobertura
```

## Boas práticas aplicadas

- Validação global de DTOs (`ValidationPipe` com `whitelist` e `transform`)
- Senha nunca retornada nas respostas da API
- Hash de senha com `bcrypt`
- Entidades carregadas via glob (`**/*.entity{.ts,.js}`), sem necessidade de registro manual
- CORS restrito à origem do frontend