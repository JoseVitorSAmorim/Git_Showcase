// DADOS DOS PROJETO DOS ALUNOS PARA O MODAL DE DEMONSTRAÇÃO
const projectsData = {
  ecosmart: {
    title: 'EcoSmart Dashboard',
    desc: 'Painel interativo para monitoramento de consumo de energia solar e reciclagem no colégio em tempo real com alertas visuais e gráficos dinâmicos.',
    author: 'Gabriel Silva',
    turma: '3º Ano A',
    techs: 'HTML5, Tailwind CSS, Chart.js',
    category: 'Web',
    repoCmd: 'git clone https://github.com/escola/ecosmart-dashboard.git'
  },
  robotica: {
    title: 'Braço Robótico ESP32',
    desc: 'Braço mecânico impresso em 3D no laboratório do colégio e controlado remotamente via aplicativo Web local através de conexão Wi-Fi.',
    author: 'Mariana Costa',
    turma: '2º Ano B',
    techs: 'C++ / Arduino, ESP32, Impressão 3D',
    category: 'Robótica / IoT',
    repoCmd: 'git clone https://github.com/escola/braco-robotico-esp32.git'
  },
  ia: {
    title: 'Previsor de Desempenho',
    desc: 'Algoritmo desenvolvido em Python que prevê necessidades de reforço escolar com base na evolução do histórico de simulados dos alunos.',
    author: 'Lucas Andrade',
    turma: '3º Ano B',
    techs: 'Python 3, Scikit-Learn, Pandas',
    category: 'IA & Python',
    repoCmd: 'git clone https://github.com/escola/previsor-desempenho-ia.git'
  },
  games: {
    title: 'Retro Quest Escolar',
    desc: 'Jogo estilo aventura em pixel art 2D onde o jogador avança resolvendo enigmas de lógica, matemática e conceitos básicos de algoritmos.',
    author: 'Sofia & Pedro',
    turma: '1º Ano A',
    techs: 'JavaScript, HTML5 Canvas, Web Audio',
    category: 'Games',
    repoCmd: 'git clone https://github.com/escola/retro-quest-escolar.git'
  },
  biblioteca: {
    title: 'Biblioteca Digital',
    desc: 'Gerenciador web completo para empréstimo e reserva de livros físicos do colégio com leitura de código de barras pela câmera do computador.',
    author: 'Beatriz Ramos',
    turma: '3º Ano A',
    techs: 'Node.js, SQLite, Express',
    category: 'Web',
    repoCmd: 'git clone https://github.com/escola/biblioteca-digital.git'
  },
  horta: {
    title: 'Estação Horta IoT',
    desc: 'Estação automatizada de irrigação inteligente com sensores de umidade do solo e atuadores conectados à horta comunitária da escola.',
    author: 'Enzo Martins',
    turma: '2º Ano A',
    techs: 'MicroPython, NodeMCU, MQTT',
    category: 'Robótica / IoT',
    repoCmd: 'git clone https://github.com/escola/horta-inteligente-iot.git'
  }
};

let currentActiveCategory = 'all';

// INICIALIZAÇÃO AO CARREGAR A PÁGINA
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  setupSearch();
  checkSavedAccess();
});

// SISTEMA DE FILTRAGEM DOS TRABALHOS DOS ALUNOS POR CATEGORIA
function filterProjects(category) {
  currentActiveCategory = category;
  const cards = document.querySelectorAll('.project-card');
  const buttons = document.querySelectorAll('.project-filter-btn');
  const emptyState = document.getElementById('empty-state');
  let visibleCount = 0;

  // Atualizar estilo visual dos botões de filtro
  buttons.forEach(btn => {
    const btnCategory = btn.getAttribute('data-category');
    if (btnCategory === category) {
      btn.className = 'project-filter-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all bg-navy text-white shadow-sm cursor-pointer';
    } else {
      btn.className = 'project-filter-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-navy-muted hover:text-navy hover:bg-white/50 transition-all cursor-pointer';
    }
  });

  // Filtrar os cards no grid
  cards.forEach(card => {
    const cardCategory = card.getAttribute('data-category');
    const matchesCategory = category === 'all' || cardCategory === category;
    
    if (matchesCategory) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  // Exibir ou ocultar estado vazio
  if (emptyState) {
    if (visibleCount === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
    }
  }
}

// SISTEMA DE PESQUISA EM TEMPO REAL
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
        visibleCount++;
      } else {
        card.classList.add('hidden');
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

// MODAL DE DEMONSTRAÇÃO DO PROJETO
function openDemoModal(projectId) {
  const data = projectsData[projectId];
  if (!data) return;

  document.getElementById('demoTitle').textContent = data.title;
  document.getElementById('demoDesc').textContent = data.desc;
  document.getElementById('demoAuthor').textContent = data.author;
  document.getElementById('demoTurma').textContent = data.turma;
  document.getElementById('demoTechs').textContent = data.techs;
  document.getElementById('demoBadge').textContent = data.category;
  document.getElementById('demoRepoCmd').textContent = data.repoCmd;

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
  const cmd = document.getElementById('demoRepoCmd').textContent;
  copyToClipboard(cmd);
}

// MODAL DE LOGIN
function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// MODAL DE RECUPERAÇÃO DE SENHA
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
  if (window.lucide) lucide.createIcons();
}

// MANIPULAR AUTENTICAÇÃO
function handleLogin(event) {
  event.preventDefault();
  const studentId = document.getElementById('studentId').value.trim();
  const password = document.getElementById('password').value.trim();
  const rememberMe = document.getElementById('rememberMe').checked;

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

    // Atualiza o cabeçalho para estado conectado
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

    showToast(`Bem-vindo(a), ${studentId}!`, 'success');
  }, 1000);
}

// LOGOUT
function handleLogout() {
  const openLoginBtn = document.getElementById('openLoginBtn');
  const loggedUserBadge = document.getElementById('loggedUserBadge');

  if (loggedUserBadge) {
    loggedUserBadge.classList.add('hidden');
    loggedUserBadge.classList.remove('flex');
  }
  if (openLoginBtn) openLoginBtn.classList.remove('hidden');

  showToast('Sessão encerrada com segurança.', 'info');
}

// CHECAR LOCALSTORAGE
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

  if (!btn || !text || !spinner) return;

  if (isLoading) {
    btn.disabled = true;
    btn.classList.add('opacity-80', 'cursor-wait');
    text.classList.add('hidden');
    spinner.classList.remove('hidden');
  } else {
    btn.disabled = false;
    btn.classList.remove('opacity-80', 'cursor-wait');
    text.classList.remove('hidden');
    spinner.classList.add('hidden');
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

// SISTEMA DE TOAST NOTIFICATION
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
  if (window.lucide) lucide.createIcons();

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-8px]');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}