# Git Showcase

Vitrine de repositórios dos alunos técnicos do Rondon, com backend em JavaScript/Node.js e banco de dados SQLite.

## Requisitos

- Node.js 22.5 ou superior (o projeto usa o módulo nativo `node:sqlite`).

## Executar

```bash
npm start
```

Abra <http://127.0.0.1:8000>. O banco SQLite é criado automaticamente fora da pasta pública do site, em `~/.git-showcase/showcase.sqlite3`. Para escolher outro caminho, defina `GIT_SHOWCASE_DB`.

O servidor escuta em `127.0.0.1` por padrão. Para disponibilizá-lo em outra interface, defina `HOST` e `PORT` antes de iniciar. Em produção com HTTPS, defina também `GIT_SHOWCASE_SECURE_COOKIE=1`.

## Persistência da interface

Por enquanto, a interface usa `localStorage` para facilitar os testes no navegador. Os seis projetos de demonstração são carregados e mantidos no navegador; novos projetos retornados pelo backend também podem ser exibidos sem substituir os cards existentes. O login de teste aceita qualquer identificador e senha com pelo menos 3 caracteres. Esse modo é apenas para desenvolvimento e não autentica usuários pelo SQLite.

O backend SQLite continua disponível e testado. Para ativar a autenticação e os projetos pela API/SQLite, altere `PERSISTENCE_MODE` no início de `js/script.js` de `'localStorage'` para `'sqlite'` e execute o servidor com `npm start`. Os dados salvos no `localStorage` não são migrados automaticamente para o banco.

## Conta de demonstração

- E-mail: `aluno@escola.edu.br`
- Matrícula: `20261042`
- Senha: `aluno123`

Essa conta é criada apenas quando o banco ainda não contém o usuário de demonstração. Usuários podem ser cadastrados por `POST /api/auth/register`.

## API

- `GET /api/health` — estado do servidor.
- `GET /api/projects?category=web&q=energia` — lista, filtra e pesquisa projetos.
- `GET /api/projects/:id` — detalhes de um projeto.
- `POST /api/auth/register` — cria conta e inicia sessão.
- `POST /api/auth/login` — inicia sessão com e-mail ou matrícula.
- `GET /api/auth/me` — consulta a sessão atual.
- `POST /api/auth/logout` — encerra a sessão.
- `POST /api/projects` — cria projeto autenticado.
- `PATCH /api/projects/:id` — edita projeto próprio.
- `DELETE /api/projects/:id` — remove projeto próprio.

As rotas que recebem dados esperam `Content-Type: application/json`. As sessões usam cookies `HttpOnly`; senhas são armazenadas com scrypt. Cadastro exige senha de pelo menos 8 caracteres.

## Testes

```bash
npm test
```
