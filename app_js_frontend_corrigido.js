// app.js - VERSÃO CORRIGIDA FINAL PARA LOGIN FRONTEND
console.log('🎬 Iniciando Sistema Imobiliário...');

class SistemaImobiliario {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        this.apiUrl = '/api';
        console.log('🔧 Token localStorage:', this.token ? 'Existe' : 'Não existe');
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando sistema...');

        if (this.token) {
            try {
                await this.loadUserProfile();
                console.log('✅ Perfil carregado, mostrando app principal');
                this.showMainApp();
                this.initializeApp();
            } catch (error) {
                console.error('❌ Erro ao carregar perfil:', error);
                this.clearToken();
                this.showLogin();
            }
        } else {
            console.log('🔑 Nenhum token encontrado, mostrando login');
            this.showLogin();
        }

        // SEMPRE configurar event listeners
        this.setupEventListeners();
    }

    async apiCall(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        console.log(`📡 API Call: ${config.method || 'GET'} ${this.apiUrl}${endpoint}`);
        console.log('📡 Config:', config);

        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`, config);
            console.log(`📡 Response Status: ${response.status}`);

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.log('📡 Response Text:', text);
                throw new Error(`Resposta não é JSON: ${text}`);
            }

            console.log(`📡 Response Data:`, data);

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error(`💥 API Error:`, error);
            throw error;
        }
    }

    async login(email, senha) {
        try {
            console.log(`🔐 Tentando login para: ${email}`);

            const data = await this.apiCall('/auth/login', {
                method: 'POST',
                body: { email, senha }
            });

            console.log('✅ Login bem-sucedido:', data);

            if (data.success && data.token) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);

                console.log('💾 Token salvo no localStorage');
                console.log('👤 Usuário:', this.user);

                this.showSuccess('Login realizado com sucesso!');

                // IMPORTANTE: Aguardar um pouco antes de mostrar o app
                setTimeout(() => {
                    this.showMainApp();
                    this.initializeApp();
                }, 100);

                return true;
            } else {
                throw new Error('Resposta de login inválida');
            }
        } catch (error) {
            console.error('❌ Erro no login:', error);
            this.showError(`Erro no login: ${error.message}`);
            throw error;
        }
    }

    async loadUserProfile() {
        console.log('👤 Carregando perfil do usuário...');
        const data = await this.apiCall('/auth/profile');
        this.user = data.user;
        console.log('👤 Perfil carregado:', this.user);
    }

    logout() {
        console.log('👋 Fazendo logout...');
        this.clearToken();
        this.showLogin();
        this.showSuccess('Logout realizado com sucesso!');
    }

    clearToken() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        console.log('🗑️ Token removido');
    }

    showLogin() {
        console.log('🔑 Mostrando tela de login...');

        const loginModal = document.getElementById('loginModal');
        const mainContent = document.getElementById('mainContent');
        const sidebar = document.getElementById('sidebar');

        if (loginModal) {
            loginModal.classList.add('active');
            loginModal.style.display = 'flex';
        }

        if (mainContent) {
            mainContent.style.display = 'none';
        }

        if (sidebar) {
            sidebar.style.display = 'none';
        }

        console.log('✅ Tela de login configurada');
    }

    showMainApp() {
        console.log('🏠 Mostrando aplicação principal...');

        const loginModal = document.getElementById('loginModal');
        const mainContent = document.getElementById('mainContent');
        const sidebar = document.getElementById('sidebar');

        if (loginModal) {
            loginModal.classList.remove('active');
            loginModal.style.display = 'none';
        }

        if (mainContent) {
            mainContent.style.display = 'block';
        }

        if (sidebar) {
            sidebar.style.display = 'flex';
        }

        console.log('✅ Aplicação principal configurada');
    }

    async initializeApp() {
        console.log('🎯 Inicializando aplicação...');
        this.updateUserInfo();
        await this.showDashboard();
        console.log('✅ Aplicação inicializada');
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');

        // Navigation
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('a').dataset.page;
                this.navigateTo(page);
            });
        });

        // Login form - CRÍTICO: Remover listeners existentes primeiro
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            // Remover listeners existentes
            const newForm = loginForm.cloneNode(true);
            loginForm.parentNode.replaceChild(newForm, loginForm);

            // Adicionar novo listener
            newForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                console.log('📝 Form de login submetido');

                const submitBtn = e.target.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;

                try {
                    // Mostrar loading
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
                    submitBtn.disabled = true;

                    const formData = new FormData(e.target);
                    const email = formData.get('email');
                    const senha = formData.get('senha');

                    console.log('📝 Dados do formulário:', { email, senha: '***' });

                    await this.login(email, senha);

                } catch (error) {
                    console.error('💥 Erro no submit do login:', error);
                    // Erro já foi tratado no método login()
                } finally {
                    // Restaurar botão
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });

            console.log('✅ Event listener do login configurado');
        } else {
            console.error('❌ Formulário de login não encontrado');
        }

        console.log('✅ Event listeners configurados');
    }

    updateUserInfo() {
        if (this.user) {
            const userInfo = document.getElementById('userInfo');
            if (userInfo) {
                userInfo.textContent = `Olá, ${this.user.nome}`;
            }
        }
    }

    // Funções de notificação
    showError(message) {
        console.error('❌', message);
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        console.log('✅', message);
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Remover notificação anterior
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            max-width: 400px;
            word-wrap: break-word;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; padding: 0; margin-left: 10px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    navigateTo(page) {
        console.log(`🧭 Navegando para: ${page}`);

        // Update navigation
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) activeLink.classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            imoveis: 'Gestão de Imóveis',
            contratos: 'Gestão de Contratos',
            faturas: 'Controle de Faturas',
            pessoas: 'Cadastro de Pessoas'
        };
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = titles[page];

        // Show page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) targetPage.classList.add('active');

        // Load page data
        switch (page) {
            case 'dashboard':
                this.showDashboard();
                break;
            case 'imoveis':
                this.loadImoveis();
                break;
        }
    }

    async showDashboard() {
        try {
            console.log('📊 Carregando dashboard...');
            const stats = await this.apiCall('/dashboard/stats');

            // Atualizar elementos se existirem
            const updateElement = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            };

            updateElement('totalImoveis', stats.data.imoveis.total || 0);
            updateElement('imoveisDisponiveis', stats.data.imoveis.disponiveis || 0);
            updateElement('contratosAtivos', stats.data.contratos.ativos || 0);
            updateElement('faturasAbertas', stats.data.faturas.pendentes || 0);

            console.log('✅ Dashboard carregado');
        } catch (error) {
            console.error('❌ Erro ao carregar dashboard:', error);
            // Colocar dados padrão
            const updateElement = (id, value) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            };

            updateElement('totalImoveis', '0');
            updateElement('imoveisDisponiveis', '0'); 
            updateElement('contratosAtivos', '0');
            updateElement('faturasAbertas', '0');
        }
    }

    async loadImoveis() {
        console.log('🏠 Carregando imóveis...');
        // Implementação futura
    }
}

// Global functions
function handleLogout() {
    if (window.app) {
        window.app.logout();
    }
}

// Initialize app quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, inicializando app...');
    window.app = new SistemaImobiliario();
});

// Fallback para inicialização
if (document.readyState === 'loading') {
    console.log('📄 DOM ainda carregando, aguardando...');
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.app) {
            console.log('📄 Inicializando app via DOMContentLoaded...');
            window.app = new SistemaImobiliario();
        }
    });
} else {
    console.log('📄 DOM já carregado, inicializando app imediatamente...');
    window.app = new SistemaImobiliario();
}

// Debug: Verificar conectividade da API na inicialização
fetch('/api/health')
    .then(response => response.json())
    .then(data => {
        console.log('✅ API Health Check:', data);
    })
    .catch(error => {
        console.error('❌ API Health Check Failed:', error);
    });
