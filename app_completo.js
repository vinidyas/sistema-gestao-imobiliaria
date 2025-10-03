// app.js - Sistema Completo de Gestão Imobiliária
console.log('🎬 Iniciando Sistema Imobiliário Completo...');

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

        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`, config);

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`Resposta não é JSON: ${text}`);
            }

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error(`💥 API Error [${endpoint}]:`, error);
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

            if (data.success && data.token) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);

                this.showSuccess('Login realizado com sucesso!');

                setTimeout(() => {
                    this.showMainApp();
                    this.initializeApp();
                }, 500);

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
        try {
            const data = await this.apiCall('/auth/profile');
            this.user = data.user;
            console.log('👤 Perfil carregado:', this.user);
        } catch (error) {
            // Se falhar ao carregar perfil, token pode estar expirado
            throw error;
        }
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
    }

    showLogin() {
        console.log('🔑 Mostrando tela de login...');

        const loginModal = document.getElementById('loginModal');
        const mainContent = document.getElementById('mainContent');
        const sidebar = document.getElementById('sidebar');

        if (loginModal) {
            loginModal.classList.add('active');
        }

        if (mainContent) {
            mainContent.style.display = 'none';
        }

        if (sidebar) {
            sidebar.style.display = 'none';
        }
    }

    showMainApp() {
        console.log('🏠 Mostrando aplicação principal...');

        const loginModal = document.getElementById('loginModal');
        const mainContent = document.getElementById('mainContent');
        const sidebar = document.getElementById('sidebar');

        if (loginModal) {
            loginModal.classList.remove('active');
        }

        if (mainContent) {
            mainContent.style.display = 'block';
        }

        if (sidebar) {
            sidebar.style.display = 'flex';
        }
    }

    async initializeApp() {
        console.log('🎯 Inicializando aplicação...');
        this.updateUserInfo();
        this.navigateTo('dashboard');
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

        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            // Remove listeners existentes
            const newForm = loginForm.cloneNode(true);
            loginForm.parentNode.replaceChild(newForm, loginForm);

            newForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const submitBtn = e.target.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;

                try {
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
                    submitBtn.disabled = true;

                    const formData = new FormData(e.target);
                    const email = formData.get('email');
                    const senha = formData.get('senha');

                    await this.login(email, senha);

                } catch (error) {
                    console.error('💥 Erro no login:', error);
                } finally {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }

        console.log('✅ Event listeners configurados');
    }

    updateUserInfo() {
        if (this.user) {
            const userInfo = document.getElementById('userInfo');
            if (userInfo) {
                userInfo.innerHTML = `<i class="fas fa-user"></i> ${this.user.nome}`;
            }
        }
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
                this.loadDashboard();
                break;
            case 'imoveis':
                this.loadImoveis();
                break;
            case 'contratos':
                this.loadContratos();
                break;
            case 'faturas':
                this.loadFaturas();
                break;
            case 'pessoas':
                this.loadPessoas();
                break;
        }
    }

    async loadDashboard() {
        console.log('📊 Carregando dashboard...');

        try {
            // Carregar estatísticas
            const stats = await this.apiCall('/dashboard/stats');

            if (stats.success && stats.data) {
                document.getElementById('totalImoveis').textContent = stats.data.imoveis?.total || 0;
                document.getElementById('imoveisDisponiveis').textContent = stats.data.imoveis?.disponiveis || 0;
                document.getElementById('contratosAtivos').textContent = stats.data.contratos?.ativos || 0;
                document.getElementById('faturasAbertas').textContent = stats.data.faturas?.pendentes || 0;

                // Dados financeiros (se disponíveis)
                if (stats.data.financeiro) {
                    document.getElementById('receitaMensal').textContent = 
                        this.formatCurrency(stats.data.financeiro.receitaMensal || 0);
                    document.getElementById('faturasPendentes').textContent = 
                        this.formatCurrency(stats.data.financeiro.faturasPendentes || 0);
                }
            }

            // Carregar últimos imóveis
            await this.loadUltimosImoveis();

        } catch (error) {
            console.error('❌ Erro ao carregar dashboard:', error);
            // Valores padrão em caso de erro
            document.getElementById('totalImoveis').textContent = '0';
            document.getElementById('imoveisDisponiveis').textContent = '0';
            document.getElementById('contratosAtivos').textContent = '0';
            document.getElementById('faturasAbertas').textContent = '0';
            document.getElementById('receitaMensal').textContent = 'R$ 0,00';
            document.getElementById('faturasPendentes').textContent = 'R$ 0,00';
        }
    }

    async loadUltimosImoveis() {
        try {
            const response = await this.apiCall('/imoveis?limit=5&orderBy=data_criacao&order=desc');
            const ultimosDiv = document.getElementById('ultimosImoveis');

            if (response.success && response.data && response.data.length > 0) {
                ultimosDiv.innerHTML = response.data.map(imovel => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                        <div>
                            <strong>${imovel.nome_imovel || imovel.codigo}</strong><br>
                            <small style="color: var(--color-gray-600);">${imovel.cidade || ''}</small>
                        </div>
                        <div style="text-align: right;">
                            <div class="badge ${this.getBadgeClass(imovel.disponibilidade)}">
                                ${imovel.disponibilidade || 'N/A'}
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                ultimosDiv.innerHTML = '<p style="text-align: center; color: var(--color-gray-600); padding: 1rem;">Nenhum imóvel cadastrado ainda</p>';
            }
        } catch (error) {
            console.error('❌ Erro ao carregar últimos imóveis:', error);
            document.getElementById('ultimosImoveis').innerHTML = '<p style="text-align: center; color: var(--color-danger);">Erro ao carregar dados</p>';
        }
    }

    async loadImoveis() {
        console.log('🏠 Carregando imóveis...');

        try {
            const response = await this.apiCall('/imoveis');
            const tbody = document.querySelector('#imoveisTable tbody');

            if (response.success && response.data) {
                if (response.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--color-gray-600); padding: 2rem;">Nenhum imóvel cadastrado</td></tr>';
                } else {
                    tbody.innerHTML = response.data.map(imovel => `
                        <tr>
                            <td><strong>${imovel.codigo}</strong></td>
                            <td>${imovel.nome_imovel || '-'}</td>
                            <td>${imovel.tipo_imovel || '-'}</td>
                            <td>${imovel.cidade || '-'}</td>
                            <td>${this.formatCurrency(imovel.valor_locacao || 0)}</td>
                            <td><span class="badge ${this.getBadgeClass(imovel.disponibilidade)}">${imovel.disponibilidade || 'N/A'}</span></td>
                            <td>
                                <button class="btn btn--sm btn--primary" onclick="app.editImovel(${imovel.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn--sm btn--danger" onclick="app.deleteImovel(${imovel.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar imóveis:', error);
            document.querySelector('#imoveisTable tbody').innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--color-danger);">Erro ao carregar dados</td></tr>';
        }
    }

    async loadContratos() {
        console.log('📝 Carregando contratos...');

        try {
            const response = await this.apiCall('/contratos');
            const tbody = document.querySelector('#contratosTable tbody');

            if (response.success && response.data) {
                if (response.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-gray-600); padding: 2rem;">Nenhum contrato cadastrado</td></tr>';
                } else {
                    tbody.innerHTML = response.data.map(contrato => `
                        <tr>
                            <td><strong>${contrato.codigo_contrato}</strong></td>
                            <td>${contrato.imovel_nome || contrato.imovel_id}</td>
                            <td>${this.formatCurrency(contrato.valor_aluguel || 0)}</td>
                            <td>${this.formatDate(contrato.data_inicio)}</td>
                            <td><span class="badge ${this.getBadgeClass(contrato.status_contrato)}">${contrato.status_contrato || 'N/A'}</span></td>
                            <td>
                                <button class="btn btn--sm btn--primary" onclick="app.editContrato(${contrato.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn--sm btn--danger" onclick="app.deleteContrato(${contrato.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar contratos:', error);
            document.querySelector('#contratosTable tbody').innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-danger);">Erro ao carregar dados</td></tr>';
        }
    }

    async loadFaturas() {
        console.log('💰 Carregando faturas...');

        try {
            const response = await this.apiCall('/faturas');
            const tbody = document.querySelector('#faturasTable tbody');

            if (response.success && response.data) {
                if (response.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-gray-600); padding: 2rem;">Nenhuma fatura cadastrada</td></tr>';
                } else {
                    tbody.innerHTML = response.data.map(fatura => `
                        <tr>
                            <td><strong>${fatura.numero_fatura || fatura.id}</strong></td>
                            <td>${fatura.contrato_codigo || fatura.contrato_id}</td>
                            <td>${this.formatCurrency(fatura.valor_total || 0)}</td>
                            <td>${this.formatDate(fatura.data_vencimento)}</td>
                            <td><span class="badge ${this.getBadgeClass(fatura.status_fatura)}">${fatura.status_fatura || 'N/A'}</span></td>
                            <td>
                                <button class="btn btn--sm btn--success" onclick="app.darBaixaFatura(${fatura.id})">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="btn btn--sm btn--primary" onclick="app.editFatura(${fatura.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn--sm btn--danger" onclick="app.deleteFatura(${fatura.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar faturas:', error);
            document.querySelector('#faturasTable tbody').innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-danger);">Erro ao carregar dados</td></tr>';
        }
    }

    async loadPessoas() {
        console.log('👥 Carregando pessoas...');

        try {
            const response = await this.apiCall('/pessoas');
            const tbody = document.querySelector('#pessoasTable tbody');

            if (response.success && response.data) {
                if (response.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-gray-600); padding: 2rem;">Nenhuma pessoa cadastrada</td></tr>';
                } else {
                    tbody.innerHTML = response.data.map(pessoa => `
                        <tr>
                            <td><strong>${pessoa.nome}</strong></td>
                            <td>${pessoa.cpf_cnpj || '-'}</td>
                            <td>${pessoa.email || '-'}</td>
                            <td>${pessoa.telefone || '-'}</td>
                            <td><span class="badge badge--info">${pessoa.tipo_pessoa || 'N/A'}</span></td>
                            <td>
                                <button class="btn btn--sm btn--primary" onclick="app.editPessoa(${pessoa.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn--sm btn--danger" onclick="app.deletePessoa(${pessoa.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar pessoas:', error);
            document.querySelector('#pessoasTable tbody').innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-danger);">Erro ao carregar dados</td></tr>';
        }
    }

    // Utility methods
    getBadgeClass(status) {
        const statusMap = {
            'disponivel': 'badge--success',
            'locado': 'badge--warning', 
            'vendido': 'badge--info',
            'indisponivel': 'badge--danger',
            'ativo': 'badge--success',
            'vencido': 'badge--warning',
            'rescindido': 'badge--danger',
            'em_aberto': 'badge--warning',
            'pago': 'badge--success',
            'vencido': 'badge--danger',
            'cancelado': 'badge--danger'
        };
        return statusMap[status] || 'badge--info';
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        } catch (error) {
            return '-';
        }
    }

    // Placeholder methods for CRUD operations
    async editImovel(id) {
        this.showInfo(`Editar imóvel ID: ${id} - Funcionalidade em desenvolvimento`);
    }

    async deleteImovel(id) {
        if (confirm('Tem certeza que deseja excluir este imóvel?')) {
            try {
                await this.apiCall(`/imoveis/${id}`, { method: 'DELETE' });
                this.showSuccess('Imóvel excluído com sucesso!');
                this.loadImoveis();
            } catch (error) {
                this.showError('Erro ao excluir imóvel');
            }
        }
    }

    async editContrato(id) {
        this.showInfo(`Editar contrato ID: ${id} - Funcionalidade em desenvolvimento`);
    }

    async deleteContrato(id) {
        if (confirm('Tem certeza que deseja excluir este contrato?')) {
            try {
                await this.apiCall(`/contratos/${id}`, { method: 'DELETE' });
                this.showSuccess('Contrato excluído com sucesso!');
                this.loadContratos();
            } catch (error) {
                this.showError('Erro ao excluir contrato');
            }
        }
    }

    async darBaixaFatura(id) {
        try {
            await this.apiCall(`/faturas/${id}`, {
                method: 'PUT',
                body: { status_fatura: 'pago', data_pagamento: new Date().toISOString().split('T')[0] }
            });
            this.showSuccess('Baixa realizada com sucesso!');
            this.loadFaturas();
            this.loadDashboard(); // Atualizar estatísticas
        } catch (error) {
            this.showError('Erro ao dar baixa na fatura');
        }
    }

    async editFatura(id) {
        this.showInfo(`Editar fatura ID: ${id} - Funcionalidade em desenvolvimento`);
    }

    async deleteFatura(id) {
        if (confirm('Tem certeza que deseja excluir esta fatura?')) {
            try {
                await this.apiCall(`/faturas/${id}`, { method: 'DELETE' });
                this.showSuccess('Fatura excluída com sucesso!');
                this.loadFaturas();
            } catch (error) {
                this.showError('Erro ao excluir fatura');
            }
        }
    }

    async editPessoa(id) {
        this.showInfo(`Editar pessoa ID: ${id} - Funcionalidade em desenvolvimento`);
    }

    async deletePessoa(id) {
        if (confirm('Tem certeza que deseja excluir esta pessoa?')) {
            try {
                await this.apiCall(`/pessoas/${id}`, { method: 'DELETE' });
                this.showSuccess('Pessoa excluída com sucesso!');
                this.loadPessoas();
            } catch (error) {
                this.showError('Erro ao excluir pessoa');
            }
        }
    }

    // Notification methods
    showError(message) {
        console.error('❌', message);
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        console.log('✅', message);
        this.showNotification(message, 'success');
    }

    showInfo(message) {
        console.log('ℹ️', message);
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Remove notificação anterior
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; padding: 0; margin-left: auto;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Global functions
function handleLogout() {
    if (window.app) {
        window.app.logout();
    }
}

// Placeholder functions for modal operations
function openImovelModal() {
    window.app.showInfo('Modal de cadastro de imóvel - Em desenvolvimento');
}

function openContratoModal() {
    window.app.showInfo('Modal de cadastro de contrato - Em desenvolvimento');
}

function openFaturaModal() {
    window.app.showInfo('Modal de cadastro de fatura - Em desenvolvimento');
}

function openPessoaModal() {
    window.app.showInfo('Modal de cadastro de pessoa - Em desenvolvimento');
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, inicializando app completo...');
    window.app = new SistemaImobiliario();
});

// Fallback
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.app) {
            window.app = new SistemaImobiliario();
        }
    });
} else {
    window.app = new SistemaImobiliario();
}

console.log('✅ Sistema Imobiliário Completo carregado!');