/* LOOP core — domínio, regras, portas e adapters locais. Sem UI. Sem IA de runtime. */
(function () {
  const BPM = {"phases":[{"id":"A","tag":"E0 → A → E1","title":"Preparação e pré-venda","sub":"Ponto de partida e personalização V0","steps":[1,2,3],"output":"E1 · Template + OS/pesquisa + LOOP V0 personalizados","condition":"Base de demonstração preparada"},{"id":"B","tag":"B → E2","title":"Diagnóstico e demonstração","sub":"As 9 questões e o demo antes da venda","steps":[4,5,6],"gate":"G1","output":"E2 · LOOP V1 funcional + 1ª reunião com demo","condition":"Interesse comercial validado e venda fechada"},{"id":"C","tag":"C → E3","title":"Contratação e desenho","sub":"Aprovação, escopo e engenharia","steps":[7,8,9],"gate":"G2","output":"E3 · Escopo, contrato, requisitos e stack definidos","condition":"Condições comerciais e escopo aprovados"},{"id":"D","tag":"D","title":"Planejamento e sinal verde","sub":"Segurança, testes e pacote formal para o cliente","steps":[10,11],"gate":"G3","output":"Pacote formal · testes, segurança, cronograma e arquitetura","condition":"Sinal verde explícito do cliente"},{"id":"X","tag":"X12","title":"Implementação","sub":"Plano + 3 fases + validação técnica","steps":[12,13,14,15,16,17,18],"gate":"G4","output":"Aplicativo funcional + testes e evidências de qualidade","condition":"Critérios técnicos, riscos e segurança aprovados"},{"id":"Y","tag":"Y","title":"Entrega, ajustes e manutenção","sub":"Handoff, feedback, correções e documentação final","steps":[19,20,21,22],"gate":"G5","output":"Aceite do cliente + manutenção + case autorizado (se aplicável)","condition":"Aceite registrado; pendências tratadas"},{"id":"Z","tag":"Z","title":"Encerramento e reinício","sub":"Aprendizado de um ciclo para o próximo","steps":[23],"output":"Template atualizado e projeto seguinte liberado","condition":"Lições aprendidas e encerramento registrados"}],"steps":[{"n":1,"title":"LOOP Plataforma — template mestre","owner":"C","caption":"Schema padrão","desc":"Preparar o método reutilizável de atendimento e a estrutura base da plataforma.","input":"Biblioteca de métodos, processo de consultoria, padrões de modelagem.","action":"Configurar o schema, os campos, os modelos de processo, papéis e critérios.","output":"LOOP Template / esquema master.","accept":"Template versionado e aplicável a novos clientes.","automation":"Agente de documentação pode estruturar os modelos."},{"n":2,"title":"1ª ordem de serviço + pesquisa","owner":"C","caption":"Projeto do cliente · ≈10 páginas","desc":"Construir a primeira hipótese estruturada do projeto antes da reunião.","input":"Briefing inicial, dados públicos e informações disponibilizadas.","action":"Pesquisar operação, problema, contexto, objetivo, prioridades e oportunidades.","output":"Primeira OS + documento de pesquisa/projeto (cerca de 10 páginas).","accept":"Escopo preliminar, premissas e lacunas explicitados.","automation":"Agentes de pesquisa, triagem e extração podem apoiar."},{"n":3,"title":"LOOP V0 + diagrama funcional","owner":"P","caption":"Protótipo personalizado","desc":"Personalizar a plataforma para uma demonstração inicial específica.","input":"Template mestre e pesquisa da OS.","action":"Modelar atores, processos, informação, pontos de fricção e diagrama V0.","output":"LOOP personalizado com diagrama funcional V0.","accept":"Fluxo principal navegável e hipóteses identificadas.","automation":"Assistente de modelagem organiza dados e fluxos."},{"n":4,"title":"9 questões → 3 macroentregáveis","owner":"C","caption":"Descoberta estruturada","desc":"Selecionar nove perguntas prioritárias distribuídas em três entregáveis principais.","input":"Problemas preliminares, dados da pesquisa e objetivos do negócio.","action":"Eleger as perguntas que sustentam diagnóstico, arquitetura e cenários.","output":"Matriz 9 × 3 com perguntas, entregáveis e hipóteses.","accept":"Cobertura de problema, operação e solução sem redundâncias.","automation":"Agente Q&A sugere perguntas e evidencia lacunas."},{"n":5,"title":"LOOP V1 — demo funcional","owner":"P","caption":"Dados reais + fictícios sinalizados","desc":"Unificar a análise num protótipo funcional para demonstrar valor antes do contrato.","input":"LOOP V0, matriz 9 × 3, dados reais disponíveis e exemplos hipotéticos.","action":"Configurar visualizações e fluxo do orquestrador/agentes; distinguir dados de demonstração.","output":"LOOP V1 com processos, agentes e cenários demonstráveis.","accept":"Demo executável, sem apresentar ficção como dado do cliente.","automation":"Orquestrador conecta triagem, extração, rascunhos e Q&A."},{"n":6,"title":"1ª reunião + demonstração","owner":"H","caption":"Momento comercial","desc":"Mostrar o modelo funcional logo no primeiro contato de apresentação.","input":"LOOP V1, hipótese de valor, roteiro de demo e perguntas prioritárias.","action":"Apresentar o antes/depois, demonstrar agentes e validar problemas com o cliente.","output":"Feedback, restrições, interesse e decisão comercial.","accept":"Venda formalmente confirmada ou próximo encaminhamento definido.","automation":"Registro da reunião e resumo estruturado podem ser assistidos."},{"n":7,"title":"Template LOOP de aprovação","owner":"C","caption":"Abertura de contratação","desc":"Converter a proposta em itens verificáveis para aprovação.","input":"Decisão comercial e feedback da primeira reunião.","action":"Montar a matriz de aprovações, responsáveis, entregas e condições.","output":"Template de aprovação do projeto.","accept":"Responsáveis e critérios de aceite nomeados.","automation":"Agente de rascunho organiza a minuta."},{"n":8,"title":"Contrato + cronograma + requisitos","owner":"H","caption":"Compromisso formal","desc":"Formalizar o acordo, as restrições e os critérios de entrega.","input":"Template de aprovação, proposta e requisitos validados.","action":"Definir escopo, prazos, preço, responsabilidades, dependências e mudanças.","output":"Contrato, cronograma, backlog inicial e requisitos.","accept":"Assinaturas, orçamento e escopo aprovados.","automation":"Extração e geração assistida de documentação."},{"n":9,"title":"Definir stack e engenharia","owner":"T","caption":"Arquitetura técnica","desc":"Estabelecer as tecnologias e o desenho de solução necessários.","input":"Requisitos, integração de dados, perfis e controles de acesso.","action":"Definir arquitetura do app, IA/orquestrador, APIs, banco de dados e infraestrutura.","output":"ADR, stack, arquitetura e plano técnico.","accept":"Viabilidade, custo e riscos técnicos revisados.","automation":"Agente técnico auxilia análise de opções."},{"n":10,"title":"Plano de testes e segurança","owner":"T","caption":"Qualidade por desenho","desc":"Definir verificação de requisitos, riscos e controles antes da construção.","input":"Arquitetura, dados, requisitos e dependências externas.","action":"Planejar testes funcionais, autorização, privacidade, carga, resiliência e logs.","output":"Plano de testes + segurança + critérios de liberação.","accept":"Casos críticos e responsabilidades de verificação documentados.","automation":"Geração de casos de teste e checklists."},{"n":11,"title":"Pacote formal para sinal verde","owner":"C","caption":"Envio de versão consolidada","desc":"Formalizar e submeter tudo que foi definido para autorizar a execução.","input":"Contrato, cronograma, requisitos, stack e plano de qualidade.","action":"Consolidar documentação, dependências e anexos em pacote versionado.","output":"Primeira versão formal enviada ao cliente.","accept":"Sinal verde explícito e eventuais ressalvas registradas.","automation":"Agente de rascunho e checklist de completude."},{"n":12,"title":"Plano de implementação","owner":"C","caption":"Início X12","desc":"Decompor o projeto autorizado em entregas realizáveis.","input":"Pacote aprovado, prioridades, equipe e capacidade.","action":"Planejar fases, recursos, marcos, responsáveis, custo e dependências.","output":"Plano de implementação com roadmap.","accept":"Recursos, datas-alvo e indicadores de controle aceitos.","automation":"Assistente pode propor sequenciamento e riscos."},{"n":13,"title":"LOOP Template — implementação","owner":"P","caption":"Blueprint de execução","desc":"Aplicar o template padronizado de execução do projeto.","input":"Plano e arquitetura técnicos aprovados.","action":"Configurar ambientes, rituais, rastreabilidade, artefatos e checklists de entrega.","output":"Esquema de implementação instanciado.","accept":"Fases 1–3 com critérios de conclusão estabelecidos.","automation":"Orquestrador pode acompanhar status e dependências."},{"n":14,"title":"Fase 1 — fundações","owner":"T","caption":"Construção","desc":"Implantar as bases técnicas e de dados do aplicativo.","input":"Blueprint de implementação, infraestrutura e design de dados.","action":"Configurar autenticação, perfis, dados e estrutura central.","output":"Base técnica funcional e verificável.","accept":"Testes da fundação e perfis essenciais aprovados.","automation":"Testes e verificações de qualidade assistidos."},{"n":15,"title":"Fase 2 — processos e agentes","owner":"T","caption":"Construção","desc":"Implementar os fluxos de trabalho, automações e agentes especializados.","input":"Base técnica, diagramas de processo e definições dos agentes.","action":"Implementar triagem, extração, rascunhos, Q&A, orquestrador e integrações.","output":"Workflows operacionais e agentes conectados.","accept":"Casos de ponta a ponta e controles humanos aprovados.","automation":"Execução supervisionada do orquestrador."},{"n":16,"title":"Fase 3 — interfaces e integração","owner":"T","caption":"Construção","desc":"Consolidar a experiência do usuário e os dados da operação.","input":"Fluxos operacionais, perfis, wireframes e integrações.","action":"Finalizar telas por perfil, dashboards, alertas, permissões e dados reais.","output":"Aplicativo candidato à entrega.","accept":"Jornadas prioritárias e requisitos de UX validados.","automation":"Agentes expostos em interfaces e logs auditáveis."},{"n":17,"title":"Template LOOP de entrega","owner":"C","caption":"Preparação de release","desc":"Montar o pacote de transferência e os registros de entrega.","input":"Aplicativo candidato, requisitos e evidências de implementação.","action":"Consolidar manual, versionamento, checklists, instruções e ambiente.","output":"Pacote de entrega técnica e operacional.","accept":"Artefatos, responsáveis e pendências visíveis.","automation":"Agente de documentação consolida o material."},{"n":18,"title":"Riscos, stress test e observabilidade","owner":"T","caption":"Validação de liberação","desc":"Aplicar o plano de testes em condições representativas e verificar a operação.","input":"Ambiente de teste, plano de segurança, cenários críticos e métricas.","action":"Executar testes, medir falhas, latência, logs, rastreabilidade e recuperação.","output":"Relatório de testes, riscos e go/no-go técnico.","accept":"Critérios de liberação atingidos ou correções priorizadas.","automation":"Monitorização e triagem de incidentes assistidas."},{"n":19,"title":"Handoff e entrega ao cliente","owner":"H","caption":"Transferência operacional","desc":"Entregar a solução para os usuários e responsáveis operacionais.","input":"Release aprovado, documentos, formação e acessos.","action":"Apresentar o sistema, treinar utilizadores e transferir controles.","output":"Handoff, acessos, formação e aceite inicial.","accept":"Cliente opera tarefas críticas com suporte previsto.","automation":"Agente Q&A de apoio ao utilizador."},{"n":20,"title":"Redo — feedback interativo","owner":"H","caption":"Loop de ajustes","desc":"Captar feedback e corrigir lacunas identificadas na adoção.","input":"Uso real, erros, feedback e pedidos de alteração.","action":"Classificar como bug, melhoria ou mudança de escopo e reencaminhar.","output":"Backlog de correções e aceite pós-ajustes.","accept":"Pendências críticas concluídas ou formalmente aceitas.","automation":"Agente de triagem classifica feedback; orquestrador encaminha."},{"n":21,"title":"Plano final e manutenção","owner":"C","caption":"Operação sustentada","desc":"Concluir o trabalho com suporte e governança definidos.","input":"Aceite, métricas de desempenho e riscos residuais.","action":"Definir SLA, monitorização, atualizações, suporte, custos e roadmap futuro.","output":"Plano final de manutenção e fechamento operacional.","accept":"Cliente conhece custos, responsáveis e forma de suporte.","automation":"Alertas, observabilidade e relatórios automatizados."},{"n":22,"title":"Case, portfólio e feedback","owner":"C","caption":"Capitalizar aprendizado","desc":"Transformar resultados em material público apenas com autorização.","input":"Indicadores antes/depois, depoimento e condições de confidencialidade.","action":"Obter consentimento, redigir case, recolher feedback e selecionar evidências.","output":"Case autorizado, publicação ou apenas registro interno.","accept":"Consentimento explícito para qualquer informação pública.","automation":"Agente de rascunho prepara conteúdo sujeito à revisão."},{"n":23,"title":"Pronto para o próximo projeto","owner":"C","caption":"Z · Encerramento","desc":"Encerrar o ciclo e melhorar o padrão reutilizável.","input":"Case interno, lições aprendidas, custos reais, artefatos e feedback.","action":"Atualizar templates, arquivar, aferir qualidade e liberar novo ciclo.","output":"Projeto encerrado e LOOP master evoluído.","accept":"Checklist de encerramento concluída.","automation":"Resumo de aprendizado alimenta a base de conhecimento."}],"gates":[{"id":"G1","title":"Venda fechada?","after":6,"yes":"Avançar para C / passo 7.","no":"Revisar perguntas/demo (4–6), negociar ou encerrar a oportunidade.","evidence":"Confirmação comercial, próximos termos e registro da decisão."},{"id":"G2","title":"Contrato, requisitos e escopo aprovados?","after":9,"yes":"Seguir para D / passo 10.","no":"Ajustar contrato e requisitos (7–9).","evidence":"Aceite comercial, requisitos e restrições documentados."},{"id":"G3","title":"Cliente deu sinal verde?","after":11,"yes":"Iniciar X12 / passo 12.","no":"Revisar o pacote de definição (8–11) e reenviar.","evidence":"Autorização explícita para iniciar implementação."},{"id":"G4","title":"Testes e segurança aprovados?","after":18,"yes":"Executar handoff / passo 19.","no":"Corrigir nas fases 14–16 e repetir validação (18).","evidence":"Evidências de testes, métricas e riscos residuais aceitos."},{"id":"G5","title":"Cliente aceitou a entrega?","after":20,"yes":"Finalizar manutenção e aprendizado (21–23).","no":"Redo: priorizar ajustes e voltar às etapas de construção, testes ou formação aplicáveis.","evidence":"Aceite final ou lista formal de pendências."}]};
  const OWNERS = {
    C: { label: 'CONSULTOR', lane: 'Consultor', fg: '#505050', bg: '#ececec' },
    H: { label: 'CLIENTE', lane: 'Cliente / gestor', fg: '#335c9b', bg: '#edf3fc' },
    P: { label: 'LOOP / IA', lane: 'Plataforma / IA', fg: '#8055a7', bg: '#f4edf9' },
    T: { label: 'ENGENHARIA', lane: 'Engenharia', fg: '#277b63', bg: '#eaf5f0' }
  };
  const STATUS = {
    unknown: { label: 'não informado', fg: '#696969', bg: '#fff', border: '1px dashed #b5b5b5' },
    informed: { label: 'informado', fg: '#171717', bg: '#f2f2f2', border: '1px solid #e4e4e4' },
    hypothesis: { label: 'hipótese', fg: '#8055a7', bg: '#f4edf9', border: '1px solid #e2d3ee' },
    restricted: { label: 'restrito', fg: '#c93038', bg: '#fff0f1', border: '1px solid #f4d8da' },
    confirmed: { label: 'confirmado', fg: '#277b63', bg: '#eaf5f0', border: '1px solid #cfe6dc' }
  };
  const PHASES3 = [{ id: 'A', title: 'Contexto' }, { id: 'B', title: 'Operação' }, { id: 'C', title: 'Avaliação' }];
  const BLOCKS = [
    { id: 'B01', phase: 'A', title: 'Objetivo e fronteira', qs: ['Qual é o objetivo principal do projeto?', 'O que está dentro e fora da fronteira analisada?'] },
    { id: 'B02', phase: 'A', title: 'Pessoas e funções', qs: ['Quem decide sobre mudanças na operação?'] },
    { id: 'B03', phase: 'A', title: 'Ferramentas e canais', qs: ['Quais ferramentas e canais a operação usa hoje?'] },
    { id: 'B04', phase: 'B', title: 'Evento e volume', qs: ['Qual evento inicia o processo?', 'Qual é o volume por período (com unidade)?'] },
    { id: 'B05', phase: 'B', title: 'Atividades e transferências', qs: ['Onde ocorrem as transferências entre responsáveis?'] },
    { id: 'B06', phase: 'B', title: 'Decisões e exceções', qs: ['Quais decisões e exceções interrompem o fluxo?'] },
    { id: 'B07', phase: 'C', title: 'Indicadores de base', qs: ['Quais indicadores são medidos hoje (tempo, custo, qualidade)?'] },
    { id: 'B08', phase: 'C', title: 'Riscos e restrições', qs: ['Quais riscos e restrições limitam mudanças?'] },
    { id: 'B09', phase: 'C', title: 'Hipóteses e aprovação', qs: ['Quais hipóteses devem ser validadas e quem aprova?'] }
  ];
  const FACTS = [
    { key: 'spreadsheet', block: 'B03', label: 'Dados operacionais em planilha' },
    { key: 'multiChannel', block: 'B03', label: 'Múltiplos canais de entrada' },
    { key: 'crm', block: 'B03', label: 'CRM em uso' },
    { key: 'classifiableIntake', block: 'B04', label: 'Entradas classificáveis' },
    { key: 'trackingSources', block: 'B04', label: 'Fontes de acompanhamento com eventos relevantes' },
    { key: 'humanRouting', block: 'B05', label: 'Encaminhamento feito por pessoa' },
    { key: 'repetitiveDocs', block: 'B06', label: 'Documentos repetitivos preenchidos manualmente' }
  ];
  const TRI = { yes: 'sim', no: 'não', unknown: 'não informado' };
  const RETURN_TO = { G1: 4, G2: 7, G3: 8, G4: 14, G5: 20 };
  let seq = 0;
  const uid = p => p + '_' + Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 6);
  const clone = o => JSON.parse(JSON.stringify(o));

  function newProject(name) {
    const t = new Date().toISOString(), discovery = {}, facts = {}, gates = {};
    BLOCKS.forEach(b => { discovery[b.id] = b.qs.map((q, i) => ({ id: b.id + '_q' + (i + 1), text: q, answer: '', status: 'unknown', custom: false })); });
    FACTS.forEach(f => { facts[f.key] = 'unknown'; });
    BPM.gates.forEach(g => { gates[g.id] = 'pending'; });
    return { id: uid('prj'), name: name, version: 1, status: 'draft', archived: false, isDemo: false, createdAt: t, updatedAt: t,
      discovery: discovery, facts: facts, people: [], activities: [],
      scenarios: { B: { name: 'Cenário B · intervenção', kind: 'intervention', ops: [] }, C: { name: 'Cenário C · alternativa', kind: 'alternative', ops: [] } },
      consulting: { currentStep: 1, gates: gates }, portalReview: 'pending' };
  }
  function setQ(p, b, i, answer, status) { p.discovery[b][i].answer = answer; p.discovery[b][i].status = status; }
  function seedDemo() {
    const p = newProject('Operação Exemplo · dados de exemplo');
    p.id = 'demo'; p.isDemo = true;
    p.people = [
      { id: 'pe1', name: 'Direção', role: 'Decisão e prioridades', kind: 'pessoa', reportsTo: 'top' },
      { id: 'pe2', name: 'Coordenação de operações', role: 'Distribui e acompanha pedidos', kind: 'pessoa', reportsTo: 'pe1' },
      { id: 'pe3', name: 'Atendimento', role: 'Recebe e classifica solicitações', kind: 'equipe', reportsTo: 'pe1' },
      { id: 'pe4', name: 'Equipe de execução', role: 'Executa o serviço', kind: 'equipe', reportsTo: 'pe2' },
      { id: 'pe5', name: 'Financeiro', role: 'Emite documentos', kind: 'area', reportsTo: 'unknown' }
    ];
    p.activities = [
      { id: 'ac1', label: 'Receber solicitação', type: 'task', ownerId: 'pe3' },
      { id: 'ac2', label: 'Classificar pedido', type: 'task', ownerId: 'pe3' },
      { id: 'ac3', label: 'Encaminhar ao responsável', type: 'task', ownerId: 'pe2' },
      { id: 'ac4', label: 'Pedido completo?', type: 'gateway', ownerId: 'pe2' },
      { id: 'ac5', label: 'Executar serviço', type: 'task', ownerId: 'pe4' },
      { id: 'ac6', label: 'Emitir documento de conclusão', type: 'task', ownerId: 'pe5' }
    ];
    Object.assign(p.facts, { spreadsheet: 'yes', multiChannel: 'yes', classifiableIntake: 'yes', humanRouting: 'yes', repetitiveDocs: 'yes' });
    setQ(p, 'B01', 0, 'Mostrar a operação atual e comparar intervenções possíveis (exemplo fictício).', 'hypothesis');
    setQ(p, 'B03', 0, 'Planilha, e-mail e aplicativo de mensagens (exemplo fictício).', 'hypothesis');
    setQ(p, 'B04', 0, 'Solicitação recebida', 'hypothesis');
    p.consulting.currentStep = 5;
    return p;
  }
  function seedCleanSea() {
    const p = newProject('Clean Sea · template de descoberta');
    Object.assign(p.facts, { spreadsheet: 'yes', multiChannel: 'yes', trackingSources: 'yes', repetitiveDocs: 'yes' });
    setQ(p, 'B03', 0, 'Planilha, Forms e WhatsApp (material operacional fornecido). CRM não confirmado.', 'informed');
    setQ(p, 'B06', 0, 'Documentos D2/D3/D4 preenchidos manualmente (material operacional fornecido).', 'informed');
    return p;
  }

  function validateProject(o) {
    const e = [];
    if (!o || typeof o !== 'object' || Array.isArray(o)) return ['O arquivo não contém um objeto de projeto.'];
    if (typeof o.name !== 'string' || !o.name.trim()) e.push('Campo "name" ausente ou vazio.');
    if (!o.discovery || typeof o.discovery !== 'object') e.push('Campo "discovery" ausente.');
    else BLOCKS.forEach(b => { if (!Array.isArray(o.discovery[b.id])) e.push('Bloco ' + b.id + ' ausente em "discovery".'); else o.discovery[b.id].forEach((q, i) => { if (!q || typeof q.text !== 'string' || !STATUS[q.status]) e.push(b.id + ' pergunta ' + (i + 1) + ': texto ou estado inválido.'); }); });
    if (!Array.isArray(o.people)) e.push('Campo "people" deve ser uma lista.');
    if (!Array.isArray(o.activities)) e.push('Campo "activities" deve ser uma lista.');
    else o.activities.forEach((a, i) => { if (!a || !a.id || typeof a.label !== 'string' || (a.type !== 'task' && a.type !== 'gateway')) e.push('Atividade ' + (i + 1) + ' inválida.'); });
    if (!o.facts || typeof o.facts !== 'object') e.push('Campo "facts" ausente.');
    else FACTS.forEach(f => { if (!TRI[o.facts[f.key]]) e.push('Fato "' + f.key + '" deve ser yes, no ou unknown.'); });
    if (!o.scenarios || !o.scenarios.B || !Array.isArray(o.scenarios.B.ops) || !o.scenarios.C || !Array.isArray(o.scenarios.C.ops)) e.push('Cenários B e C ausentes ou inválidos.');
    if (!o.consulting || typeof o.consulting.currentStep !== 'number' || !o.consulting.gates) e.push('Campo "consulting" inválido.');
    return e;
  }
  function parseImport(text) {
    let o;
    try { o = JSON.parse(text); } catch (err) { return { ok: false, errors: ['JSON malformado: ' + err.message] }; }
    const prj = o && o.schema === 'loop.project' ? o.project : o;
    const errors = validateProject(prj);
    return errors.length ? { ok: false, errors: errors } : { ok: true, project: prj };
  }
  function exportEnvelope(p) {
    return { schema: 'loop.project', schemaVersion: 1, exportedAt: new Date().toISOString(),
      notice: 'Demonstração local. Dados de exemplo e hipóteses não são dados confirmados do cliente. Simulação visual — não execução real.', project: p };
  }

  /* Adapter local da porta ProjectRepository (substituir por HttpProjectRepository). */
  const KEY = 'loop.v1.projects', CKEY = 'loop.v1.contactDrafts';
  const repo = {
    load() { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter(p => !validateProject(p).length) : []; } catch (e) { return []; } },
    persist(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; } },
    loadContacts() { try { return JSON.parse(localStorage.getItem(CKEY) || '[]'); } catch (e) { return []; } },
    persistContacts(list) { try { localStorage.setItem(CKEY, JSON.stringify(list)); } catch (e) {} }
  };

  /* Porta ProcessPlaybackPort — progressão visual, não execução BPMN. */
  const playback = { next(count, idx) { return idx < count - 1 ? idx + 1 : null; } };
  /* Porta SimulationPort — sem solver nesta entrega. */
  const simulation = { run() { return { status: 'not-implemented', reason: 'insufficient-model', message: 'Sem stocks, fluxos, unidades, parâmetros e testes definidos.' }; } };

  /* Porta OpportunityRulesPort — tabela de regras versionada. */
  const RULES = [
    { id: 'R-TRIAGE', title: 'Triagem automatizada', needs: ['classifiableIntake', 'humanRouting'], gaps: ['Critérios de classificação documentados', 'Controle humano para exceções'], step: 'Triagem automatizada (hipótese)', at: 'start' },
    { id: 'R-UNIFY', title: 'Consolidação de registros', needs: ['spreadsheet', 'multiChannel'], gaps: ['Inventário de campos por canal'], step: 'Consolidar registros (hipótese)', at: 'start' },
    { id: 'R-ALERT', title: 'Alertas de acompanhamento', needs: ['trackingSources'], gaps: ['Verificar APIs e licenças das fontes'], step: 'Emitir alerta (hipótese)', at: 'end' },
    { id: 'R-DOCS', title: 'Pré-preenchimento de documentos', needs: ['repetitiveDocs'], gaps: ['Modelos dos documentos', 'Etapa de revisão humana definida'], step: 'Pré-preencher documento — revisão humana (hipótese)', at: 'end' },
    { id: 'R-CRM', title: 'Integração com CRM existente', needs: ['crm'], gaps: ['Nome do sistema e forma de acesso'], step: 'Sincronizar com CRM (hipótese)', at: 'end' }
  ];
  function evaluate(p) {
    return RULES.map(r => {
      const facts = r.needs.map(k => ({ key: k, label: FACTS.find(f => f.key === k).label, value: p.facts[k] || 'unknown' }));
      const state = facts.some(f => f.value === 'no') ? 'nomatch' : facts.every(f => f.value === 'yes') ? 'candidate' : 'confirm';
      const gaps = facts.filter(f => f.value === 'unknown').map(f => 'Confirmar: ' + f.label).concat(state === 'nomatch' ? [] : r.gaps);
      return { id: r.id, version: '1.0', title: r.title, state: state, facts: facts, gaps: gaps, step: r.step, at: r.at };
    });
  }

  function applyScenario(acts, ops) {
    const list = acts.map(a => Object.assign({}, a, { change: null }));
    (ops || []).forEach(op => {
      if (op.op === 'add') {
        const item = { id: op.id, label: op.label, type: 'task', ownerId: op.ownerId, change: 'added' };
        if (op.afterId === 'start') list.unshift(item);
        else { const i = list.findIndex(a => a.id === op.afterId); if (i < 0 || op.afterId === 'end') list.push(item); else list.splice(i + 1, 0, item); }
      } else {
        const a = list.find(x => x.id === op.nodeId); if (!a) return;
        if (op.op === 'reassign') { a.prevOwner = a.ownerId; a.ownerId = op.ownerId; a.change = 'reassigned'; }
        if (op.op === 'remove') a.change = 'removed';
      }
    });
    return list;
  }
  function structural(acts) {
    const live = acts.filter(a => a.change !== 'removed');
    let handoffs = 0;
    for (let i = 1; i < live.length; i++) if (live[i].ownerId !== live[i - 1].ownerId) handoffs++;
    return { activities: live.length, handoffs: handoffs, executors: new Set(live.map(a => a.ownerId || '?')).size, cycleTime: null, cost: null, roi: null };
  }
  function ownerName(people, id) {
    if (id === 'auto') return 'Automação em estudo';
    const p = people.find(x => x.id === id);
    return p ? p.name : 'Responsável a confirmar';
  }
  function layoutFlow(acts, people, startLabel, activeIdx) {
    const live = acts.filter(a => a.change !== 'removed');
    const seqn = [{ id: 'start', type: 'start', label: startLabel || 'Início', ownerId: live.length ? live[0].ownerId : '' }]
      .concat(live).concat([{ id: 'end', type: 'end', label: 'Fim', ownerId: live.length ? live[live.length - 1].ownerId : '' }]);
    const laneIds = [];
    seqn.forEach(n => { const k = n.ownerId || ''; if (laneIds.indexOf(k) < 0) laneIds.push(k); });
    const LH = 104, X0 = 196, DX = 172;
    const lanes = laneIds.map((k, i) => ({ id: k, label: ownerName(people, k), top: i * LH, h: LH, bg: k === 'auto' ? '#f4edf9' : i % 2 ? '#fafafa' : '#fff' }));
    const half = t => t === 'task' ? 66 : t === 'gateway' ? 24 : 17;
    const nodes = seqn.map((n, i) => {
      const cx = X0 + i * DX, cy = laneIds.indexOf(n.ownerId || '') * LH + LH / 2, hw = half(n.type), act = i === activeIdx;
      const isCard = n.type === 'task';
      const bcol = act ? '#c93038' : n.change === 'added' ? '#277b63' : n.change === 'reassigned' ? '#8055a7' : n.type === 'task' ? '#d9d9d9' : '#171717';
      return { id: n.id, idx: i, type: n.type, cx: cx, cy: cy, hw: hw, isCard: isCard, isShape: !isCard,
        left: isCard ? cx - 66 : cx - 60, top: isCard ? cy - 30 : cy - hw, width: isCard ? 132 : 120, height: isCard ? 60 : hw * 2 + 30,
        boxW: hw * 2, boxH: isCard ? 60 : hw * 2, radius: n.type === 'gateway' ? '4px' : isCard ? '11px' : '50%', transform: n.type === 'gateway' ? 'rotate(45deg) scale(.74)' : 'none',
        border: (act ? '2px' : n.type === 'end' ? '4px' : '1.5px') + ' solid ' + bcol, bg: act ? '#fff0f1' : n.ownerId === 'auto' && isCard ? '#f4edf9' : '#fff',
        shadow: act ? '0 0 0 4px #c9303822' : 'none', title: n.label, sub: isCard ? ownerName(people, n.ownerId) : '',
        badge: n.change === 'added' ? 'NOVO' : n.change === 'reassigned' ? 'REATRIBUÍDO' : '', hasBadge: !!n.change, badgeFg: n.change === 'added' ? '#277b63' : '#8055a7', token: act };
    });
    const segs = [];
    for (let i = 1; i < nodes.length; i++) {
      const a = nodes[i - 1], b = nodes[i], x1 = a.cx + a.hw, x2 = b.cx - b.hw, mx = x2 - 14, col = i <= activeIdx ? '#c93038' : '#bdbdbd';
      segs.push({ left: x1, top: a.cy - 1, width: Math.max(mx - x1, 2), height: 2, color: col });
      if (a.cy !== b.cy) segs.push({ left: mx - 1, top: Math.min(a.cy, b.cy) - 1, width: 2, height: Math.abs(a.cy - b.cy) + 2, color: col });
      segs.push({ left: mx, top: b.cy - 1, width: 14, height: 2, color: col });
      segs.push({ left: x2 - 6, top: b.cy - 3, width: 6, height: 6, color: col });
    }
    return { nodes: nodes, segs: segs, lanes: lanes, w: X0 + (seqn.length - 1) * DX + 110, h: Math.max(lanes.length, 1) * LH, count: seqn.length, activities: live.length };
  }
  function layoutOrg(people, selId) {
    const W = 160, H = 62, GX = 18, LV = 108, PAD = 20;
    const ids = {}, kids = {}, roots = [], pos = {};
    people.forEach(p => { ids[p.id] = true; });
    people.forEach(p => { if (p.reportsTo === 'top') roots.push(p); else if (ids[p.reportsTo] && p.reportsTo !== p.id) (kids[p.reportsTo] = kids[p.reportsTo] || []).push(p); });
    let cursor = PAD, maxD = -1;
    (function walk(list, d) { list.forEach(p => { if (pos[p.id]) return; pos[p.id] = { d: d, x: 0 }; maxD = Math.max(maxD, d); const ch = (kids[p.id] || []).filter(c => !pos[c.id]); walk(ch, d + 1); if (ch.length) pos[p.id].x = (pos[ch[0].id].x + pos[ch[ch.length - 1].id].x) / 2; else { pos[p.id].x = cursor; cursor += W + GX; } pos[p.id].ch = ch; }); })(roots, 0);
    const pend = people.filter(p => !pos[p.id]);
    const pendTop = (maxD + 1) * LV + PAD + 30;
    pend.forEach((p, i) => { pos[p.id] = { pend: true, x: PAD + i * (W + GX), ch: [] }; });
    const segs = [], nodes = people.map(p => {
      const q = pos[p.id], top = q.pend ? pendTop : PAD + q.d * LV, sel = p.id === selId;
      (q.ch || []).forEach(c => {
        const cq = pos[c.id], px = q.x + W / 2, cx = cq.x + W / 2, my = top + H + (LV - H) / 2, cTop = PAD + cq.d * LV;
        segs.push({ left: px - 1, top: top + H, width: 2, height: my - top - H, color: '#bdbdbd' });
        segs.push({ left: Math.min(px, cx) - 1, top: my - 1, width: Math.abs(px - cx) + 2, height: 2, color: '#bdbdbd' });
        segs.push({ left: cx - 1, top: my, width: 2, height: cTop - my, color: '#bdbdbd' });
      });
      return { id: p.id, isCard: true, isShape: false, left: q.x, top: top, width: W, height: H, boxW: W, boxH: H, radius: p.kind === 'pessoa' ? '11px' : p.kind === 'equipe' ? '22px' : '4px', transform: 'none',
        border: sel ? '2px solid #c93038' : q.pend ? '1.5px dashed #9a9a9a' : '1.5px solid #d9d9d9', bg: sel ? '#fff0f1' : '#fff', shadow: 'none', title: p.name || '(sem nome)', sub: p.role || 'função não informada',
        badge: (p.kind || 'pessoa').toUpperCase() + (q.pend ? ' · A CONFIRMAR' : ''), hasBadge: true, badgeFg: q.pend ? '#c93038' : '#696969', token: false, pending: !!q.pend };
    });
    const lanes = pend.length ? [{ id: 'pend', label: 'Reporte a confirmar', top: pendTop - 30, h: H + 50, bg: '#fafafa' }] : [];
    const w = Math.max(cursor, PAD + pend.length * (W + GX), 320) + PAD;
    return { nodes: nodes, segs: segs, lanes: lanes, w: w, h: (pend.length ? pendTop + H : (maxD + 1) * LV) + PAD, pending: pend.length };
  }
  function canAccept(p, n) {
    if (n !== p.consulting.currentStep) return { ok: false, reason: 'A atividade atual do projeto é a ' + p.consulting.currentStep + '. Aceite as atividades em sequência.' };
    const g = BPM.gates.find(x => x.after < n && p.consulting.gates[x.id] !== 'approved');
    if (g) return { ok: false, gate: g, reason: g.id + ' · ' + g.title + ' — estado: ' + (p.consulting.gates[g.id] === 'rejected' ? 'não aprovado' : 'pendente') + '.' };
    return { ok: true };
  }
  function gaps(p) {
    const out = [];
    BLOCKS.forEach(b => p.discovery[b.id].forEach(q => { if (!q.answer.trim() || q.status === 'unknown') out.push(b.id + ' · ' + q.text); }));
    FACTS.forEach(f => { if (p.facts[f.key] === 'unknown') out.push(f.block + ' · ' + f.label + ': não informado'); });
    const ids = p.people.map(x => x.id);
    p.people.forEach(x => { if (x.reportsTo !== 'top' && ids.indexOf(x.reportsTo) < 0) out.push('B02 · Reporte de "' + x.name + '" a confirmar'); });
    p.activities.forEach(a => { if (ids.indexOf(a.ownerId) < 0) out.push('B05 · Responsável de "' + a.label + '" a confirmar'); });
    return out;
  }

  function runSelfTests() {
    const res = [], t = (name, fn) => { let pass = false, note = ''; try { pass = fn() === true; } catch (e) { note = e.message; } res.push({ name: name, pass: pass, note: note }); };
    t('BPM: 23 atividades, 7 fases, 5 gates', () => BPM.steps.length === 23 && BPM.phases.length === 7 && BPM.gates.length === 5);
    t('BPM: cada atividade pertence a exatamente uma fase', () => BPM.steps.every(s => BPM.phases.filter(p => p.steps.indexOf(s.n) >= 0).length === 1));
    t('3×3: 9 blocos, 3 por fase', () => BLOCKS.length === 9 && PHASES3.every(f => BLOCKS.filter(b => b.phase === f.id).length === 3));
    t('Projeção: 2 pessoas + 3 atividades geram só esses elementos', () => {
      const p = newProject('t'); p.people = [{ id: 'a', name: 'A', role: '', kind: 'pessoa', reportsTo: 'top' }, { id: 'b', name: 'B', role: '', kind: 'pessoa', reportsTo: 'unknown' }];
      p.activities = [1, 2, 3].map(i => ({ id: 'x' + i, label: 'T' + i, type: 'task', ownerId: 'a' }));
      const f = layoutFlow(p.activities, p.people, '', 0), o = layoutOrg(p.people);
      return f.count === 5 && o.nodes.length === 2 && o.pending === 1 && o.segs.length === 0;
    });
    t('Playback: avança e termina no fim', () => playback.next(4, 0) === 1 && playback.next(4, 3) === null);
    t('R-TRIAGE: candidato com entrada classificável + encaminhamento humano', () => { const p = newProject('t'); p.facts.classifiableIntake = 'yes'; p.facts.humanRouting = 'yes'; const r = evaluate(p).find(x => x.id === 'R-TRIAGE'); return r.state === 'candidate' && !('roi' in r); });
    t('R-CRM: CRM não informado não é candidato', () => evaluate(newProject('t')).find(x => x.id === 'R-CRM').state === 'confirm');
    t('Cenário B: diff estrutural preserva baseline A', () => { const p = seedDemo(), before = JSON.stringify(p.activities); const b = applyScenario(p.activities, [{ op: 'add', id: 'n1', afterId: 'start', label: 'X', ownerId: 'auto' }, { op: 'reassign', nodeId: 'ac2', ownerId: 'auto' }]); return JSON.stringify(p.activities) === before && b.length === 7 && b[0].change === 'added' && b.find(a => a.id === 'ac2').change === 'reassigned'; });
    t('Indicadores quantitativos permanecem null (não calculável)', () => { const s = structural(seedDemo().activities); return s.cycleTime === null && s.cost === null && s.roi === null; });
    t('Importação: JSON inválido é rejeitado com detalhe', () => { const a = parseImport('{oops'), b = parseImport('{"name":"x"}'); return !a.ok && !b.ok && b.errors.length > 0; });
    t('Exportação/importação: round-trip preserva o projeto', () => { const p = seedDemo(), r = parseImport(JSON.stringify(exportEnvelope(p))); return r.ok && JSON.stringify(r.project) === JSON.stringify(p); });
    t('Gate: G3 pendente bloqueia a atividade 12', () => { const p = newProject('t'); p.consulting.currentStep = 12; p.consulting.gates.G1 = 'approved'; p.consulting.gates.G2 = 'approved'; const r = canAccept(p, 12); p.consulting.gates.G3 = 'approved'; return !r.ok && r.gate.id === 'G3' && canAccept(p, 12).ok; });
    t('SimulationPort responde not-implemented', () => simulation.run().status === 'not-implemented');
    return res;
  }

  window.LOOP = { BPM, OWNERS, STATUS, PHASES3, BLOCKS, FACTS, TRI, RETURN_TO, RULES, uid, clone, newProject, seedDemo, seedCleanSea, validateProject, parseImport, exportEnvelope, repo, playback, simulation, evaluate, applyScenario, structural, ownerName, layoutFlow, layoutOrg, canAccept, gaps, runSelfTests };
})();
