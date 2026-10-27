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
    }

// Inicialização do Lucide Icons
    document.addEventListener('DOMContentLoaded', () => {
      if (window.lucide) {
        lucide.createIcons();
      }
      checkSavedAccess();
    });

    // Filtros de Projetos
    function filterProjects(category) {
      const cards = document.querySelectorAll('.project-card');
      const buttons = document.querySelectorAll('.project-filter-btn');

      buttons.forEach(btn => {
        if (btn.getAttribute('data-category') === category) {
          btn.className = 'project-filter-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all bg-navy text-white shadow-sm';
        } else {
          btn.className = 'project-filter-btn px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-navy-muted hover:text-navy hover:bg-white/50 transition-all';
        }
      });

      cards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }

    // Modal de Login
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

    // Preenchimento rápido para demonstração
    function fillTestCredentials() {
      const idInput = document.getElementById('studentId');
      const passInput = document.getElementById('password');
      if (idInput) idInput.value = 'aluno@escola.edu.br';
      if (passInput) passInput.value = 'aluno123';
      showToast('Dados de teste preenchidos!', 'info');
    }

    // Alternar visibilidade da senha
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

    // Manipular Submit de Login
    function handleLogin(event) {
      event.preventDefault();
      const studentId = document.getElementById('studentId').value.trim();
      const password = document.getElementById('password').value.trim();
      const rememberMe = document.getElementById('rememberMe').checked;

      if (!studentId || !password) {
        showToast('Preencha todos os campos.', 'error');
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
          sessionDate.textContent = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
        }

        document.getElementById('loginCard').classList.add('hidden');
        document.getElementById('welcomeCard').classList.remove('hidden');

        showToast('Login realizado com sucesso!', 'success');
      }, 1000);
    }

    function handleLogout() {
      document.getElementById('welcomeCard').classList.add('hidden');
      document.getElementById('loginCard').classList.remove('hidden');
      document.getElementById('password').value = '';
      showToast('Sessão encerrada.', 'info');
    }

    function setLoadingState(isLoading) {
      const btn = document.getElementById('submitBtn');
      const text = document.getElementById('btnText');
      const spinner = document.getElementById('btnSpinner');
      if (!btn) return;

      if (isLoading) {
        btn.disabled = true;
        text.classList.add('hidden');
        spinner.classList.remove('hidden');
      } else {
        btn.disabled = false;
        text.classList.remove('hidden');
        spinner.classList.add('hidden');
      }
    }

    function checkSavedAccess() {
      const savedId = localStorage.getItem('saved_student_id');
      const studentIdEl = document.getElementById('studentId');
      const rememberMeEl = document.getElementById('rememberMe');
      if (savedId && studentIdEl) {
        studentIdEl.value = savedId;
        if (rememberMeEl) rememberMeEl.checked = true;
      }
    }

    // Modal Esqueceu Senha
    function openForgotModal() {
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

    // Modal de Demonstração de Projetos
    const projectDemos = {
      ecosmart: {
        title: "EcoSmart Dashboard",
        author: "Gabriel Silva (3º Ano A)",
        category: "WEB & FRONT-END",
        class: "3º ANO A",
        description: "Painel web interativo para exibição em telas no pátio do colégio, exibindo métricas de consumo de energia solar e reciclagem de resíduos sólidos.",
        codeSnippet: `const energyData = { solarKW: 45.8, wasteRecycledKg: 120 };\nfunction renderDashboard() {\n  console.log("Status da Energia Solar:", energyData.solarKW + " kW/h");\n  // Renderizando gráficos interativos...\n}\nrenderDashboard();`
      },
      robotica: {
        title: "Braço Robótico ESP32",
        author: "Mariana Costa (2º Ano B)",
        category: "ROBÓTICA & HARDWARE",
        class: "2º ANO B",
        description: "Braço robótico articulado impresso na impressora 3D da escola e operado remotamente por uma interface web gerada diretamente no microcontrolador ESP32.",
        codeSnippet: `#include <ESP32Servo.h>\nServo baseServo;\nvoid setup() {\n  baseServo.attach(13);\n  Serial.println("Servomotores inicializados via WiFi.");\n}`
      },
      ia: {
        title: "Previsor de Desempenho",
        author: "Lucas Andrade (3º Ano B)",
        category: "IA & PYTHON",
        class: "3º ANO B",
        description: "Modelo estatístico treinado em Python utilizando regressão linear para antecipar conteúdos onde a turma pode necessitar de reforço pedagógico.",
        codeSnippet: `from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\nprint("Precisão do modelo na turma:", model.score(X_test, y_test))`
      },
      games: {
        title: "Retro Quest Escolar",
        author: "Sofia & Pedro (1º Ano A)",
        category: "GAMES & CANVAS",
        class: "1º ANO A",
        description: "Jogo 2D feito em JavaScript puro com renderização no elemento Canvas do HTML5. O personagem avança de fase à medida que soluciona desafios de matemática.",
        codeSnippet: `function gameLoop() {\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n  player.update();\n  player.draw();\n  requestAnimationFrame(gameLoop);\n}\ngameLoop();`
      },
      biblioteca: {
        title: "Biblioteca Digital Escolar",
        author: "Beatriz Ramos (3º Ano A)",
        category: "FULL STACK WEB",
        class: "3º ANO A",
        description: "Aplicação completa de controle de acervo com cadastro de empréstimos, busca instantânea e geração de relatórios quinzenais para a bibliotecária.",
        codeSnippet: `app.get('/api/livros', async (req, res) => {\n  const livros = await db.all('SELECT * FROM acervo WHERE disponivel = 1');\n  res.json(livros);\n});`
      },
      horta: {
        title: "Estação Horta IoT",
        author: "Enzo Martins (2º Ano A)",
        category: "IOT & SENSORES",
        class: "2º ANO A",
        description: "Sistema automatizado de irrigação utilizando sensores de umidade de solo capaciti vos e controle de solenoides com transmissão de métricas via MQTT.",
        codeSnippet: `import machine, time\nsensor = machine.ADC(0)\nwhile True:\n  if sensor.read() < 400:\n    print("Solo seco! Ativando válvula de água.")\n  time.sleep(10)`
      }
    };

    function openDemoModal(key) {
      const data = projectDemos[key];
      if (!data) return;

      document.getElementById('demoTitle').textContent = data.title;
      document.getElementById('demoAuthor').textContent = `Por: ${data.author}`;
      document.getElementById('demoCategory').textContent = data.category;
      document.getElementById('demoClass').textContent = data.class;
      document.getElementById('demoDescription').textContent = data.description;
      document.getElementById('demoCodeSnippet').textContent = data.codeSnippet;

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

    // Toast Notifications
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
      }

      toast.className = `p-3.5 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-semibold tracking-wide pointer-events-auto transition-all transform translate-y-2 opacity-0 animate-fade-in ${bgColors}`;
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
