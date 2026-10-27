// Inicialização do Lucide Icons e verificação de dados salvos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  checkSavedAccess();
});

// Função para alternar visibilidade da senha
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

// Preenchimento de conta de teste rápido
function fillTestAccount(studentId, password, labelName) {
  const idInput = document.getElementById('studentId');
  const passInput = document.getElementById('password');
  if (idInput) idInput.value = studentId;
  if (passInput) passInput.value = password;
  showToast(`Preenchido: ${labelName}`, 'info');
}

// Manipulação do Login
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

  // Ativar Estado de Carregamento
  setLoadingState(true);

  // Simulação de delay de rede para experiência realista
  setTimeout(() => {
    setLoadingState(false);

    // Salva login localmente caso tenha selecionado 'Lembrar'
    if (rememberMe) {
      localStorage.setItem('saved_student_id', studentId);
    } else {
      localStorage.removeItem('saved_student_id');
    }

    // Atualizar Card de Boas-vindas
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
      sessionDate.textContent = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    }

    // Alternar telas
    const loginCard = document.getElementById('loginCard');
    const welcomeCard = document.getElementById('welcomeCard');

    if (loginCard) loginCard.classList.add('hidden');
    if (welcomeCard) welcomeCard.classList.remove('hidden');

    showToast('Login efetuado com sucesso!', 'success');
  }, 1100);
}

// Encerrar sessão / Voltar ao login
function handleLogout() {
  const welcomeCard = document.getElementById('welcomeCard');
  const loginCard = document.getElementById('loginCard');
  const passwordEl = document.getElementById('password');

  if (welcomeCard) welcomeCard.classList.add('hidden');
  if (loginCard) loginCard.classList.remove('hidden');
  if (passwordEl) passwordEl.value = '';
  
  showToast('Sessão encerrada com segurança.', 'info');
}

// Modais
function openForgotModal() {
  const modal = document.getElementById('forgotModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeForgotModal() {
  const modal = document.getElementById('forgotModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// Carregar usuário salvo se existir
function checkSavedAccess() {
  const savedId = localStorage.getItem('saved_student_id');
  const studentIdEl = document.getElementById('studentId');
  const rememberMeEl = document.getElementById('rememberMe');

  if (savedId && studentIdEl) {
    studentIdEl.value = savedId;
    if (rememberMeEl) rememberMeEl.checked = true;
  }
}

// Controle do estado do botão de login
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

// Sistema de Notificações Toast
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

  // Animação de entrada
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  // Remoção automática após 3.5 segundos
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-[-8px]');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}