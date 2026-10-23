// MOCK DATA DOS REPOSITÓRIOS DO GIT
const repositories = [
    {
        id: 'nexus-ui',
        name: 'nexus-ui',
        description: 'Sistema de design acessível em React e Tailwind CSS com componentes primitivos de alta performance.',
        language: 'React',
        languageColor: '#61DAFB',
        stars: 342,
        forks: 48,
        updated: '2026-03-15',
        isFeatured: true,
        githubUrl: 'https://github.com',
        demoUrl: 'https://example.com'
    },
    {
        id: 'fast-vector-db',
        name: 'fast-vector-db',
        description: 'Mecanismo ultra-rápido de busca por similaridade de vetores escrito em Go para aplicações de IA.',
        language: 'Go',
        languageColor: '#00ADD8',
        stars: 512,
        forks: 74,
        updated: '2026-03-20',
        isFeatured: true,
        githubUrl: 'https://github.com',
        demoUrl: null
    },
    {
        id: 'py-automata',
        name: 'py-automata',
        description: 'Pipeline extensível para automação web, extração de dados e síntese com modelos LLM.',
        language: 'Python',
        languageColor: '#3572A5',
        stars: 189,
        forks: 29,
        updated: '2026-02-28',
        isFeatured: false,
        githubUrl: 'https://github.com',
        demoUrl: null
    },
    {
        id: 'ts-compiler-plugin',
        name: 'ts-compiler-plugin',
        description: 'Transformador AST customizado para TypeScript com injeção automática de telemetria de código.',
        language: 'TypeScript',
        languageColor: '#3178C6',
        stars: 124,
        forks: 16,
        updated: '2026-03-01',
        isFeatured: false,
        githubUrl: 'https://github.com',
        demoUrl: null
    },
    {
        id: 'micro-auth-service',
        name: 'micro-auth-service',
        description: 'Microserviço de autenticação OAuth2 e JWT em Go integrado com gerenciamento de sessão via Redis.',
        language: 'Go',
        languageColor: '#00ADD8',
        stars: 275,
        forks: 38,
        updated: '2026-03-10',
        isFeatured: false,
        githubUrl: 'https://github.com',
        demoUrl: 'https://example.com'
    },
    {
        id: 'fullstack-saas-template',
        name: 'fullstack-saas-template',
        description: 'Boilerplate completo para SaaS usando Next.js 14, TypeScript, Stripe e Prisma ORM.',
        language: 'TypeScript',
        languageColor: '#3178C6',
        stars: 890,
        forks: 142,
        updated: '2026-03-21',
        isFeatured: true,
        githubUrl: 'https://github.com',
        demoUrl: 'https://example.com'
    },
    {
        id: 'deep-learning-lab',
        name: 'deep-learning-lab',
        description: 'Coleção de implementações em PyTorch de modelos clássicos de visão computacional do zero.',
        language: 'Python',
        languageColor: '#3572A5',
        stars: 410,
        forks: 82,
        updated: '2026-01-15',
        isFeatured: false,
        githubUrl: 'https://github.com',
        demoUrl: null
    },
    {
        id: 'react-infinite-canvas',
        name: 'react-infinite-canvas',
        description: 'Componente React para quadros infinitos estilo Figma/Miro utilizando HTML5 Canvas e WebGL.',
        language: 'React',
        languageColor: '#61DAFB',
        stars: 215,
        forks: 31,
        updated: '2026-02-10',
        isFeatured: false,
        githubUrl: 'https://github.com',
        demoUrl: 'https://example.com'
    }
];

// CONFIGURAÇÃO DOS FILTROS PEDIDOS
const filterLanguages = ['Todos', 'TypeScript', 'Python', 'Go', 'React'];

// ESTADO DA APLICAÇÃO
let state = {
    searchQuery: '',
    selectedLanguage: 'Todos',
    sortBy: 'stars'
};

// DOM ELEMENTS
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const languageFiltersContainer = document.getElementById('language-filters');
const repoGrid = document.getElementById('repo-grid');
const emptyState = document.getElementById('empty-state');
const repoCountEl = document.getElementById('repo-count');
const sortSelect = document.getElementById('sort-select');
const resetFiltersBtn = document.getElementById('reset-filters-btn');

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    renderLanguageFilters();
    renderRepositories();
    setupEventListeners();
    lucide.createIcons();
});

// RENDERIZAR BOTÕES DE FILTRO DE LINGUAGEM
function renderLanguageFilters() {
    languageFiltersContainer.innerHTML = filterLanguages.map(lang => {
        const isActive = state.selectedLanguage === lang;
        return `
            <button 
                data-lang="${lang}" 
                class="filter-tag px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                    isActive 
                        ? 'bg-navy text-white border-navy shadow-sm' 
                        : 'bg-white/80 text-navy-muted border-white/60 hover:border-navy/30 hover:text-navy hover:bg-white'
                }"
            >
                ${lang}
            </button>
        `;
    }).join('');
}

// FILTRAR E ORDENAR REPOSITÓRIOS
function getFilteredRepositories() {
    return repositories.filter(repo => {
        // Filtro de Texto (Nome, Descrição ou Linguagem)
        const query = state.searchQuery.toLowerCase().trim();
        const matchesSearch = query === '' || 
            repo.name.toLowerCase().includes(query) || 
            repo.description.toLowerCase().includes(query) ||
            repo.language.toLowerCase().includes(query);

        // Filtro de Linguagem
        const matchesLanguage = state.selectedLanguage === 'Todos' || repo.language === state.selectedLanguage;

        return matchesSearch && matchesLanguage;
    }).sort((a, b) => {
        if (state.sortBy === 'stars') return b.stars - a.stars;
        if (state.sortBy === 'updated') return new Date(b.updated) - new Date(a.updated);
        if (state.sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
    });
}

// RENDERIZAR CARDS DOS REPOSITÓRIOS
function renderRepositories() {
    const filteredRepos = getFilteredRepositories();
    repoCountEl.textContent = filteredRepos.length;

    if (filteredRepos.length === 0) {
        repoGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    repoGrid.classList.remove('hidden');

    repoGrid.innerHTML = filteredRepos.map(repo => `
        <article class="repo-card group rounded-2xl p-5 flex flex-col justify-between transition-all duration-300">
            <div>
                <!-- Header do Card -->
                <div class="flex items-start justify-between gap-2 mb-3">
                    <div class="flex items-center gap-2 min-w-0">
                        <i data-lucide="folder-git-2" class="w-4 h-4 text-navy shrink-0"></i>
                        <h3 class="font-bold font-mono text-[15px] text-navy group-hover:underline decoration-navy/30 underline-offset-4 truncate">
                            ${repo.name}
                        </h3>
                    </div>
                    <span class="shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                        repo.isFeatured 
                            ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }">
                        ${repo.isFeatured ? 'DESTAQUE' : 'PÚBLICO'}
                    </span>
                </div>

                <!-- Descrição -->
                <p class="text-xs text-navy-muted leading-relaxed mb-5 line-clamp-3">
                    ${repo.description}
                </p>
            </div>

            <!-- Rodapé do Card (Info & Ações) -->
            <div>
                <div class="flex items-center justify-between text-xs text-navy-muted pt-3 border-t border-navy/5 mb-3">
                    <!-- Linguagem -->
                    <div class="flex items-center gap-1.5 font-medium">
                        <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${repo.languageColor}"></span>
                        <span class="text-navy font-semibold">${repo.language}</span>
                    </div>

                    <!-- Estatísticas -->
                    <div class="flex items-center gap-3 font-mono">
                        <span class="flex items-center gap-1 hover:text-navy transition-colors" title="Estrelas">
                            <i data-lucide="star" class="w-3.5 h-3.5 text-amber-500 fill-amber-500"></i>
                            ${repo.stars}
                        </span>
                        <span class="flex items-center gap-1 hover:text-navy transition-colors" title="Forks">
                            <i data-lucide="git-fork" class="w-3.5 h-3.5"></i>
                            ${repo.forks}
                        </span>
                    </div>
                </div>

                <!-- Botões de Ação -->
                <div class="flex items-center gap-2">
                    <a 
                        href="${repo.githubUrl}" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-navy/5 hover:bg-navy hover:text-white text-navy text-xs font-semibold transition-all duration-200"
                    >
                        <i data-lucide="github" class="w-3.5 h-3.5"></i>
                        <span>Ver no GitHub</span>
                    </a>
                    <button 
                        onclick="copyCloneCommand('${repo.name}')"
                        class="p-2 rounded-xl border border-navy/10 text-navy hover:bg-navy/5 transition-all"
                        title="Copiar comando git clone"
                    >
                        <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                    </button>

                    ${repo.demoUrl ? `
                        <a 
                            href="${repo.demoUrl}" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            class="p-2 rounded-xl bg-navy text-white hover:bg-navy-light transition-all"
                            title="Visualizar Demo ao Vivo"
                        >
                            <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        </article>
    `).join('');

    // Recriar ícones para o novo conteúdo inserido no DOM
    lucide.createIcons();
}

// EVENT LISTENERS
function setupEventListeners() {
    // Busca por texto
    searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        clearSearchBtn.classList.toggle('hidden', state.searchQuery === '');
        renderRepositories();
    });

    // Limpar Busca
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.searchQuery = '';
        clearSearchBtn.classList.add('hidden');
        renderRepositories();
    });

    // Filtro por linguagem
    languageFiltersContainer.addEventListener('click', (e) => {
        const target = e.target.closest('.filter-tag');
        if (!target) return;
        state.selectedLanguage = target.getAttribute('data-lang');
        renderLanguageFilters();
        renderRepositories();
    });

    // Ordenação
    sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        renderRepositories();
    });

    // Botão Redefinir Filtros
    resetFiltersBtn.addEventListener('click', () => {
        state.searchQuery = '';
        state.selectedLanguage = 'Todos';
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        renderLanguageFilters();
        renderRepositories();
    });
}

// FUNÇÃO DE COPIAR COMANDO DE CLONE (Sem usar alert)
function copyCloneCommand(repoName) {
    const command = `git clone https://github.com/lucassilva/${repoName}.git`;
    // Usar execCommand para fallback seguro em iFrames
    const tempInput = document.createElement('textarea');
    tempInput.value = command;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    showToast(`Copiado: "${command}"`);
}

// EXIBIR NOTIFICAÇÃO TOAST
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    toastMsg.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-4', 'pointer-events-none');
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4', 'pointer-events-none');
    }, 3000);
}
