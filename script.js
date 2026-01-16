// Dados do sistema
let dados = {
    metas: JSON.parse(localStorage.getItem('pdi_metas') || '[]'),
    atividades: JSON.parse(localStorage.getItem('pdi_atividades') || '[]'),
    feedbacks: JSON.parse(localStorage.getItem('pdi_feedbacks') || '[]'),
    autoavaliacoes: JSON.parse(localStorage.getItem('pdi_autoavaliacoes') || '[]'),
    notas: JSON.parse(localStorage.getItem('pdi_notas') || '[]')
};

// Navegação
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    renderizarMetas();
    renderizarAtividades();
    renderizarFeedbacks();
    renderizarNotas();
    atualizarEvolucaoChart();
    atualizarEstatisticas();
});

function inicializarEventos() {
    // Formulário de metas
    document.getElementById('metaForm').addEventListener('submit', function(e) {
        e.preventDefault();
        adicionarMeta();
    });

    // Formulário de atividades
    document.getElementById('atividadeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        adicionarAtividade();
    });

    // Formulário de feedbacks
    document.getElementById('feedbackForm').addEventListener('submit', function(e) {
        e.preventDefault();
        adicionarFeedback();
    });

    // Formulário de autoavaliação
    document.getElementById('autoavaliacaoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        adicionarAutoavaliacao();
    });

    // Formulário de notas
    document.getElementById('notaForm').addEventListener('submit', function(e) {
        e.preventDefault();
        adicionarNota();
    });

    // Sliders de autoavaliação
    ['comunicacao', 'lideranca', 'tecnica', 'estrategica'].forEach(comp => {
        const slider = document.getElementById(comp + 'Score');
        const value = document.getElementById(comp + 'Value');
        slider.addEventListener('input', () => value.textContent = slider.value);
    });
}

// Gestão de Metas
function adicionarMeta() {
    const meta = {
        id: Date.now(),
        titulo: document.getElementById('metaTitulo').value,
        descricao: document.getElementById('metaDescricao').value,
        competencia: document.getElementById('metaCompetencia').value,
        dataInicio: document.getElementById('metaInicio').value,
        prazo: document.getElementById('metaPrazo').value,
        status: 'pendente',
        dataCriacao: new Date().toISOString().split('T')[0]
    };

    dados.metas.push(meta);
    salvarDados();
    renderizarMetas();
    atualizarEstatisticas();
    document.getElementById('metaForm').reset();
}

function renderizarMetas() {
    const container = document.getElementById('metasList');
    container.innerHTML = '';

    dados.metas.forEach(meta => {
        const div = document.createElement('div');
        div.className = `item ${meta.status}`;
        
        // Calcular tempo decorrido
        const inicio = new Date(meta.dataInicio);
        const prazo = new Date(meta.prazo);
        const conclusao = meta.dataConclusao ? new Date(meta.dataConclusao) : new Date();
        
        const tempoTotal = Math.ceil((prazo - inicio) / (1000 * 60 * 60 * 24));
        const tempoDecorrido = Math.ceil((conclusao - inicio) / (1000 * 60 * 60 * 24));
        
        let infoTempo = '';
        if (meta.status === 'concluida') {
            const antecipacao = tempoTotal - tempoDecorrido;
            infoTempo = antecipacao > 0 ? 
                `<span style="color: #27ae60;">Concluída ${antecipacao} dias antes do prazo</span>` :
                antecipacao < 0 ? 
                `<span style="color: #e74c3c;">Concluída ${Math.abs(antecipacao)} dias após o prazo</span>` :
                `<span style="color: #3498db;">Concluída no prazo</span>`;
        } else {
            infoTempo = `${tempoDecorrido}/${tempoTotal} dias`;
        }
        
        div.innerHTML = `
            <h4>${meta.titulo}</h4>
            <p>${meta.descricao}</p>
            <div class="meta-info">
                <span class="competencia-tag ${meta.competencia}">${formatarCompetencia(meta.competencia)}</span>
                <span>Início: ${formatarData(meta.dataInicio)} | Prazo: ${formatarData(meta.prazo)}</span>
                <span>${infoTempo}</span>
                <div>
                    ${meta.status === 'pendente' ? `<button class="status-btn andamento" onclick="iniciarMeta(${meta.id})">Iniciar</button>` : ''}
                    ${meta.status !== 'concluida' ? `<button class="status-btn concluir" onclick="concluirMeta(${meta.id})">Concluir</button>` : ''}
                    <button class="status-btn excluir" onclick="excluirMeta(${meta.id})">Excluir</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function concluirMeta(id) {
    const meta = dados.metas.find(m => m.id === id);
    if (meta) {
        meta.status = 'concluida';
        meta.dataConclusao = new Date().toISOString().split('T')[0];
        salvarDados();
        renderizarMetas();
        atualizarEstatisticas();
    }
}

function iniciarMeta(id) {
    const meta = dados.metas.find(m => m.id === id);
    if (meta) {
        meta.status = 'andamento';
        salvarDados();
        renderizarMetas();
        atualizarEstatisticas();
    }
}

function atualizarEstatisticas() {
    const metasConcluidas = dados.metas.filter(m => m.status === 'concluida').length;
    const feedbacksRecebidos = dados.feedbacks.length;
    const metasAndamento = dados.metas.filter(m => m.status === 'andamento').length;
    
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    const atividadesMes = dados.atividades.filter(a => {
        const dataAtiv = new Date(a.data);
        return dataAtiv.getMonth() === mesAtual && dataAtiv.getFullYear() === anoAtual;
    }).length;
    
    document.getElementById('metasConcluidas').textContent = metasConcluidas;
    document.getElementById('feedbacksRecebidos').textContent = feedbacksRecebidos;
    document.getElementById('metasAndamento').textContent = metasAndamento;
    document.getElementById('atividadesMes').textContent = atividadesMes;
    
    atualizarAtividadesRecentes();
    atualizarGraficoVisaoGeral();
    atualizarGraficoProgresso();
}

function atualizarGraficoVisaoGeral() {
    const ctx = document.getElementById('overviewChart');
    if (!ctx) return;
    
    const totalMetas = dados.metas.length;
    const totalAtividades = dados.atividades.length;
    const totalFeedbacks = dados.feedbacks.length;
    const totalAutoavaliacoes = dados.autoavaliacoes.length;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Metas', 'Atividades', 'Feedbacks', 'Autoavaliações'],
            datasets: [{
                label: 'Total de Registros',
                data: [totalMetas, totalAtividades, totalFeedbacks, totalAutoavaliacoes],
                backgroundColor: ['#3498db', '#27ae60', '#f39c12', '#9b59b6'],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function atualizarGraficoProgresso() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;
    
    const metasConcluidas = dados.metas.filter(m => m.status === 'concluida').length;
    const metasAndamento = dados.metas.filter(m => m.status === 'andamento').length;
    const metasPendentes = dados.metas.filter(m => m.status === 'pendente').length;
    const totalMetas = dados.metas.length;
    
    const percentualConcluidas = totalMetas > 0 ? Math.round((metasConcluidas / totalMetas) * 100) : 0;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Concluídas', 'Em Andamento', 'Pendentes'],
            datasets: [{
                data: [metasConcluidas, metasAndamento, metasPendentes],
                backgroundColor: ['#27ae60', '#f39c12', '#e74c3c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '60%'
        },
        plugins: [{
            beforeDraw: function(chart) {
                const width = chart.width;
                const height = chart.height;
                const ctx = chart.ctx;
                
                ctx.restore();
                const fontSize = (height / 114).toFixed(2);
                ctx.font = fontSize + "em sans-serif";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#2c3e50";
                
                const text = percentualConcluidas + "%";
                const textX = Math.round((width - ctx.measureText(text).width) / 2);
                const textY = height / 2;
                
                ctx.fillText(text, textX, textY);
                ctx.save();
            }
        }]
    });
}

function excluirMeta(id) {
    dados.metas = dados.metas.filter(m => m.id !== id);
    salvarDados();
    renderizarMetas();
    atualizarEstatisticas();
}

// Gestão de Atividades
function adicionarAtividade() {
    const atividade = {
        id: Date.now(),
        titulo: document.getElementById('atividadeTitulo').value,
        descricao: document.getElementById('atividadeDescricao').value,
        competencia: document.getElementById('atividadeCompetencia').value,
        data: document.getElementById('atividadeData').value
    };

    dados.atividades.push(atividade);
    salvarDados();
    renderizarAtividades();
    atualizarEstatisticas();
    document.getElementById('atividadeForm').reset();
}

function renderizarAtividades() {
    const container = document.getElementById('atividadesList');
    container.innerHTML = '';

    dados.atividades.slice(-10).reverse().forEach(atividade => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
            <h4>${atividade.titulo}</h4>
            <p>${atividade.descricao}</p>
            <div class="meta-info">
                <span class="competencia-tag ${atividade.competencia}">${formatarCompetencia(atividade.competencia)}</span>
                <span>${formatarData(atividade.data)}</span>
                <button class="status-btn excluir" onclick="excluirAtividade(${atividade.id})">Excluir</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function excluirAtividade(id) {
    dados.atividades = dados.atividades.filter(a => a.id !== id);
    salvarDados();
    renderizarAtividades();
}

// Gestão de Feedbacks
function adicionarFeedback() {
    const feedback = {
        id: Date.now(),
        origem: document.getElementById('feedbackOrigem').value,
        competencia: document.getElementById('feedbackCompetencia').value,
        texto: document.getElementById('feedbackTexto').value,
        tipo: document.getElementById('feedbackTipo').value,
        data: document.getElementById('feedbackData').value
    };

    dados.feedbacks.push(feedback);
    salvarDados();
    renderizarFeedbacks();
    atualizarEstatisticas();
    document.getElementById('feedbackForm').reset();
}

function renderizarFeedbacks() {
    const container = document.getElementById('feedbacksList');
    container.innerHTML = '';

    dados.feedbacks.slice(-10).reverse().forEach(feedback => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
            <h4>Feedback de ${feedback.origem}</h4>
            <p>${feedback.texto}</p>
            <div class="meta-info">
                <span class="competencia-tag ${feedback.competencia}">${formatarCompetencia(feedback.competencia)}</span>
                <span class="competencia-tag ${feedback.tipo}">${feedback.tipo}</span>
                <span>${formatarData(feedback.data)}</span>
                <button class="status-btn excluir" onclick="excluirFeedback(${feedback.id})">Excluir</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function excluirFeedback(id) {
    dados.feedbacks = dados.feedbacks.filter(f => f.id !== id);
    salvarDados();
    renderizarFeedbacks();
}

// Gestão de Notas
function adicionarNota() {
    const nota = {
        id: Date.now(),
        titulo: document.getElementById('notaTitulo').value,
        conteudo: document.getElementById('notaConteudo').value,
        categoria: document.getElementById('notaCategoria').value,
        data: document.getElementById('notaData').value
    };

    dados.notas.push(nota);
    salvarDados();
    renderizarNotas();
    document.getElementById('notaForm').reset();
}

function renderizarNotas() {
    const container = document.getElementById('notasList');
    container.innerHTML = '';

    dados.notas.slice(-10).reverse().forEach(nota => {
        const div = document.createElement('div');
        div.className = 'item';
        div.innerHTML = `
            <h4>${nota.titulo}</h4>
            <p>${nota.conteudo}</p>
            <div class="meta-info">
                <span class="competencia-tag ${nota.categoria}">${formatarCategoria(nota.categoria)}</span>
                <span>${formatarData(nota.data)}</span>
                <button class="status-btn excluir" onclick="excluirNota(${nota.id})">Excluir</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function excluirNota(id) {
    dados.notas = dados.notas.filter(n => n.id !== id);
    salvarDados();
    renderizarNotas();
}

function formatarCategoria(categoria) {
    const map = {
        'geral': 'Geral',
        'reuniao': 'Reunião',
        'aprendizado': 'Aprendizado',
        'ideia': 'Ideia',
        'reflexao': 'Reflexão'
    };
    return map[categoria] || categoria;
}

// Autoavaliação
function adicionarAutoavaliacao() {
    const autoavaliacao = {
        id: Date.now(),
        data: new Date().toISOString().split('T')[0],
        comunicacao: parseInt(document.getElementById('comunicacaoScore').value),
        lideranca: parseInt(document.getElementById('liderancaScore').value),
        tecnica: parseInt(document.getElementById('tecnicaScore').value),
        estrategica: parseInt(document.getElementById('estrategicaScore').value),
        observacoes: document.getElementById('autoavaliacaoObservacoes').value
    };

    dados.autoavaliacoes.push(autoavaliacao);
    salvarDados();
    atualizarEvolucaoChart();
    document.getElementById('autoavaliacaoForm').reset();
    
    // Reset sliders
    ['comunicacao', 'lideranca', 'tecnica', 'estrategica'].forEach(comp => {
        document.getElementById(comp + 'Score').value = 3;
        document.getElementById(comp + 'Value').textContent = 3;
    });
}

// Variáveis para controlar os gráficos
let metasChart = null;
// Dashboard - apenas estatísticas

function atualizarAtividadesRecentes() {
    const container = document.getElementById('recentActivities');
    if (!container) return;
    
    const recentes = [...dados.atividades, ...dados.feedbacks, ...dados.metas.filter(m => m.status === 'concluida')]
        .sort((a, b) => new Date(b.data || b.dataConclusao || b.dataCriacao) - new Date(a.data || a.dataConclusao || a.dataCriacao))
        .slice(0, 5);

    if (recentes.length === 0) {
        container.innerHTML = '<div class="recent-item">Nenhuma atividade recente</div>';
        return;
    }

    container.innerHTML = recentes.map(item => {
        const tipo = item.origem ? 'Feedback' : item.titulo ? 'Meta' : 'Atividade';
        const titulo = item.titulo || item.origem || 'Atividade';
        return `<div class="recent-item">${tipo}: ${titulo}</div>`;
    }).join('');
}

function atualizarEvolucaoChart() {
    const ctx = document.getElementById('evolucaoChart').getContext('2d');
    
    if (dados.autoavaliacoes.length === 0) return;

    const labels = dados.autoavaliacoes.map(a => formatarData(a.data));
    const competencias = ['comunicacao', 'lideranca', 'tecnica', 'estrategica'];
    const cores = ['#e74c3c', '#f39c12', '#3498db', '#9b59b6'];

    const datasets = competencias.map((comp, index) => ({
        label: formatarCompetencia(comp),
        data: dados.autoavaliacoes.map(a => a[comp]),
        borderColor: cores[index],
        backgroundColor: cores[index] + '20',
        tension: 0.1
    }));

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    min: 1,
                    max: 5
                }
            }
        }
    });
}

// Consulta Inteligente
function processarConsulta() {
    const consulta = document.getElementById('consultaInput').value.toLowerCase();
    const resultado = document.getElementById('resultadoConsulta');
    
    let resposta = '';

    if (consulta.includes('metas') && consulta.includes('concluí')) {
        const metasConcluidas = dados.metas.filter(m => m.status === 'concluida');
        if (consulta.includes('trimestre')) {
            const tresMesesAtras = new Date();
            tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
            const metasTrimestrais = metasConcluidas.filter(m => 
                new Date(m.dataConclusao) >= tresMesesAtras
            );
            resposta = `Você concluiu ${metasTrimestrais.length} metas neste trimestre: ${metasTrimestrais.map(m => m.titulo).join(', ')}`;
        } else {
            resposta = `Você concluiu ${metasConcluidas.length} metas no total: ${metasConcluidas.map(m => m.titulo).join(', ')}`;
        }
    } else if (consulta.includes('feedback') && consulta.includes('liderança')) {
        const feedbacksLideranca = dados.feedbacks.filter(f => f.competencia === 'lideranca');
        resposta = `Você recebeu ${feedbacksLideranca.length} feedbacks sobre liderança: ${feedbacksLideranca.map(f => `"${f.texto}" - ${f.origem}`).join('; ')}`;
    } else if (consulta.includes('atividades')) {
        const atividadesRecentes = dados.atividades.slice(-5);
        resposta = `Suas últimas 5 atividades: ${atividadesRecentes.map(a => a.titulo).join(', ')}`;
    } else {
        resposta = 'Desculpe, não entendi sua consulta. Tente perguntas como: "Quais metas concluí este trimestre?" ou "Quais feedbacks recebi sobre liderança?"';
    }

    resultado.innerHTML = `<p>${resposta}</p>`;
}

// Relatórios
function gerarRelatorioMensal() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Relatório Mensal - PDI', 20, 30);
    
    doc.setFontSize(12);
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    // Metas do mês
    const metasMes = dados.metas.filter(m => {
        const dataMeta = new Date(m.dataCriacao);
        return dataMeta.getMonth() === mesAtual && dataMeta.getFullYear() === anoAtual;
    });
    
    doc.text(`Metas criadas este mês: ${metasMes.length}`, 20, 50);
    doc.text(`Metas concluídas: ${metasMes.filter(m => m.status === 'concluida').length}`, 20, 60);
    
    // Atividades do mês
    const atividadesMes = dados.atividades.filter(a => {
        const dataAtiv = new Date(a.data);
        return dataAtiv.getMonth() === mesAtual && dataAtiv.getFullYear() === anoAtual;
    });
    
    doc.text(`Atividades registradas: ${atividadesMes.length}`, 20, 80);
    
    // Feedbacks do mês
    const feedbacksMes = dados.feedbacks.filter(f => {
        const dataFeed = new Date(f.data);
        return dataFeed.getMonth() === mesAtual && dataFeed.getFullYear() === anoAtual;
    });
    
    doc.text(`Feedbacks recebidos: ${feedbacksMes.length}`, 20, 90);
    
    doc.save('relatorio-mensal-pdi.pdf');
}

function gerarRelatorioCompetencias() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Relatório de Competências - PDI', 20, 30);
    
    doc.setFontSize(12);
    const competencias = ['comunicacao', 'lideranca', 'tecnica', 'estrategica'];
    
    let y = 50;
    competencias.forEach(comp => {
        const atividades = dados.atividades.filter(a => a.competencia === comp).length;
        const feedbacks = dados.feedbacks.filter(f => f.competencia === comp).length;
        
        doc.text(`${formatarCompetencia(comp)}:`, 20, y);
        doc.text(`  Atividades: ${atividades}`, 30, y + 10);
        doc.text(`  Feedbacks: ${feedbacks}`, 30, y + 20);
        y += 40;
    });
    
    doc.save('relatorio-competencias-pdi.pdf');
}

function gerarRelatorioEvolucao() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Relatório de Evolução - PDI', 20, 30);
    
    doc.setFontSize(12);
    if (dados.autoavaliacoes.length > 0) {
        const ultima = dados.autoavaliacoes[dados.autoavaliacoes.length - 1];
        const primeira = dados.autoavaliacoes[0];
        
        doc.text('Evolução das Competências:', 20, 50);
        doc.text(`Comunicação: ${primeira.comunicacao} → ${ultima.comunicacao}`, 20, 70);
        doc.text(`Liderança: ${primeira.lideranca} → ${ultima.lideranca}`, 20, 80);
        doc.text(`Técnica: ${primeira.tecnica} → ${ultima.tecnica}`, 20, 90);
        doc.text(`Estratégica: ${primeira.estrategica} → ${ultima.estrategica}`, 20, 100);
    } else {
        doc.text('Nenhuma autoavaliação registrada ainda.', 20, 50);
    }
    
    doc.save('relatorio-evolucao-pdi.pdf');
}

// Utilitários
function formatarCompetencia(comp) {
    const map = {
        'comunicacao': 'Comunicação',
        'lideranca': 'Liderança',
        'tecnica': 'Habilidades Técnicas',
        'estrategica': 'Visão Estratégica'
    };
    return map[comp] || comp;
}

function formatarData(data) {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

function salvarDados() {
    localStorage.setItem('pdi_metas', JSON.stringify(dados.metas));
    localStorage.setItem('pdi_atividades', JSON.stringify(dados.atividades));
    localStorage.setItem('pdi_feedbacks', JSON.stringify(dados.feedbacks));
    localStorage.setItem('pdi_autoavaliacoes', JSON.stringify(dados.autoavaliacoes));
    localStorage.setItem('pdi_notas', JSON.stringify(dados.notas));
}
