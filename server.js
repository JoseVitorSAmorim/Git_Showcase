const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { promisify } = require('node:util');
const { DatabaseSync } = require('node:sqlite');

const scrypt = promisify(crypto.scrypt);
const ROOT = __dirname;
const COOKIE_NAME = 'gs_session';
const MAX_BODY_BYTES = 64 * 1024;
const CATEGORIES = new Set(['web', 'robotica', 'ia', 'games']);
const SESSION_TTL = 7 * 24 * 60 * 60;

const seedProjects = [
  {
    id: 'ecosmart',
    title: 'EcoSmart Dashboard',
    author: 'Gabriel Silva',
    turma: '3º Ano A',
    category: 'web',
    techs: ['HTML5', 'Tailwind CSS', 'Chart.js'],
    desc: 'Painel interativo para monitoramento de consumo de energia solar e reciclagem no colégio em tempo real com alertas visuais e gráficos dinâmicos.',
    repo_url: 'https://github.com/escola/ecosmart-dashboard.git',
    codeSnippet: 'const energyData = { solarKW: 45.8, wasteRecycledKg: 120 };\nfunction renderDashboard() {\n  console.log("Status da Energia Solar:", energyData.solarKW + " kW/h");\n  // Renderizando gráficos interativos...\n}\nrenderDashboard();',
  },
  {
    id: 'robotica',
    title: 'Braço Robótico ESP32',
    author: 'Mariana Costa',
    turma: '2º Ano B',
    category: 'robotica',
    techs: ['C++ / Arduino', 'ESP32', 'Impressão 3D'],
    desc: 'Braço mecânico impresso em 3D no laboratório do colégio e controlado remotamente via aplicativo Web local através de conexão Wi-Fi.',
    repo_url: 'https://github.com/escola/braco-robotico-esp32.git',
    codeSnippet: '#include <ESP32Servo.h>\nServo baseServo;\nvoid setup() {\n  baseServo.attach(13);\n  Serial.println("Servomotores inicializados via WiFi.");\n}',
  },
  {
    id: 'ia',
    title: 'Previsor de Desempenho',
    author: 'Lucas Andrade',
    turma: '3º Ano B',
    category: 'ia',
    techs: ['Python 3', 'Scikit-Learn', 'Pandas'],
    desc: 'Algoritmo desenvolvido em Python que prevê necessidades de reforço escolar com base na evolução do histórico de simulados dos alunos.',
    repo_url: 'https://github.com/escola/previsor-desempenho-ia.git',
    codeSnippet: 'from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\nprint("Precisão do modelo na turma:", model.score(X_test, y_test))',
  },
  {
    id: 'games',
    title: 'Retro Quest Escolar',
    author: 'Sofia & Pedro',
    turma: '1º Ano A',
    category: 'games',
    techs: ['JavaScript', 'HTML5 Canvas', 'Web Audio'],
    desc: 'Jogo estilo aventura em pixel art 2D onde o jogador avança resolvendo enigmas de lógica, matemática e conceitos básicos de algoritmos.',
    repo_url: 'https://github.com/escola/retro-quest-escolar.git',
    codeSnippet: 'function gameLoop() {\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n  player.update();\n  player.draw();\n  requestAnimationFrame(gameLoop);\n}\ngameLoop();',
  },
  {
    id: 'biblioteca',
    title: 'Biblioteca Digital',
    author: 'Beatriz Ramos',
    turma: '3º Ano A',
    category: 'web',
    techs: ['Node.js', 'SQLite', 'Express'],
    desc: 'Gerenciador web completo para empréstimo e reserva de livros físicos do colégio com leitura de código de barras pela câmera do computador.',
    repo_url: 'https://github.com/escola/biblioteca-digital.git',
    codeSnippet: "app.get('/api/livros', async (req, res) => {\n  const livros = await db.all('SELECT * FROM acervo WHERE disponivel = 1');\n  res.json(livros);\n});",
  },
  {
    id: 'horta',
    title: 'Estação Horta IoT',
    author: 'Enzo Martins',
    turma: '2º Ano A',
    category: 'robotica',
    techs: ['MicroPython', 'NodeMCU', 'MQTT'],
    desc: 'Estação automatizada de irrigação inteligente com sensores de umidade do solo e atuadores conectados à horta comunitária da escola.',
    repo_url: 'https://github.com/escola/horta-inteligente-iot.git',
    codeSnippet: 'import machine, time\nsensor = machine.ADC(0)\nwhile True:\n  if sensor.read() < 400:\n    print("Solo seco! Ativando válvula de água.")\n  time.sleep(10)',
  },
];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function initializeDatabase(databasePath) {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new DatabaseSync(databasePath);
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      student_id TEXT UNIQUE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      turma TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      techs TEXT NOT NULL,
      description TEXT NOT NULL,
      repo_url TEXT NOT NULL,
      code_snippet TEXT NOT NULL DEFAULT '',
      owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
    CREATE INDEX IF NOT EXISTS idx_sessions_expiration ON sessions(expires_at);
  `);

  const insertProject = db.prepare(`
    INSERT OR IGNORE INTO projects
      (id, title, author, turma, category, techs, description, repo_url, code_snippet, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const project of seedProjects) {
    insertProject.run(
      project.id,
      project.title,
      project.author,
      project.turma,
      project.category,
      JSON.stringify(project.techs),
      project.desc,
      project.repo_url,
      project.codeSnippet,
      Date.now(),
    );
  }

  const demoUser = db.prepare('SELECT id FROM users WHERE email = ?').get('aluno@escola.edu.br');
  if (!demoUser) {
    const salt = crypto.randomBytes(16);
    const passwordHash = crypto.scryptSync('aluno123', salt, 64);
    db.prepare(`
      INSERT INTO users (name, email, student_id, password_salt, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'Aluno',
      'aluno@escola.edu.br',
      '20261042',
      salt.toString('hex'),
      passwordHash.toString('hex'),
      Date.now(),
    );
  }

  return db;
}

function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    studentId: user.student_id,
  };
}

function serializeProject(project) {
  return {
    id: project.id,
    title: project.title,
    author: project.author,
    turma: project.turma,
    category: project.category,
    techs: JSON.parse(project.techs),
    desc: project.description,
    repo_url: project.repo_url,
    repoCmd: `git clone ${project.repo_url}`,
    codeSnippet: project.code_snippet,
  };
}

function sendJson(response, status, value, headers = {}) {
  const body = Buffer.from(JSON.stringify(value));
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': body.length,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  response.end(body);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    const contentType = request.headers['content-type'] || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      reject(new HttpError(415, 'O conteúdo deve ser enviado como JSON.'));
      request.resume();
      return;
    }

    const length = Number(request.headers['content-length'] || 0);
    if (length > MAX_BODY_BYTES) {
      reject(new HttpError(413, 'Corpo da requisição muito grande.'));
      request.resume();
      return;
    }

    const chunks = [];
    let size = 0;
    request.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'Corpo da requisição muito grande.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => {
      try {
        const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!value || Array.isArray(value) || typeof value !== 'object') {
          throw new HttpError(400, 'O corpo JSON deve ser um objeto.');
        }
        resolve(value);
      } catch (error) {
        reject(error instanceof HttpError ? error : new HttpError(400, 'JSON inválido.'));
      }
    });
    request.on('error', reject);
  });
}

function getSessionToken(request) {
  const cookie = request.headers.cookie || '';
  const match = cookie.match(/(?:^|;\s*)gs_session=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getCurrentUser(db, request) {
  const token = getSessionToken(request);
  if (!token) return null;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return db.prepare(`
    SELECT users.* FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).get(tokenHash, Date.now());
}

function requireUser(db, request) {
  const user = getCurrentUser(db, request);
  if (!user) throw new HttpError(401, 'Faça login para continuar.');
  return user;
}

function textField(value, min, max) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length >= min && normalized.length <= max ? normalized : null;
}

function validateProject(payload, existing = null) {
  const definitions = {
    title: ['title', 3, 120],
    turma: ['turma', 0, 80],
    category: ['category', 1, 20],
    description: ['desc', 10, 2000],
    repo_url: ['repo_url', 1, 500],
    code_snippet: ['codeSnippet', 0, 10000],
  };
  const fields = {};
  for (const [column, [key, min, max]] of Object.entries(definitions)) {
    const value = Object.hasOwn(payload, key)
      ? payload[key]
      : existing
        ? existing[column]
        : '';
    if (typeof value !== 'string') throw new HttpError(400, `Campo inválido: ${key}.`);
    const normalized = value.trim();
    if (normalized.length < min || normalized.length > max) {
      throw new HttpError(400, `Campo ${key} deve ter entre ${min} e ${max} caracteres.`);
    }
    fields[column] = normalized;
  }
  if (!CATEGORIES.has(fields.category)) throw new HttpError(400, 'Categoria inválida.');
  if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(?:\.git)?\/?$/.test(fields.repo_url)) {
    throw new HttpError(400, 'Informe uma URL válida de repositório GitHub.');
  }

  const techs = Object.hasOwn(payload, 'techs')
    ? payload.techs
    : existing
      ? JSON.parse(existing.techs)
      : null;
  if (
    !Array.isArray(techs)
    || techs.length < 1
    || techs.length > 12
    || techs.some((item) => typeof item !== 'string' || !item.trim() || item.length > 40)
  ) {
    throw new HttpError(400, 'Informe de 1 a 12 tecnologias válidas.');
  }
  fields.techs = JSON.stringify(techs.map((item) => item.trim()));
  return fields;
}

function createSession(db, user, remember) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const ttl = remember ? SESSION_TTL : 12 * 60 * 60;
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .run(tokenHash, user.id, Date.now() + ttl * 1000);
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
  const cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    ...(remember ? [`Max-Age=${ttl}`] : []),
    ...(process.env.GIT_SHOWCASE_SECURE_COOKIE === '1' ? ['Secure'] : []),
  ].join('; ');
  return { 'Set-Cookie': cookie };
}

async function handleApi(request, response, db, url) {
  const { pathname, searchParams } = url;
  const method = request.method;

  if (method === 'GET' && pathname === '/api/health') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (method === 'GET' && pathname === '/api/auth/me') {
    const user = getCurrentUser(db, request);
    if (!user) throw new HttpError(401, 'Sessão não encontrada.');
    sendJson(response, 200, { user: serializeUser(user) });
    return;
  }

  if (method === 'GET' && pathname === '/api/projects') {
    const category = (searchParams.get('category') || '').trim().toLowerCase();
    const search = (searchParams.get('q') || '').trim().slice(0, 100);
    if (category && category !== 'all' && !CATEGORIES.has(category)) {
      throw new HttpError(400, 'Categoria inválida.');
    }
    let sql = 'SELECT * FROM projects WHERE 1 = 1';
    const params = [];
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      const escaped = search.replace(/[\\%_]/g, '\\$&');
      sql += ` AND (
        title LIKE ? ESCAPE '\\' OR author LIKE ? ESCAPE '\\'
        OR description LIKE ? ESCAPE '\\' OR techs LIKE ? ESCAPE '\\'
      )`;
      params.push(...Array(4).fill(`%${escaped}%`));
    }
    sql += ' ORDER BY created_at DESC, title COLLATE NOCASE';
    const projects = db.prepare(sql).all(...params).map(serializeProject);
    sendJson(response, 200, { projects });
    return;
  }

  const projectMatch = pathname.match(/^\/api\/projects\/([a-zA-Z0-9_-]{1,80})$/);
  if (method === 'GET' && projectMatch) {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectMatch[1]);
    if (!project) throw new HttpError(404, 'Projeto não encontrado.');
    sendJson(response, 200, { project: serializeProject(project) });
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/register') {
    const payload = await readJson(request);
    const name = textField(payload.name, 2, 80);
    const email = textField(payload.email, 3, 254)?.toLowerCase();
    const password = payload.password;
    if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new HttpError(400, 'Informe nome e e-mail válidos.');
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 256) {
      throw new HttpError(400, 'A senha deve ter entre 8 e 256 caracteres.');
    }
    const salt = crypto.randomBytes(16);
    const passwordHash = await scrypt(password, salt, 64);
    let user;
    try {
      const result = db.prepare(`
        INSERT INTO users (name, email, password_salt, password_hash, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(name, email, salt.toString('hex'), passwordHash.toString('hex'), Date.now());
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(result.lastInsertRowid));
    } catch (error) {
      if (error.code === 'ERR_SQLITE_ERROR' && /UNIQUE/.test(error.message)) {
        throw new HttpError(409, 'Este e-mail já está cadastrado.');
      }
      throw error;
    }
    sendJson(response, 201, { user: serializeUser(user) }, createSession(db, user, false));
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/login') {
    const payload = await readJson(request);
    const identifier = textField(payload.identifier, 1, 254);
    const password = payload.password;
    if (!identifier || typeof password !== 'string' || !password || password.length > 256) {
      throw new HttpError(400, 'Informe seu usuário e senha.');
    }
    const user = db.prepare(`
      SELECT * FROM users WHERE email = ? COLLATE NOCASE OR student_id = ? COLLATE NOCASE
    `).get(identifier, identifier);
    let valid = false;
    if (user) {
      const actual = await scrypt(password, Buffer.from(user.password_salt, 'hex'), 64);
      valid = crypto.timingSafeEqual(actual, Buffer.from(user.password_hash, 'hex'));
    }
    if (!valid) throw new HttpError(401, 'Usuário ou senha incorretos.');
    const headers = createSession(db, user, payload.remember === true);
    sendJson(response, 200, { user: serializeUser(user) }, headers);
    return;
  }

  if (method === 'POST' && pathname === '/api/auth/logout') {
    const token = getSessionToken(request);
    if (token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    }
    sendJson(response, 200, { message: 'Sessão encerrada.' }, {
      'Set-Cookie': `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    });
    return;
  }

  if (method === 'POST' && pathname === '/api/projects') {
    const user = requireUser(db, request);
    const fields = validateProject(await readJson(request));
    const baseId = fields.title.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    let projectId = baseId || crypto.randomBytes(8).toString('hex');
    if (db.prepare('SELECT 1 FROM projects WHERE id = ?').get(projectId)) {
      projectId = `${projectId}-${crypto.randomBytes(4).toString('hex')}`;
    }
    db.prepare(`
      INSERT INTO projects
        (id, title, author, turma, category, techs, description, repo_url, code_snippet, owner_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projectId, fields.title, user.name, fields.turma, fields.category, fields.techs,
      fields.description, fields.repo_url, fields.code_snippet, user.id, Date.now(),
    );
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    sendJson(response, 201, { project: serializeProject(project) });
    return;
  }

  if (projectMatch && (method === 'PATCH' || method === 'PUT')) {
    const user = requireUser(db, request);
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectMatch[1]);
    if (!existing) throw new HttpError(404, 'Projeto não encontrado.');
    if (existing.owner_id !== user.id) throw new HttpError(403, 'Você só pode editar seus próprios projetos.');
    const fields = validateProject(await readJson(request), existing);
    db.prepare(`
      UPDATE projects SET title = ?, turma = ?, category = ?, techs = ?, description = ?,
        repo_url = ?, code_snippet = ? WHERE id = ?
    `).run(
      fields.title, fields.turma, fields.category, fields.techs, fields.description,
      fields.repo_url, fields.code_snippet, projectMatch[1],
    );
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectMatch[1]);
    sendJson(response, 200, { project: serializeProject(project) });
    return;
  }

  if (method === 'DELETE' && projectMatch) {
    const user = requireUser(db, request);
    const project = db.prepare('SELECT owner_id FROM projects WHERE id = ?').get(projectMatch[1]);
    if (!project) throw new HttpError(404, 'Projeto não encontrado.');
    if (project.owner_id !== user.id) throw new HttpError(403, 'Você só pode remover seus próprios projetos.');
    db.prepare('DELETE FROM projects WHERE id = ?').run(projectMatch[1]);
    sendJson(response, 200, { message: 'Projeto removido.' });
    return;
  }

  throw new HttpError(404, 'Rota não encontrada.');
}

const staticTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.ico', 'image/x-icon'],
]);
const publicFiles = new Set([
  'index.html',
  'landing.html',
  'home.html',
  'login.html',
  'css/styles.css',
  'js/script.js',
]);

function serveStatic(request, response, pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    throw new HttpError(400, 'Caminho inválido.');
  }
  const relativePath = decodedPath.replace(/^\/+/, '') || 'index.html';
  if (!publicFiles.has(relativePath)) throw new HttpError(404, 'Arquivo não encontrado.');
  const target = path.resolve(ROOT, relativePath);
  if (!target.startsWith(`${ROOT}${path.sep}`) && target !== ROOT) {
    throw new HttpError(404, 'Arquivo não encontrado.');
  }
  const filePath = path.extname(target) ? target : path.join(target, 'index.html');
  const contentType = staticTypes.get(path.extname(filePath).toLowerCase());
  if (!contentType) throw new HttpError(404, 'Arquivo não encontrado.');
  let body;
  try {
    body = fs.readFileSync(filePath);
  } catch {
    throw new HttpError(404, 'Arquivo não encontrado.');
  }
  response.writeHead(200, {
    'Content-Type': contentType,
    'Content-Length': body.length,
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(request.method === 'HEAD' ? undefined : body);
}

function createAppServer(databasePath = process.env.GIT_SHOWCASE_DB
  || path.join(require('node:os').homedir(), '.git-showcase', 'showcase.sqlite3')) {
  const db = initializeDatabase(databasePath);
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (url.pathname.startsWith('/api/')) {
        await handleApi(request, response, db, url);
      } else if (request.method === 'GET' || request.method === 'HEAD') {
        serveStatic(request, response, url.pathname);
      } else {
        throw new HttpError(405, 'Método não permitido.');
      }
    } catch (error) {
      if (response.headersSent || response.destroyed) {
        response.destroy();
        return;
      }
      if (error instanceof HttpError) {
        sendJson(response, error.status, { error: error.message });
        return;
      }
      console.error(error);
      sendJson(response, 500, { error: 'Erro interno do servidor.' });
    }
  });
  server.on('close', () => db.close());
  return server;
}

if (require.main === module) {
  const host = process.env.HOST || '127.0.0.1';
  const port = Number(process.env.PORT || 8000);
  const server = createAppServer();
  server.listen(port, host, () => {
    console.log(`Git Showcase disponível em http://${host}:${port}`);
  });
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = { createAppServer, initializeDatabase };
