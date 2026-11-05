// CONFIGURAÇÃO DO TAILWIND CSS
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['"Plus Jakarta Sans"', 'sans-serif'],
          mono: ['"JetBrains Mono"', 'monospace'],
        },
        colors: {
          navy: {
            DEFAULT: '#1A2332',
            light: '#2A3544',
            muted: '#5A6A7A',
            dark: '#0F1622',
            soft: '#3B4858'
          }
        }
      }
    }
  };
}

const PERSISTENCE_MODE = 'localStorage';
const PROJECTS_STORAGE_KEY = 'gs_projects';
const projectsData = new Map();
const demoProjects = [
  {
    id: 'ecosmart', title: 'EcoSmart Dashboard', author: 'Gabriel Silva', turma: '3º Ano A',
    category: 'web', techs: ['HTML5', 'Tailwind CSS', 'Chart.js'],
    desc: 'Painel interativo para monitoramento de consumo de energia solar e reciclagem no colégio em tempo real com alertas visuais e gráficos dinâmicos.',
    repo_url: 'https://github.com/escola/ecosmart-dashboard.git',
    codeSnippet: 'const energyData = { solarKW: 45.8, wasteRecycledKg: 120 };\nfunction renderDashboard() {\n  console.log("Status da Energia Solar:", energyData.solarKW + " kW/h");\n  // Renderizando gráficos interativos...\n}\nrenderDashboard();',
  },
  {
    id: 'robotica', title: 'Braço Robótico ESP32', author: 'Mariana Costa', turma: '2º Ano B',
    category: 'robotica', techs: ['C++ / Arduino', 'ESP32', 'Impressão 3D'],
    desc: 'Braço mecânico impresso em 3D no laboratório do colégio e controlado remotamente via aplicativo Web local através de conexão Wi-Fi.',
    repo_url: 'https://github.com/escola/braco-robotico-esp32.git',
    codeSnippet: '#include <ESP32Servo.h>\nServo baseServo;\nvoid setup() {\n  baseServo.attach(13);\n  Serial.println("Servomotores inicializados via WiFi.");\n}',
  },
  {
    id: 'ia', title: 'Previsor de Desempenho', author: 'Lucas Andrade', turma: '3º Ano B',
    category: 'ia', techs: ['Python 3', 'Scikit-Learn', 'Pandas'],
    desc: 'Algoritmo desenvolvido em Python que prevê necessidades de reforço escolar com base na evolução do histórico de simulados dos alunos.',
    repo_url: 'https://github.com/escola/previsor-desempenho-ia.git',
    codeSnippet: 'from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\nprint("Precisão do modelo na turma:", model.score(X_test, y_test))',
  },
  {
    id: 'games', title: 'Retro Quest Escolar', author: 'Sofia & Pedro', turma: '1º Ano A',
    category: 'games', techs: ['JavaScript', 'HTML5 Canvas', 'Web Audio'],
    desc: 'Jogo estilo aventura em pixel art 2D onde o jogador avança resolvendo enigmas de lógica, matemática e conceitos básicos de algoritmos.',
    repo_url: 'https://github.com/escola/retro-quest-escolar.git',
    codeSnippet: 'function gameLoop() {\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n  player.update();\n  player.draw();\n  requestAnimationFrame(gameLoop);\n}\ngameLoop();',
  },
  {
    id: 'biblioteca', title: 'Biblioteca Digital', author: 'Beatriz Ramos', turma: '3º Ano A',
    category: 'web', techs: ['Node.js', 'SQLite', 'Express'],
    desc: 'Gerenciador web completo para empréstimo e reserva de livros físicos do colégio com leitura de código de barras pela câmera do computador.',
    repo_url: 'https://github.com/escola/biblioteca-digital.git',
    codeSnippet: "app.get('/api/livros', async (req, res) => {\n  const livros = await db.all('SELECT * FROM acervo WHERE disponivel = 1');\n  res.json(livros);\n});",
  },
  {
    id: 'horta', title: 'Estação Horta IoT', author: 'Enzo Martins', turma: '2º Ano A',
    category: 'robotica', techs: ['MicroPython', 'NodeMCU', 'MQTT'],
    desc: 'Estação automatizada de irrigação inteligente com sensores de umidade do solo e atuadores conectados à horta comunitária da escola.',
    repo_url: 'https://github.com/escola/horta-inteligente-iot.git',
    codeSnippet: 'import machine, time\nsensor = machine.ADC(0)\nwhile True:\n  if sensor.read() < 400:\n    print("Solo seco! Ativando válvula de água.")\n  time.sleep(10)',
  },
];
const categoryStyles = {
  web: { label: 'Web', gradient: 'from-sky-900 to-navy-dark', accent: 'bg-sky-300', text: 'text-sky-200' },
  robotica: { label: 'Robótica / IoT', gradient: 'from-slate-800 to-navy-dark', accent: 'bg-emerald-300', text: 'text-emerald-200' },
  ia: { label: 'IA & Python', gradient: 'from-indigo-900 to-navy-light', accent: 'bg-sky-400', text: 'text-indigo-200' },
  games: { label: 'Games', gradient: 'from-purple-900 to-navy', accent: 'bg-purple-300', text: 'text-purple-200' },
};

let currentActiveCategory = 'all';

// INICIALIZAÇÃO ÚNICA AO CARREGAR A PÁGINA
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  setupSearch();
  checkSavedAccess();
  loadProjects();
  updateAuthUI();
});

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Não foi possível concluir a solicitação.');
  }
  return result;
}

async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  try {
    const projects = PERSISTENCE_MODE === 'localStorage'
      ? loadLocalProjects()
      : (await apiRequest('/api/projects')).projects;
    projectsData.clear();
    const existingProjectIds = new Set();
    grid.querySelectorAll('.project-card').forEach((card) => {
      if (card.dataset.projectId) {
        existingProjectIds.add(card.dataset.projectId);
        return;
      }
      const demoButton = card.querySelector('[onclick*="openDemoModal"]');
      const projectId = demoButton?.getAttribute('onclick')?.match(/openDemoModal\('([^']+)'\)/)?.[1];
      if (projectId) {
        card.dataset.projectId = projectId;
        card.dataset.category = projects.find((project) => project.id === projectId)?.category || card.dataset.category;
        existingProjectIds.add(projectId);
      }
    });
    projects.forEach((project) => {
      projectsData.set(project.id, project);
      if (!existingProjectIds.has(project.id)) {
        grid.appendChild(createProjectCard(project));
      }
    });
    filterProjects(currentActiveCategory);
    if (window.lucide) lucide.createIcons();
  } catch (error) {
    showToast(`Não foi possível carregar os projetos: ${error.message}`, 'error');
  }
}

function loadLocalProjects() {
  const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (storedProjects === null) {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(demoProjects));
    return demoProjects;
  }

  const projects = JSON.parse(storedProjects);
  if (!Array.isArray(projects)) {
    throw new Error('Os projetos salvos neste navegador estão em formato inválido.');
  }
  const savedIds = new Set(projects.map((project) => project.id));
  const completeProjects = [...projects, ...demoProjects.filter((project) => !savedIds.has(project.id))];
  if (completeProjects.length !== projects.length) {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(completeProjects));
  }
  return completeProjects;
}

function createProjectCard(project) {
  const style = categoryStyles[project.category] || categoryStyles.web;
  const card = document.createElement('article');
  card.className = 'project-card glass-card glass-card-hover rounded-3xl p-5 flex flex-col justify-between';
  card.dataset.category = project.category;
  card.dataset.projectId = project.id;

  const details = document.createElement('div');
  const banner = document.createElement('div');
  banner.className = `relative h-44 rounded-2xl bg-gradient-to-br ${style.gradient} p-4 text-white flex flex-col justify-between overflow-hidden shadow-inner mb-4`;
  const badges = document.createElement('div');
  badges.className = 'flex justify-between items-start gap-2';
  const categoryBadge = document.createElement('span');
  categoryBadge.className = `${style.accent} text-navy font-mono text-[10px] font-bold px-2 py-0.5 rounded-full`;
  categoryBadge.textContent = style.label;
  const classBadge = document.createElement('span');
  classBadge.className = 'text-xs font-mono bg-white/20 px-2 py-0.5 rounded';
  classBadge.textContent = project.turma || 'Turma não informada';
  badges.append(categoryBadge, classBadge);

  const heading = document.createElement('div');
  const title = document.createElement('h4');
  title.className = 'font-mono font-bold text-lg leading-tight';
  title.textContent = project.title;
  const subtitle = document.createElement('span');
  subtitle.className = `text-[11px] font-mono ${style.text}`;
  subtitle.textContent = style.label;
  heading.append(subtitle, title);
  banner.append(badges, heading);

  const description = document.createElement('p');
  description.className = 'text-xs text-navy-muted leading-relaxed mb-4';
  description.textContent = project.desc;
  details.append(banner, description);

  const footer = document.createElement('div');
  const technologies = document.createElement('div');
  technologies.className = 'flex flex-wrap gap-1.5 mb-4';
  project.techs.forEach((technology) => {
    const tag = document.createElement('span');
    tag.className = 'text-[10px] font-mono bg-navy/10 text-navy px-2 py-0.5 rounded-md font-semibold';
    tag.textContent = technology;
    technologies.appendChild(tag);
  });

  const attribution = document.createElement('div');
  attribution.className = 'flex items-center justify-between pt-3 border-t border-navy/10';
  const author = document.createElement('span');
  author.className = 'text-xs font-semibold text-navy';
  author.textContent = project.author;
  const demo = document.createElement('button');
  demo.type = 'button';
  demo.className = 'text-xs font-mono font-bold text-navy hover:underline flex items-center gap-1 cursor-pointer';
  demo.append(document.createTextNode('Ver Demo '));
  const icon = document.createElement('i');
  icon.dataset.lucide = 'external-link';
  icon.className = 'w-3.5 h-3.5';
  demo.appendChild(icon);
  demo.addEventListener('click', () => openDemoModal(project.id));
  attribution.append(author, demo);
  footer.append(technologies, attribution);
  card.append(details, footer);
  return card;
}

// SISTEMA DE FILTRAGEM DOS TRABALHOS
function filterProjects(category) {
  currentActiveCategory = category;
  const cards = document.querySelectorAll('.project-card');
  const buttons = document.querySelectorAll('.project-filter-btn');
  const emptyState = document.getElementById('empty-state');
  let visibleCount = 0;

  buttons.forEach(btn => {
    const btnCategory = btn.getAttribute('data-category');
    if (btnCategory === category) {
      btn.className = 'project-filter-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all bg-navy text-white shadow-sm cursor-pointer';
    } else {
      btn.className = 'project-filter-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-navy-muted hover:text-navy hover:bg-white/50 transition-all cursor-pointer';
    }
  });

  cards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    const matchesCategory = category === 'all' || cardCategory === category;

    if (matchesCategory) {
      card.classList.remove('hidden');
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.classList.add('hidden');
      card.style.display = 'none';
    }
  });

  if (emptyState) {
    if (visibleCount === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
    }
  }
}

// PESQUISA EM TEMPO REAL
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (clearSearchBtn) {
      clearSearchBtn.classList.toggle('hidden', query === '');
    }

    const cards = document.querySelectorAll('.project-card');
    const emptyState = document.getElementById('empty-state');
    let visibleCount = 0;

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const cardCategory = card.getAttribute('data-category');

      const matchesQuery = query === '' || text.includes(query);
      const matchesCategory = currentActiveCategory === 'all' || cardCategory === currentActiveCategory;

      if (matchesQuery && matchesCategory) {
        card.classList.remove('hidden');
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.classList.add('hidden');
        card.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('hidden', visibleCount > 0);
    }
  });

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      filterProjects(currentActiveCategory);
    });
  }
}

// MODAL DE DEMONSTRAÇÃO DE PROJETOS
async function openDemoModal(projectId) {
  let data = projectsData.get(projectId);
  if (!data) {
    try {
      ({ project: data } = await apiRequest(`/api/projects/${encodeURIComponent(projectId)}`));
    } catch (error) {
      showToast(`Não foi possível carregar o projeto: ${error.message}`, 'error');
      return;
    }
  }

  const demoTitle = document.getElementById('demoTitle');
  const demoDesc = document.getElementById('demoDesc') || document.getElementById('demoDescription');
  const demoAuthor = document.getElementById('demoAuthor');
  const demoTurma = document.getElementById('demoTurma') || document.getElementById('demoClass');
  const demoTechs = document.getElementById('demoTechs');
  const demoBadge = document.getElementById('demoBadge') || document.getElementById('demoCategory');
  const demoRepoCmd = document.getElementById('demoRepoCmd');
  const demoCodeSnippet = document.getElementById('demoCodeSnippet');

  if (demoTitle) demoTitle.textContent = data.title;
  if (demoDesc) demoDesc.textContent = data.desc;
  if (demoAuthor) demoAuthor.textContent = data.author.startsWith('Por:') ? data.author : `Por: ${data.author}`;
  if (demoTurma) demoTurma.textContent = data.turma;
  if (demoTechs) demoTechs.textContent = Array.isArray(data.techs) ? data.techs.join(', ') : data.techs;
  if (demoBadge) demoBadge.textContent = categoryStyles[data.category]?.label || data.category;
  if (demoRepoCmd) demoRepoCmd.textContent = data.repoCmd;
  if (demoCodeSnippet) demoCodeSnippet.textContent = data.codeSnippet;

  const modal = document.getElementById('demoModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeDemoModal() {
  const modal = document.getElementById('demoModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function copyModalRepoCmd() {
  const cmdEl = document.getElementById('demoRepoCmd');
  if (cmdEl) {
    copyToClipboard(cmdEl.textContent);
  }
}

// MODAL DE LOGIN
function openLoginModal() {
  // Se existir modal na página, abre; senão redireciona para login.html
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    return;
  }
  window.location.href = 'login.html';
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// MODAL DE ESQUECEU A SENHA
function openForgotModal() {
  closeLoginModal();
  const modal = document.getElementById('forgotModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeForgotModal() {
  const modal = document.getElementById('forgotModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// PREENCHIMENTO RÁPIDO DE CREDENCIAIS DE TESTE
function fillTestAccount(studentId, password, labelName = 'Conta de Teste') {
  const idInput = document.getElementById('studentId') || document.getElementById('id_login');
  const passInput = document.getElementById('password') || document.getElementById('id_password');
  if (idInput) idInput.value = studentId;
  if (passInput) passInput.value = password;
  showToast(`Preenchido: ${labelName}`, 'info');
}

function fillTestCredentials() {
  fillTestAccount('aluno@escola.edu.br', 'aluno123', 'Dados de Teste');
}

// MOSTRAR / OCULTAR SENHA
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password') || document.getElementById('id_password');
  const eyeIcon = document.getElementById('eyeIcon');
  if (!passwordInput) return;

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    if (eyeIcon) eyeIcon.setAttribute('data-lucide', 'eye-off');
  } else {
    passwordInput.type = 'password';
    if (eyeIcon) eyeIcon.setAttribute('data-lucide', 'eye');
  }
  if (window.lucide) {
    lucide.createIcons();
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const studentIdEl = document.getElementById('studentId') || document.getElementById('id_login');
  const passwordEl = document.getElementById('password') || document.getElementById('id_password');
  const rememberMeEl = document.getElementById('rememberMe');

  const studentId = studentIdEl ? studentIdEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value : '';
  const rememberMe = rememberMeEl ? rememberMeEl.checked : false;

  if (!studentId || !password) {
    showToast('Por favor, preencha todos os campos.', 'error');
    return;
  }

  setLoadingState(true);
  try {
    let user;
    if (PERSISTENCE_MODE === 'localStorage') {
      if (password.length < 3) {
        throw new Error('A senha deve ter pelo menos 3 caracteres para o teste.');
      }
      const displayName = studentId.includes('@') ? studentId.split('@')[0] : studentId;
      user = {
        id: studentId,
        name: displayName,
        email: studentId.includes('@') ? studentId : `${studentId}@escola.edu.br`,
        loggedAt: new Date().toISOString(),
      };
      localStorage.setItem('gs_user', JSON.stringify(user));
    } else {
      ({ user } = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: studentId, password, remember: rememberMe }),
      }));
    }

    if (rememberMe) {
      localStorage.setItem('saved_student_id', studentId);
    } else {
      localStorage.removeItem('saved_student_id');
    }

    showToast(`Bem-vindo(a), ${user.name}!`, 'success');
    const welcomeCard = document.getElementById('welcomeCard');
    const loginCard = document.getElementById('loginCard');

    if (welcomeCard && loginCard) {
      const welcomeId = document.getElementById('welcomeId');
      const welcomeName = document.getElementById('welcomeName');
      const sessionDate = document.getElementById('sessionDate');
      if (welcomeId) welcomeId.textContent = user.studentId || user.email;
      if (welcomeName) welcomeName.textContent = `Bem-vindo(a), ${user.name}!`;
      if (sessionDate) {
        const now = new Date();
        sessionDate.textContent = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      }
      loginCard.classList.add('hidden');
      welcomeCard.classList.remove('hidden');
      updateAuthUI(user);
    } else {
      window.location.href = 'home.html';
    }
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setLoadingState(false);
  }
}

// LOGOUT
async function handleLogout() {
  if (PERSISTENCE_MODE === 'localStorage') {
    localStorage.removeItem('gs_user');
  } else {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST', body: '{}' });
    } catch (error) {
      showToast(`Não foi possível encerrar a sessão: ${error.message}`, 'error');
      return;
    }
  }

  const welcomeCard = document.getElementById('welcomeCard');
  const loginCard = document.getElementById('loginCard');
  const passwordEl = document.getElementById('password') || document.getElementById('id_password');

  if (welcomeCard) welcomeCard.classList.add('hidden');
  if (loginCard) loginCard.classList.remove('hidden');
  if (passwordEl) passwordEl.value = '';

  updateAuthUI(null);
  showToast('Sessão encerrada com segurança.', 'info');

  // Se estiver na home, volta para a landing
  if (window.location.pathname.includes('home.html')) {
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  }
}

async function updateAuthUI(knownUser) {
  let user = knownUser;
  if (arguments.length === 0) {
    if (PERSISTENCE_MODE === 'localStorage') {
      const savedUser = localStorage.getItem('gs_user');
      user = savedUser ? JSON.parse(savedUser) : null;
    } else {
      try {
        ({ user } = await apiRequest('/api/auth/me'));
      } catch (error) {
        if (error.message !== 'Sessão não encontrada.') {
          showToast(`Não foi possível verificar a sessão: ${error.message}`, 'error');
        }
        user = null;
      }
    }
  }

  // Elementos da home
  const userNameEl = document.getElementById('userDisplayName');
  const userEmailEl = document.getElementById('userDisplayEmail');

  if (userNameEl) {
    userNameEl.textContent = user ? user.name : 'Visitante';
  }
  if (userEmailEl) {
    userEmailEl.textContent = user ? user.email : 'Não autenticado';
  }

  // Botões de login/logout genéricos
  document.querySelectorAll('[data-auth="logged"]').forEach(el => {
    el.classList.toggle('hidden', !user);
  });
  document.querySelectorAll('[data-auth="guest"]').forEach(el => {
    el.classList.toggle('hidden', !!user);
  });
}

// CARREGAR USUÁRIO SALVO (preenche campo)
function checkSavedAccess() {
  const savedId = localStorage.getItem('saved_student_id');
  const studentIdEl = document.getElementById('studentId') || document.getElementById('id_login');
  const rememberMeEl = document.getElementById('rememberMe');

  if (savedId && studentIdEl) {
    studentIdEl.value = savedId;
    if (rememberMeEl) rememberMeEl.checked = true;
  }
}

// CONTROLE DO BOTÃO DE SUBMIT (SPINNER)
function setLoadingState(isLoading) {
  const btn = document.getElementById('submitBtn');
  const text = document.getElementById('btnText');
  const spinner = document.getElementById('btnSpinner');

  if (!btn) return;

  if (isLoading) {
    btn.disabled = true;
    btn.classList.add('opacity-80', 'cursor-wait');
    if (text) text.classList.add('hidden');
    if (spinner) spinner.classList.remove('hidden');
  } else {
    btn.disabled = false;
    btn.classList.remove('opacity-80', 'cursor-wait');
    if (text) text.classList.remove('hidden');
    if (spinner) spinner.classList.add('hidden');
  }
}

// AUXILIAR DE COPIAR TEXTO
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copiado: "${text}"`, 'success');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const tempInput = document.createElement('textarea');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast(`Copiado: "${text}"`, 'success');
}

// SISTEMA DE NOTIFICAÇÕES TOAST
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');

  let bgColors = 'bg-navy text-white border-navy-light';
  let icon = 'info';

  if (type === 'success') {
    bgColors = 'bg-emerald-900/90 text-emerald-100 border-emerald-500/40 backdrop-blur-md';
    icon = 'check-circle';
  } else if (type === 'error') {
    bgColors = 'bg-rose-900/90 text-rose-100 border-rose-500/40 backdrop-blur-md';
    icon = 'alert-circle';
  } else if (type === 'info') {
    bgColors = 'bg-navy/90 text-white border-white/20 backdrop-blur-md';
    icon = 'sparkles';
  }

  toast.className = `p-3.5 rounded-2xl border shadow-xl flex items-center gap-3 text-xs font-semibold tracking-wide pointer-events-auto transition-all transform translate-y-2 opacity-0 animate-fade-in ${bgColors}`;
  const toastIcon = document.createElement('i');
  toastIcon.dataset.lucide = icon;
  toastIcon.className = 'w-4 h-4 shrink-0';
  const toastMessage = document.createElement('span');
  toastMessage.className = 'flex-1';
  toastMessage.textContent = message;
  toast.append(toastIcon, toastMessage);

  container.appendChild(toast);
  if (window.lucide) {
    lucide.createIcons();
  }

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-8px]');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
