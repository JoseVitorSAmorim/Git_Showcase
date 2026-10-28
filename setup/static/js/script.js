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

// DADOS DOS PROJETOS DOS ALUNOS PARA O MODAL DE DEMONSTRAÇÃO
const projectsData = {
  ecosmart: {
    title: 'EcoSmart Dashboard',
    author: 'Gabriel Silva',
    turma: '3º Ano A',
    category: 'Web',
    techs: 'HTML5, Tailwind CSS, Chart.js',
    desc: 'Painel interativo para monitoramento de consumo de energia solar e reciclagem no colégio em tempo real com alertas visuais e gráficos dinâmicos.',
    repoCmd: 'git clone https://github.com/escola/ecosmart-dashboard.git',
    codeSnippet: `const energyData = { solarKW: 45.8, wasteRecycledKg: 120 };\nfunction renderDashboard() {\n  console.log("Status da Energia Solar:", energyData.solarKW + " kW/h");\n  // Renderizando gráficos interativos...\n}\nrenderDashboard();`
  },
  robotica: {
    title: 'Braço Robótico ESP32',
    author: 'Mariana Costa',
    turma: '2º Ano B',
    category: 'Robótica / IoT',
    techs: 'C++ / Arduino, ESP32, Impressão 3D',
    desc: 'Braço mecânico impresso em 3D no laboratório do colégio e controlado remotamente via aplicativo Web local através de conexão Wi-Fi.',
    repoCmd: 'git clone https://github.com/escola/braco-robotico-esp32.git',
    codeSnippet: `#include <ESP32Servo.h>\nServo baseServo;\nvoid setup() {\n  baseServo.attach(13);\n  Serial.println("Servomotores inicializados via WiFi.");\n}`
  },
  ia: {
    title: 'Previsor de Desempenho',
    author: 'Lucas Andrade',
    turma: '3º Ano B',
    category: 'IA & Python',
    techs: 'Python 3, Scikit-Learn, Pandas',
    desc: 'Algoritmo desenvolvido em Python que prevê necessidades de reforço escolar com base na evolução do histórico de simulados dos alunos.',
    repoCmd: 'git clone https://github.com/escola/previsor-desempenho-ia.git',
    codeSnippet: `from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\nprint("Precisão do modelo na turma:", model.score(X_test, y_test))`
  },
  games: {
    title: 'Retro Quest Escolar',
    author: 'Sofia & Pedro',
    turma: '1º Ano A',
    category: 'Games',
    techs: 'JavaScript, HTML5 Canvas, Web Audio',
    desc: 'Jogo estilo aventura em pixel art 2D onde o jogador avança resolvendo enigmas de lógica, matemática e conceitos básicos de algoritmos.',
    repoCmd: 'git clone https://github.com/escola/retro-quest-escolar.git',
    codeSnippet: `function gameLoop() {\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n  player.update();\n  player.draw();\n  requestAnimationFrame(gameLoop);\n}\ngameLoop();`
  },
  biblioteca: {
    title: 'Biblioteca Digital',
    author: 'Beatriz Ramos',
    turma: '3º Ano A',
    category: 'Web',
    techs: 'Node.js, SQLite, Express',
    desc: 'Gerenciador web completo para empréstimo e reserva de livros físicos do colégio com leitura de código de barras pela câmera do computador.',
    repoCmd: 'git clone https://github.com/escola/biblioteca-digital.git',
    codeSnippet: `app.get('/api/livros', async (req, res) => {\n  const livros = await db.all('SELECT * FROM acervo WHERE disponivel = 1');\n  res.json(livros);\n});`
  },
  horta: {
    title: 'Estação Horta IoT',
    author: 'Enzo Martins',
    turma: '2º Ano A',
    category: 'Robótica / IoT',
    techs: 'MicroPython, NodeMCU, MQTT',
    desc: 'Estação automatizada de irrigação inteligente com sensores de umidade do solo e atuadores conectados à horta comunitária da escola.',
    repoCmd: 'git clone https://github.com/escola/horta-inteligente-iot.git',
    codeSnippet: `import machine, time\nsensor = machine.ADC(0)\nwhile True:\n  if sensor.read() < 400:\n    print("Solo seco! Ativando válvula de água.")\n  time.sleep(10)`
  }
};

let currentActiveCategory = 'all';

// INICIALIZAÇÃO ÚNICA AO CARREGAR A PÁGINA
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  setupSearch();
  checkSavedAccess();
});

// SISTEMA DE FILTRAGEM DOS TRABALHOS
function filterProjects(category) {
  currentActiveCategory = category;
  const cards = document.querySelectorAll('.project-card');
  const buttons = document.querySelectorAll('.project-filter-btn');
  const emptyState = document.getElementById('empty-state');
  let visibleCount = 0;

  // Atualiza estilo dos botões
  buttons.forEach(btn => {
    const btnCategory = btn.getAttribute('data-category');
    if (btnCategory === category) {
      btn.className = 'project-filter-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all bg-navy text-white shadow-sm cursor-pointer';
    } else {
      btn.className = 'project-filter-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-navy-muted hover:text-navy hover:bg-white/50 transition-all cursor-pointer';
    }
  });

  // Exibe/Oculta cards
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

  // Estado vazio
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
function openDemoModal(projectId) {
  const data = projectsData[projectId];
  if (!data) return;

  // Suporte a diferentes IDs de elementos nos templates
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
  if (demoTechs) demoTechs.textContent = data.techs;
  if (demoBadge) demoBadge.textContent = data.category;
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
  window.location.href = "/login/";
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// MODAL DE ESQUECEU A SENHA / RECUPERAÇÃO DE ACESSO
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
  const idInput = document.getElementById('studentId');
  const passInput = document.getElementById('password');
  if (idInput) idInput.value = studentId;
  if (passInput) passInput.value = password;
  showToast(`Preenchido: ${labelName}`, 'info');
}

function fillTestCredentials() {
  fillTestAccount('aluno@escola.edu.br', 'aluno123', 'Dados de Teste');
}

// MOSTRAR / OCULTAR SENHA
function togglePasswordVisibility() {
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eyeIcon');
  if (!passwordInput || !eyeIcon) return;

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.setAttribute('data-lucide', 'eye-off');
  } else {
    passwordInput.type = 'password';
    eyeIcon.setAttribute('data-lucide', 'eye');
  }
  if (window.lucide) {
    lucide.createIcons();
  }
}

// MANIPULAR SUBMIT DE LOGIN
function handleLogin(event) {
  event.preventDefault();

  const studentIdEl = document.getElementById('studentId');
  const passwordEl = document.getElementById('password');
  const rememberMeEl = document.getElementById('rememberMe');

  const studentId = studentIdEl ? studentIdEl.value.trim() : '';
  const password = passwordEl ? passwordEl.value.trim() : '';
  const rememberMe = rememberMeEl ? rememberMeEl.checked : false;

  if (!studentId || !password) {
    showToast('Por favor, preencha todos os campos.', 'error');
    return;
  }

  setLoadingState(true);

  setTimeout(() => {
    setLoadingState(false);

    if (rememberMe) {
      localStorage.setItem('saved_student_id', studentId);
    } else {
      localStorage.removeItem('saved_student_id');
    }

    closeLoginModal();

    // Suporte ao padrão 1: Atualizar Header
    const openLoginBtn = document.getElementById('openLoginBtn');
    const loggedUserBadge = document.getElementById('loggedUserBadge');
    const userNameDisplay = document.getElementById('userNameDisplay');

    if (openLoginBtn) openLoginBtn.classList.add('hidden');
    if (loggedUserBadge) {
      loggedUserBadge.classList.remove('hidden');
      loggedUserBadge.classList.add('flex');
    }
    if (userNameDisplay) {
      userNameDisplay.textContent = studentId.includes('@')
        ? studentId.split('@')[0]
        : `Aluno #${studentId}`;
    }

    // Suporte ao padrão 2: Alternar Cards (Login x Boas-Vindas)
    const loginCard = document.getElementById('loginCard');
    const welcomeCard = document.getElementById('welcomeCard');
    const welcomeId = document.getElementById('welcomeId');
    const welcomeName = document.getElementById('welcomeName');
    const sessionDate = document.getElementById('sessionDate');

    if (welcomeId) welcomeId.textContent = studentId;
    if (welcomeName) {
      welcomeName.textContent = studentId.includes('@')
        ? `Bem-vindo(a), ${studentId.split('@')[0]}!`
        : `Bem-vindo(a), Aluno #${studentId}!`;
    }

    if (sessionDate) {
      const now = new Date();
      sessionDate.textContent = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    if (loginCard) loginCard.classList.add('hidden');
    if (welcomeCard) welcomeCard.classList.remove('hidden');

    showToast(`Bem-vindo(a), ${studentId}!`, 'success');
  }, 1000);
}

// LOGOUT / ENCERRAR SESSÃO
function handleLogout() {
  // Padrão Header
  const openLoginBtn = document.getElementById('openLoginBtn');
  const loggedUserBadge = document.getElementById('loggedUserBadge');

  if (loggedUserBadge) {
    loggedUserBadge.classList.add('hidden');
    loggedUserBadge.classList.remove('flex');
  }
  if (openLoginBtn) openLoginBtn.classList.remove('hidden');

  // Padrão Cards
  const welcomeCard = document.getElementById('welcomeCard');
  const loginCard = document.getElementById('loginCard');
  const passwordEl = document.getElementById('password');

  if (welcomeCard) welcomeCard.classList.add('hidden');
  if (loginCard) loginCard.classList.remove('hidden');
  if (passwordEl) passwordEl.value = '';

  showToast('Sessão encerrada com segurança.', 'info');
}

// CARREGAR USUÁRIO SALVO
function checkSavedAccess() {
  const savedId = localStorage.getItem('saved_student_id');
  const studentIdEl = document.getElementById('studentId');
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
  toast.innerHTML = `
    <i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i>
    <span class="flex-1">${message}</span>
  `;

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