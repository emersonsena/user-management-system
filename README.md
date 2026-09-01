# User Management System

Sistema completo de gerenciamento de usuários, com API RESTful em **NestJS**, autenticação via **JWT**, interface em **Angular** e persistência em **MySQL**. Todo o projeto é containerizado com **Docker**, subindo com um único comando.

## Tecnologias

**Backend**
- NestJS + TypeScript
- TypeORM + MySQL
- Autenticação JWT (`@nestjs/jwt`)
- Validação com `class-validator` / `class-transformer`
- Documentação da API com Swagger (OpenAPI)

**Frontend**
- Angular
- Reactive Forms com validações customizadas
- Nginx (servindo o build de produção)

**Infraestrutura**
- Docker + Docker Compose (3 serviços: `mysql`, `backend`, `frontend`)

## Funcionalidades

- CRUD completo de usuários (criar, listar, buscar, atualizar, remover)
- Autenticação via JWT
- Pesquisa de usuários por nome
- Paginação na listagem
- Validações de formulário:
  - Nome: apenas letras
  - E-mail: formato válido
  - Matrícula: apenas números
  - Senha: alfanumérica, 6 dígitos
  - Todos os campos obrigatórios
  - Botão de salvar habilitado somente quando o formulário é válido
- Documentação interativa da API via Swagger UI

## Estrutura do repositório

```
user-management-system/
├── backend/          # API NestJS
│   ├── src/
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── frontend/         # Aplicação Angular
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados

Não é necessário ter Node.js instalado para rodar o projeto — tudo roda dentro dos containers.

## Como rodar o projeto

```bash
git clone https://github.com/<seu-usuario>/user-management-system.git
cd user-management-system
docker-compose up --build
```

Isso sobe três containers:
- `mysql_crud` — banco de dados MySQL
- `backend_crud` — API NestJS
- `frontend_crud` — aplicação Angular (servida via Nginx)

## Acessando a aplicação

| Serviço              | URL                              |
|-----------------------|-----------------------------------|
| Frontend               | http://localhost                 |
| Backend (API)           | http://localhost:3000            |
| Documentação Swagger    | http://localhost:3000/api        |

## Variáveis de ambiente

As credenciais usadas no `docker-compose.yml` são valores de exemplo, definidos apenas para facilitar a avaliação deste projeto — **não representam práticas recomendadas para um ambiente de produção real**.

Para rodar o backend localmente fora do Docker (`npm run start:dev`), crie um arquivo `backend/.env` a partir do `backend/.env.example`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_NAME=crud_usuarios
JWT_SECRET=
```

Gere um valor para `JWT_SECRET` com:
```bash
openssl rand -hex 32
```

## Testes

```bash
cd backend
npm run test        # testes unitários
npm run test:e2e    # testes end-to-end
```

## Arquitetura

O backend segue a organização modular padrão do NestJS: cada domínio (`users`, `auth`) é isolado em seu próprio módulo, com `controller`, `service`, `dto` e `entity` separados. A validação de entrada é centralizada via `ValidationPipe` global, e a documentação da API é gerada automaticamente a partir dos decorators do Swagger.

O frontend segue a estrutura de módulos por funcionalidade (`features/`), com um `service` central para comunicação HTTP com a API e formulários reativos para validação client-side.