// Estado da aplicação
let currentUser = null;
let proprietarios = [];
let medicamentos = [];
let animais = [];
let consultas = [];

// URLs da API
const API_BASE = '/api';

// Elementos DOM
const screens = {
    login: document.getElementById('login-screen'),
    admin: document.getElementById('admin-screen'),
    proprietarios: document.getElementById('proprietarios-screen'),
    medicamentos: document.getElementById('medicamentos-screen'),
    animais: document.getElementById('animais-screen'),
    consultas: document.getElementById('consultas-screen')
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
    setCurrentDate();
});

// Verificar autenticação
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/check-auth`);
        const data = await response.json();
        
        if (data.authenticated) {
            currentUser = data.usuario;
            showScreen('admin');
            document.getElementById('user-name').textContent = `Olá, ${currentUser}`;
        } else {
            showScreen('login');
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        showScreen('login');
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Login
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Navegação principal
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const screen = this.dataset.screen;
            showScreen(screen);
            loadScreenData(screen);
        });
    });
    
    // Botões de voltar
    document.querySelectorAll('[id^="back-to-admin"]').forEach(btn => {
        btn.addEventListener('click', () => showScreen('admin'));
    });
    
    // Formulários
    document.getElementById('proprietario-form').addEventListener('submit', handleProprietarioSubmit);
    document.getElementById('medicamento-form').addEventListener('submit', handleMedicamentoSubmit);
    document.getElementById('animal-form').addEventListener('submit', handleAnimalSubmit);
    document.getElementById('consulta-form').addEventListener('submit', handleConsultaSubmit);
    
    // Botões de limpar
    document.getElementById('clear-proprietario').addEventListener('click', () => clearForm('proprietario-form'));
    document.getElementById('clear-medicamento').addEventListener('click', () => clearForm('medicamento-form'));
    document.getElementById('clear-animal').addEventListener('click', () => clearForm('animal-form'));
    document.getElementById('clear-consulta').addEventListener('click', () => clearForm('consulta-form'));
    
    // Cálculo automático do valor de venda
    document.getElementById('med-valor-compra').addEventListener('input', calculateSalePrice);
    document.getElementById('med-margem-lucro').addEventListener('input', calculateSalePrice);
    
    // Auto-preenchimento do proprietário na consulta
    document.getElementById('consulta-animal').addEventListener('change', updateProprietarioConsulta);
}

// Mostrar tela
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.style.display = 'none';
    });
    
    if (screens[screenName]) {
        screens[screenName].style.display = 'block';
    }
}

// Definir data atual
function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('consulta-data').value = today;
}

// Login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const loginData = {
        usuario: formData.get('usuario'),
        senha: formData.get('senha')
    };
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.usuario;
            document.getElementById('user-name').textContent = `Olá, ${currentUser}`;
            showScreen('admin');
            hideError('login-error');
        } else {
            showError('login-error', data.error);
        }
    } catch (error) {
        showError('login-error', 'Erro ao conectar com o servidor');
    }
}

// Logout
async function handleLogout() {
    try {
        await fetch(`${API_BASE}/logout`, { method: 'POST' });
        currentUser = null;
        showScreen('login');
        document.getElementById('login-form').reset();
    } catch (error) {
        console.error('Erro no logout:', error);
    }
}

// Carregar dados da tela
async function loadScreenData(screen) {
    switch(screen) {
        case 'proprietarios':
            await loadProprietarios();
            break;
        case 'medicamentos':
            await loadMedicamentos();
            break;
        case 'animais':
            await loadAnimais();
            await loadProprietariosSelect();
            break;
        case 'consultas':
            await loadConsultas();
            await loadAnimaisSelect();
            break;
    }
}

// Proprietários
async function loadProprietarios() {
    try {
        const response = await fetch(`${API_BASE}/proprietarios`);
        proprietarios = await response.json();
        renderProprietarios();
    } catch (error) {
        console.error('Erro ao carregar proprietários:', error);
    }
}

function renderProprietarios() {
    const container = document.getElementById('proprietarios-list');
    container.innerHTML = '';
    
    proprietarios.forEach(prop => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <h4>${prop.nome}</h4>
            <p><strong>Telefone:</strong> ${prop.telefone}</p>
            <p><strong>Endereço:</strong> ${prop.endereco}</p>
            ${prop.observacao ? `<p><strong>Observação:</strong> ${prop.observacao}</p>` : ''}
            <div class="item-actions">
                <button class="btn btn-danger" onclick="deleteProprietario(${prop.id})">Excluir</button>
            </div>
        `;
        container.appendChild(item);
    });
}

async function handleProprietarioSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const proprietarioData = {
        nome: formData.get('nome'),
        telefone: formData.get('telefone'),
        endereco: formData.get('endereco'),
        observacao: formData.get('observacao')
    };
    
    try {
        const response = await fetch(`${API_BASE}/proprietarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(proprietarioData)
        });
        
        if (response.ok) {
            clearForm('proprietario-form');
            await loadProprietarios();
            showSuccess('Proprietário cadastrado com sucesso!');
        } else {
            const error = await response.json();
            showError('form-error', error.error);
        }
    } catch (error) {
        showError('form-error', 'Erro ao salvar proprietário');
    }
}

async function deleteProprietario(id) {
    if (confirm('Tem certeza que deseja excluir este proprietário?')) {
        try {
            const response = await fetch(`${API_BASE}/proprietarios/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadProprietarios();
                showSuccess('Proprietário excluído com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao excluir proprietário:', error);
        }
    }
}

// Medicamentos
async function loadMedicamentos() {
    try {
        const response = await fetch(`${API_BASE}/medicamentos`);
        medicamentos = await response.json();
        renderMedicamentos();
    } catch (error) {
        console.error('Erro ao carregar medicamentos:', error);
    }
}

function renderMedicamentos() {
    const container = document.getElementById('medicamentos-list');
    container.innerHTML = '';
    
    medicamentos.forEach(med => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <h4>${med.nome}</h4>
            <p><strong>Laboratório:</strong> ${med.laboratorio}</p>
            <p><strong>Apresentação:</strong> ${med.apresentacao}</p>
            <p><strong>Valor de Compra:</strong> R$ ${med.valor_compra.toFixed(2)}</p>
            <p><strong>Margem de Lucro:</strong> ${med.margem_lucro}%</p>
            <p><strong>Valor de Venda:</strong> R$ ${med.valor_venda.toFixed(2)}</p>
            <div class="item-actions">
                <button class="btn btn-danger" onclick="deleteMedicamento(${med.id})">Excluir</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function calculateSalePrice() {
    const valorCompra = parseFloat(document.getElementById('med-valor-compra').value) || 0;
    const margemLucro = parseFloat(document.getElementById('med-margem-lucro').value) || 0;
    const valorVenda = valorCompra + (valorCompra * margemLucro / 100);
    
    document.getElementById('med-valor-venda').value = valorVenda.toFixed(2);
}

async function handleMedicamentoSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const medicamentoData = {
        nome: formData.get('nome'),
        laboratorio: formData.get('laboratorio'),
        apresentacao: formData.get('apresentacao'),
        valor_compra: formData.get('valor_compra'),
        margem_lucro: formData.get('margem_lucro')
    };
    
    try {
        const response = await fetch(`${API_BASE}/medicamentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(medicamentoData)
        });
        
        if (response.ok) {
            clearForm('medicamento-form');
            await loadMedicamentos();
            showSuccess('Medicamento cadastrado com sucesso!');
        } else {
            const error = await response.json();
            showError('form-error', error.error);
        }
    } catch (error) {
        showError('form-error', 'Erro ao salvar medicamento');
    }
}

async function deleteMedicamento(id) {
    if (confirm('Tem certeza que deseja excluir este medicamento?')) {
        try {
            const response = await fetch(`${API_BASE}/medicamentos/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadMedicamentos();
                showSuccess('Medicamento excluído com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao excluir medicamento:', error);
        }
    }
}

// Animais
async function loadAnimais() {
    try {
        const response = await fetch(`${API_BASE}/animais`);
        animais = await response.json();
        renderAnimais();
    } catch (error) {
        console.error('Erro ao carregar animais:', error);
    }
}

async function loadProprietariosSelect() {
    try {
        const response = await fetch(`${API_BASE}/proprietarios`);
        const props = await response.json();
        
        const select = document.getElementById('animal-proprietario');
        select.innerHTML = '<option value="">Selecione um proprietário...</option>';
        
        props.forEach(prop => {
            const option = document.createElement('option');
            option.value = prop.id;
            option.textContent = prop.nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar proprietários:', error);
    }
}

function renderAnimais() {
    const container = document.getElementById('animais-list');
    container.innerHTML = '';
    
    animais.forEach(animal => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <h4>${animal.nome}</h4>
            <p><strong>Raça:</strong> ${animal.raca}</p>
            <p><strong>Proprietário:</strong> ${animal.proprietario_nome}</p>
            <p><strong>Data de Nascimento:</strong> ${animal.data_nascimento}</p>
            ${animal.observacao ? `<p><strong>Observação:</strong> ${animal.observacao}</p>` : ''}
            <div class="item-actions">
                <button class="btn btn-danger" onclick="deleteAnimal(${animal.id})">Excluir</button>
            </div>
        `;
        container.appendChild(item);
    });
}

async function handleAnimalSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const dataNascimento = new Date(formData.get('data_nascimento'));
    const dataFormatada = dataNascimento.toLocaleDateString('pt-BR');
    
    const animalData = {
        nome: formData.get('nome'),
        raca: formData.get('raca'),
        proprietario_id: formData.get('proprietario_id'),
        data_nascimento: dataFormatada,
        observacao: formData.get('observacao')
    };
    
    try {
        const response = await fetch(`${API_BASE}/animais`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(animalData)
        });
        
        if (response.ok) {
            clearForm('animal-form');
            await loadAnimais();
            showSuccess('Animal cadastrado com sucesso!');
        } else {
            const error = await response.json();
            showError('form-error', error.error);
        }
    } catch (error) {
        showError('form-error', 'Erro ao salvar animal');
    }
}

async function deleteAnimal(id) {
    if (confirm('Tem certeza que deseja excluir este animal?')) {
        try {
            const response = await fetch(`${API_BASE}/animais/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadAnimais();
                showSuccess('Animal excluído com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao excluir animal:', error);
        }
    }
}

// Consultas
async function loadConsultas() {
    try {
        const response = await fetch(`${API_BASE}/consultas`);
        consultas = await response.json();
        renderConsultas();
    } catch (error) {
        console.error('Erro ao carregar consultas:', error);
    }
}

async function loadAnimaisSelect() {
    try {
        const response = await fetch(`${API_BASE}/animais`);
        const animaisData = await response.json();
        
        const select = document.getElementById('consulta-animal');
        select.innerHTML = '<option value="">Selecione um animal...</option>';
        
        animaisData.forEach(animal => {
            const option = document.createElement('option');
            option.value = animal.id;
            option.textContent = `${animal.nome} (${animal.proprietario_nome})`;
            option.dataset.proprietario = animal.proprietario_nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar animais:', error);
    }
}

function updateProprietarioConsulta() {
    const select = document.getElementById('consulta-animal');
    const selectedOption = select.options[select.selectedIndex];
    const proprietarioInput = document.getElementById('consulta-proprietario');
    
    if (selectedOption && selectedOption.dataset.proprietario) {
        proprietarioInput.value = selectedOption.dataset.proprietario;
    } else {
        proprietarioInput.value = '';
    }
}

function renderConsultas() {
    const container = document.getElementById('consultas-list');
    container.innerHTML = '';
    
    consultas.forEach(consulta => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <h4>Consulta - ${consulta.data_consulta}</h4>
            <p><strong>Animal:</strong> ${consulta.animal_nome}</p>
            <p><strong>Proprietário:</strong> ${consulta.proprietario_nome}</p>
            ${consulta.observacoes ? `<p><strong>Observações:</strong> ${consulta.observacoes}</p>` : ''}
            ${consulta.medicamentos_procedimentos ? `<p><strong>Medicamentos/Procedimentos:</strong> ${consulta.medicamentos_procedimentos}</p>` : ''}
            <div class="item-actions">
                <button class="btn btn-danger" onclick="deleteConsulta(${consulta.id})">Excluir</button>
            </div>
        `;
        container.appendChild(item);
    });
}

async function handleConsultaSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const dataConsulta = new Date(formData.get('data_consulta'));
    const dataFormatada = dataConsulta.toLocaleDateString('pt-BR');
    
    const consultaData = {
        data_consulta: dataFormatada,
        animal_id: formData.get('animal_id'),
        observacoes: formData.get('observacoes'),
        medicamentos_procedimentos: formData.get('medicamentos_procedimentos')
    };
    
    try {
        const response = await fetch(`${API_BASE}/consultas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(consultaData)
        });
        
        if (response.ok) {
            clearForm('consulta-form');
            setCurrentDate();
            await loadConsultas();
            showSuccess('Consulta registrada com sucesso!');
        } else {
            const error = await response.json();
            showError('form-error', error.error);
        }
    } catch (error) {
        showError('form-error', 'Erro ao salvar consulta');
    }
}

async function deleteConsulta(id) {
    if (confirm('Tem certeza que deseja excluir esta consulta?')) {
        try {
            const response = await fetch(`${API_BASE}/consultas/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await loadConsultas();
                showSuccess('Consulta excluída com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao excluir consulta:', error);
        }
    }
}

// Funções utilitárias
function clearForm(formId) {
    document.getElementById(formId).reset();
    if (formId === 'medicamento-form') {
        document.getElementById('med-valor-venda').value = '';
    }
    if (formId === 'consulta-form') {
        setCurrentDate();
        document.getElementById('consulta-proprietario').value = '';
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert('Erro: ' + message);
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function showSuccess(message) {
    // Criar elemento de sucesso temporário
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.position = 'fixed';
    successDiv.style.top = '20px';
    successDiv.style.right = '20px';
    successDiv.style.zIndex = '9999';
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        document.body.removeChild(successDiv);
    }, 3000);
}

