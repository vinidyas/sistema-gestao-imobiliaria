// app.js - JavaScript frontend para Sistema Imobiliário
class SistemaImobiliario {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        this.apiUrl = '/api';
        this.init();
    }

    async init() {
        if (this.token) {
            try {
                await this.loadUserProfile();
                this.showMainApp();
                this.initializeApp();
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
                this.showLogin();
            }
        } else {
            this.showLogin();
        }
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

        const response = await fetch(`${this.apiUrl}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Erro na requisição');
        }

        return data;
    }

    async login(email, senha) {
        try {
            const data = await this.apiCall('/auth/login', {
                method: 'POST',
                body: { email, senha }
            });

            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('token', this.token);

            this.showMainApp();
            this.initializeApp();
            return true;
        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    }

    async loadUserProfile() {
        const data = await this.apiCall('/auth/profile');
        this.user = data.user;
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        this.showLogin();
    }

    showLogin() {
        document.getElementById('loginModal').classList.add('active');
        document.getElementById('mainContent').style.display = 'none';
        document.getElementById('sidebar').style.display = 'none';
    }

    showMainApp() {
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('sidebar').style.display = 'flex';
    }

    async initializeApp() {
        this.setupEventListeners();
        this.updateUserInfo();
        await this.showDashboard();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('a').dataset.page;
                this.navigateTo(page);
            });
        });

        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const email = formData.get('email');
            const senha = formData.get('senha');

            try {
                await this.login(email, senha);
            } catch (error) {
                alert('Erro no login: ' + error.message);
            }
        });
    }

    updateUserInfo() {
        if (this.user) {
            document.getElementById('userInfo').textContent = `Olá, ${this.user.nome}`;
        }
    }

    navigateTo(page) {
        // Update navigation
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            imoveis: 'Gestão de Imóveis',
            contratos: 'Gestão de Contratos',
            faturas: 'Controle de Faturas',
            pessoas: 'Cadastro de Pessoas'
        };
        document.getElementById('pageTitle').textContent = titles[page];

        // Show page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${page}-page`).classList.add('active');

        // Load page data
        switch (page) {
            case 'dashboard':
                this.showDashboard();
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

    async showDashboard() {
        try {
            // Load dashboard stats
            const stats = await this.apiCall('/dashboard/stats');

            document.getElementById('totalImoveis').textContent = stats.data.imoveis.total;
            document.getElementById('imoveisDisponiveis').textContent = stats.data.imoveis.disponiveis;
            document.getElementById('contratosAtivos').textContent = stats.data.contratos.ativos;
            document.getElementById('faturasAbertas').textContent = stats.data.faturas.pendentes;

            // Load recent properties
            const imoveis = await this.apiCall('/dashboard/ultimos-imoveis');
            const ultimosImoveisHtml = imoveis.data.length ? 
                imoveis.data.map(imovel => `
                    <div class="recent-item">
                        <strong>${imovel.nome_imovel}</strong><br>
                        <small>${imovel.codigo} - ${imovel.cidade}, ${imovel.estado}</small>
                    </div>
                `).join('') : '<p>Nenhum imóvel cadastrado</p>';

            document.getElementById('ultimosImoveis').innerHTML = ultimosImoveisHtml;

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        }
    }

    async loadImoveis() {
        try {
            const response = await this.apiCall('/imoveis');
            const tbody = document.querySelector('#imoveisTable tbody');

            if (response.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum imóvel cadastrado</td></tr>';
                return;
            }

            tbody.innerHTML = response.data.map(imovel => `
                <tr>
                    <td>${imovel.codigo}</td>
                    <td>${imovel.nome_imovel || 'N/A'}</td>
                    <td>${imovel.tipo_imovel || 'N/A'}</td>
                    <td>${imovel.cidade || 'N/A'}</td>
                    <td>R$ ${this.formatMoney(imovel.valor_locacao || 0)}</td>
                    <td>
                        <span class="badge badge--${imovel.disponibilidade === 'disponivel' ? 'success' : 'warning'}">
                            ${imovel.status_display}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn--sm" onclick="app.editImovel(${imovel.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Erro ao carregar imóveis:', error);
            document.querySelector('#imoveisTable tbody').innerHTML = 
                '<tr><td colspan="7" class="text-center text-danger">Erro ao carregar imóveis</td></tr>';
        }
    }

    async loadContratos() {
        try {
            const response = await this.apiCall('/contratos');
            const tbody = document.querySelector('#contratosTable tbody');

            if (!tbody) {
                // Create table if not exists
                const contratosPage = document.getElementById('contratos-page');
                contratosPage.innerHTML = `
                    <div class="page-header">
                        <h2>Gestão de Contratos</h2>
                        <button class="btn btn--primary" onclick="app.newContrato()">
                            <i class="fas fa-plus"></i> Novo Contrato
                        </button>
                    </div>
                    <div class="table-container">
                        <table class="data-table" id="contratosTable">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Imóvel</th>
                                    <th>Valor</th>
                                    <th>Início</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                `;
                return this.loadContratos();
            }

            if (response.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum contrato cadastrado</td></tr>';
                return;
            }

            tbody.innerHTML = response.data.map(contrato => `
                <tr>
                    <td>${contrato.codigo_contrato}</td>
                    <td>${contrato.nome_imovel || 'N/A'}</td>
                    <td>R$ ${this.formatMoney(contrato.valor_aluguel || 0)}</td>
                    <td>${this.formatDate(contrato.data_inicio)}</td>
                    <td>
                        <span class="badge badge--${contrato.status_contrato === 'ativo' ? 'success' : 'warning'}">
                            ${contrato.status_contrato}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn--sm" onclick="app.editContrato(${contrato.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Erro ao carregar contratos:', error);
        }
    }

    async loadFaturas() {
        // Similar implementation for faturas
        console.log('Loading faturas...');
    }

    async loadPessoas() {
        // Similar implementation for pessoas
        console.log('Loading pessoas...');
    }

    formatMoney(value) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));
    }

    // Placeholder methods
    editImovel(id) { console.log('Edit imovel', id); }
    newContrato() { console.log('New contrato'); }
    editContrato(id) { console.log('Edit contrato', id); }
}

// Initialize app
const app = new SistemaImobiliario();

// Global functions for onclick handlers
function handleLogin(event) {
    // Handled by event listener in SistemaImobiliario class
}

function handleLogout() {
    app.logout();
}

function openModal(modalId) {
    console.log('Open modal:', modalId);
    // Modal implementation would go here
}
