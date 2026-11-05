const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');
const { createAppServer } = require('../server');

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-showcase-'));
const server = createAppServer(path.join(tempDir, 'showcase.sqlite3'));
let baseUrl;
let sessionCookie;

before(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  fs.rmSync(tempDir, { recursive: true, force: true });
});

async function request(method, route, payload, authenticated = false) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: {
      ...(payload === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(authenticated && sessionCookie ? { Cookie: sessionCookie } : {}),
    },
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
  });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : await response.arrayBuffer();
  return { response, body };
}

test('health and seeded project list are available', async () => {
  const health = await request('GET', '/api/health');
  assert.equal(health.response.status, 200);
  assert.deepEqual(health.body, { status: 'ok' });

  const catalog = await request('GET', '/api/projects?category=robotica&q=Horta');
  assert.equal(catalog.response.status, 200);
  assert.deepEqual(catalog.body.projects.map((project) => project.id), ['horta']);
  assert.deepEqual(catalog.body.projects[0].techs, ['MicroPython', 'NodeMCU', 'MQTT']);
});

test('login, current session, and logout use an HTTP-only cookie', async () => {
  const login = await request('POST', '/api/auth/login', {
    identifier: '20261042',
    password: 'aluno123',
    remember: true,
  });
  assert.equal(login.response.status, 200);
  assert.equal(login.body.user.email, 'aluno@escola.edu.br');
  const setCookie = login.response.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Lax/);
  sessionCookie = setCookie.split(';')[0];

  const currentUser = await request('GET', '/api/auth/me', undefined, true);
  assert.equal(currentUser.response.status, 200);
  assert.equal(currentUser.body.user.name, 'Aluno');

  const logout = await request('POST', '/api/auth/logout', {}, true);
  assert.equal(logout.response.status, 200);
  sessionCookie = null;
  const anonymous = await request('GET', '/api/auth/me');
  assert.equal(anonymous.response.status, 401);
});

test('registered user can create, edit, and delete an owned project', async () => {
  const registration = await request('POST', '/api/auth/register', {
    name: 'Pessoa Teste',
    email: 'teste@example.com',
    password: 'senha-segura-123',
  });
  assert.equal(registration.response.status, 201);
  sessionCookie = registration.response.headers.get('set-cookie').split(';')[0];

  const projectData = {
    title: 'Projeto de Teste',
    turma: '3º Ano A',
    category: 'web',
    techs: ['JavaScript'],
    desc: 'Projeto usado para validar as operações da API.',
    repo_url: 'https://github.com/teste/projeto.git',
    codeSnippet: "console.log('ok')",
  };
  const created = await request('POST', '/api/projects', projectData, true);
  assert.equal(created.response.status, 201);
  const projectId = created.body.project.id;
  assert.equal(created.body.project.author, 'Pessoa Teste');

  const updated = await request('PATCH', `/api/projects/${projectId}`, { title: 'Projeto Atualizado' }, true);
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.project.title, 'Projeto Atualizado');

  const deleted = await request('DELETE', `/api/projects/${projectId}`, undefined, true);
  assert.equal(deleted.response.status, 200);
  const missing = await request('GET', `/api/projects/${projectId}`);
  assert.equal(missing.response.status, 404);
  sessionCookie = null;
});

test('project writes require a valid session and ownership', async () => {
  const unauthorized = await request('POST', '/api/projects', {});
  assert.equal(unauthorized.response.status, 401);

  const login = await request('POST', '/api/auth/login', {
    identifier: 'aluno@escola.edu.br',
    password: 'aluno123',
  });
  sessionCookie = login.response.headers.get('set-cookie').split(';')[0];
  const forbidden = await request('DELETE', '/api/projects/ecosmart', undefined, true);
  assert.equal(forbidden.response.status, 403);
  sessionCookie = null;
});

test('static site is served without exposing server source or database', async () => {
  const homepage = await request('GET', '/');
  assert.equal(homepage.response.status, 200);
  assert.match(homepage.response.headers.get('content-type'), /text\/html/);

  const serverSource = await request('GET', '/server.js');
  assert.equal(serverSource.response.status, 404);
  const traversal = await request('GET', '/..%2Fserver.js');
  assert.equal(traversal.response.status, 404);
});
