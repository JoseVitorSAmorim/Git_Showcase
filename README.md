<div align="center">

# Git Showcase

### Projetos, ideias e tecnologia feitos por alunos.

Uma vitrine escolar para explorar trabalhos, conhecer as tecnologias usadas e apresentar projetos da comunidade.

![Node.js 22.5+](https://img.shields.io/badge/Node.js-22.5%2B-339933?logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/Backend-JavaScript-F7DF1E?logo=javascript&logoColor=black)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)

</div>

## ✨ Sobre o projeto

O Git Showcase reúne projetos desenvolvidos pelos alunos do colégio Rondon em uma interface responsiva. A página inicial organiza o conteúdo em abas — **Visão geral**, **Recursos**, **Projetos** e **Depoimentos** — e a vitrine permite buscar e filtrar os trabalhos.

O backend em JavaScript/Node.js e a persistência em SQLite estão implementados. Para facilitar os testes da interface, o modo ativo guarda os projetos temporariamente na sessão da guia.

### O que já funciona

- Navegação por abas e layout adaptável a telas menores.
- Busca, filtros e demonstração dos projetos.
- Login de teste no navegador.
- Inclusão temporária de projetos; eles ficam disponíveis na guia atual e somem quando ela é fechada.
- API Node.js com autenticação por sessão e operações de leitura e escrita no SQLite.

## Começando

### Requisitos

- Node.js **22.5 ou superior** (`node:sqlite` é usado pelo backend).

### Executar localmente

```bash
npm start
```

Abra <http://127.0.0.1:8000>. O servidor entrega o site e a API; mantenha o processo ativo enquanto estiver usando a aplicação.

### Testes

```bash
npm test
```

## Persistência e autenticação

### Modo de interface — sessão da guia (padrão)

Em `js/script.js`, `PERSISTENCE_MODE` está definido como `'browser'` para usar o fluxo de teste no navegador. Os projetos ficam em `sessionStorage`: continuam disponíveis após recarregar a página, mas são removidos ao fechar a guia. Projetos antigos em `localStorage` são transferidos para a sessão da guia e removidos do armazenamento persistente na primeira leitura. A sessão de teste e o identificador lembrado do login continuam em `localStorage`. Para testar o login, use qualquer identificador e uma senha com pelo menos **3 caracteres**.

Esse modo é apenas para desenvolvimento: não autentica pelo SQLite e não deve ser usado como segurança em produção. Os dados armazenados no navegador não são migrados automaticamente para o banco.

### Modo API/SQLite

Para usar as sessões e os projetos pela API, altere `PERSISTENCE_MODE` para `'sqlite'` em `js/script.js` e inicie o servidor com `npm start`.

O banco é criado automaticamente fora da pasta pública do site:

```text
<diretório pessoal>/.git-showcase/showcase.sqlite3
```

Defina `GIT_SHOWCASE_DB` para escolher outro arquivo. Na primeira inicialização de um banco vazio, é criada uma conta de demonstração:

| Campo | Valor |
| --- | --- |
| E-mail | `aluno@escola.edu.br` |
| Matrícula | `20261042` |
| Senha | `aluno123` |

O cadastro pela API exige senha de **8 a 256 caracteres**. As senhas são armazenadas com scrypt; as sessões usam cookies `HttpOnly` e `SameSite=Lax`.

## Configuração do servidor

| Variável | Padrão | Uso |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | Interface de rede onde o servidor escuta. |
| `PORT` | `8000` | Porta HTTP. |
| `GIT_SHOWCASE_DB` | `~/.git-showcase/showcase.sqlite3` | Caminho alternativo para o banco SQLite. |
| `GIT_SHOWCASE_SECURE_COOKIE` | — | Use `1` para marcar o cookie como `Secure` ao servir por HTTPS. |

## API

As rotas que recebem um corpo esperam `Content-Type: application/json`.

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/health` | Verifica se o servidor está ativo. |
| `GET` | `/api/projects` | Lista projetos; aceita `category` e `q` para filtrar e buscar. |
| `GET` | `/api/projects/:id` | Consulta os detalhes de um projeto. |
| `POST` | `/api/auth/register` | Cria uma conta e inicia uma sessão. |
| `POST` | `/api/auth/login` | Inicia uma sessão por e-mail ou matrícula. |
| `GET` | `/api/auth/me` | Retorna o usuário da sessão atual. |
| `POST` | `/api/auth/logout` | Encerra a sessão. |
| `POST` | `/api/projects` | Cria um projeto para o usuário autenticado. |
| `PATCH` ou `PUT` | `/api/projects/:id` | Atualiza um projeto próprio. |
| `DELETE` | `/api/projects/:id` | Exclui um projeto próprio. |

Exemplo de busca:

```text
GET /api/projects?category=web&q=energia
```

## Estrutura principal

```text
├── css/styles.css       # Estilos compartilhados
├── js/script.js         # Interface, autenticação e persistência
├── tests/               # Testes do servidor e da API
├── home.html            # Vitrine de projetos
├── index.html           # Página inicial
├── landing.html         # Landing page alternativa
├── login.html           # Acesso de alunos
└── server.js            # Servidor HTTP e API SQLite
```
