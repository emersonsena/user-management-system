# Frontend — User Management UI

Interface em Angular para gerenciamento de usuários, consumindo a API do backend NestJS.

## Tecnologias

- Angular
- Reactive Forms
- Nginx (servindo o build de produção via Docker)

## Estrutura

```
src/app/
├── core/
│   └── services/
│       └── user.service.ts
├── shared/
├── features/
│   ├── home/
│   ├── users-list/
│   └── user-form/
├── models/
│   └── user.model.ts
└── app-routing.module.ts
```

## Telas

| Tela                  | Descrição                                                   |
|------------------------|--------------------------------------------------------------|
| Home                    | Tela de apresentação                                         |
| Lista de usuários       | Listagem com pesquisa por nome e paginação                   |
| Cadastro de usuário     | Formulário com validações (nome, e-mail, matrícula, senha)   |
| Edição de usuário       | Reaproveita o formulário de cadastro                         |
| Exclusão de usuário     | Ação disponível na lista, com confirmação                    |

## Validações do formulário de usuário

| Campo      | Regra                                          |
|------------|--------------------------------------------------|
| Nome        | Apenas letras                                    |
| E-mail      | Formato de e-mail válido                          |
| Matrícula   | Apenas números                                    |
| Senha       | Alfanumérica, exatamente 6 caracteres             |
| Todos       | Obrigatórios — botão "Salvar" só habilita com formulário 100% válido |

## Como rodar localmente (sem Docker)

Pré-requisito: Node.js 24 (LTS) e Angular CLI.

```bash
npm install
ng serve
```

A aplicação sobe em `http://localhost:4200`.

> Ajuste `apiUrl` em `src/environments/environment.ts` para `http://localhost:3000/users` durante o desenvolvimento local.

## Como rodar via Docker

Veja o `docker-compose.yml` na raiz do repositório — ele faz o build de produção do Angular e serve via Nginx.

```bash
# na raiz do repositório
docker-compose up --build
```

Acesse em `http://localhost`.

## Build de produção

```bash
ng build --configuration production
```

O resultado vai para `dist/` e é o que o `Dockerfile` copia para dentro da imagem Nginx.

## Testes

```bash
ng test
```