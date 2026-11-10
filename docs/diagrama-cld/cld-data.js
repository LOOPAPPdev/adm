window.CLD_DATA = {
  layers: {
    red:   { label: "01 · Problema", bg: "#fcebe8", stroke: "#b5654f", ink: "#7a2c1c", sub: "#a24a34", band: "rgba(181,101,79,0.06)" },
    blue:  { label: "02 · Compensação (4E)", bg: "#e8f0fb", stroke: "#5a85c2", ink: "#1d3f73", sub: "#2f5a96", band: "rgba(90,133,194,0.07)" },
    green: { label: "03 · Solução emergente", bg: "#e3f6ee", stroke: "#4aa383", ink: "#0f5a43", sub: "#1c7a5c", band: "rgba(74,163,131,0.07)" },
    exo:   { label: "Exógeno", bg: "#f0f0e8", stroke: "#a8a89c", ink: "#3d3d38", sub: "#55554f" }
  },
  nodes: [
    { id: "falhas", layer: "red", x: 40, y: 130, title: "Falhas e desvios", sub: "atrasos, retrabalho", src: [5], note: "Resultado observável da lacuna. É a variável que o sistema precisa detectar para se corrigir." },
    { id: "backlog", layer: "red", x: 270, y: 290, title: "Backlog (estoque)", sub: "gera sobrecarga", src: [5], note: "Estoque: acumula o que não foi concluído. Alimenta R1 e corrói a adesão à execução (R2)." },
    { id: "lacuna", layer: "red", x: 40, y: 450, title: "Lacuna de capacidade", sub: "demanda − capacidade", src: [5, 6], note: "Variável central do problema. O loop só existe se houver lacuna: o modelo é condicional a ela." },
    { id: "tdah", layer: "exo", x: 40, y: 650, title: "TDAH (traço)", sub: "parâmetro, não variável", src: [6, 7], note: "Exógeno. Déficits executivos são frequentemente associados ao TDAH, mas não universais. Os pilares não alteram o traço; por isso nenhuma seta volta para ele." },
    { id: "demanda", layer: "exo", x: 270, y: 650, title: "Demanda do projeto", sub: "prazo, escopo", src: [4], note: "Exógeno. Define a carga que entra no sistema." },
    { id: "entender", layer: "blue", x: 640, y: 110, title: "1 · Entender", sub: "riscos cognitivos que afetam o objetivo", src: [2, 4], note: "Identificar quais riscos cognitivos comprometem a execução. Corresponde à programação e verificação da atividade (Luria) e à avaliação contínua de exposição a riscos (PMI)." },
    { id: "estruturar", layer: "blue", x: 640, y: 270, title: "2 · Estruturar", sub: "processos e ferramentas adaptados", src: [1, 4], note: "Processos e ferramentas adaptados aos riscos e adequados aos requisitos. Barkley propõe ambientes protéticos que compensam o déficit em vez de apenas ensinar habilidades." },
    { id: "emitir", layer: "blue", x: 640, y: 430, title: "3 · Emitir", sub: "externalizar e visualizar objetivos", src: [1, 3], note: "Tirar o objetivo da cabeça e colocá-lo no ambiente, no ponto de desempenho (Barkley). Signos externos como ferramentas psicológicas de autorregulação (Vygotsky)." },
    { id: "executar", layer: "blue", x: 640, y: 590, title: "4 · Executar", sub: "somente após os 3E anteriores", src: [1], note: "A execução só ocorre depois de Entender, Estruturar e Emitir. Para Barkley o problema é de desempenho, não de conhecimento: fazer o que se sabe." },
    { id: "mapa", layer: "green", x: 1150, y: 190, title: "Mapa-OS Cognitivo", sub: "o plano visível e externo", src: [1, 3, 4], note: "Emerge de Emitir. Torna backlog e prioridades visíveis, reduzindo o estoque oculto." },
    { id: "r31", layer: "green", x: 1150, y: 370, title: "Estrutura 3 : 1", sub: "1 dia · 3 tarefas · 1 entrega", src: [1, 5], note: "Emerge de Estruturar. Limita a carga diária à capacidade e reduz a lacuna." },
    { id: "ciclo", layer: "green", x: 1150, y: 550, title: "Ciclo diário", sub: "repete sempre assim", src: [2, 5], note: "Emerge de Executar. A repetição diária encurta o atraso entre ação, consequência e correção (verificação da atividade)." }
  ],
  edges: [
    { from: "lacuna", to: "falhas", sign: "+" },
    { from: "falhas", to: "backlog", sign: "+" },
    { from: "backlog", to: "lacuna", sign: "+" },
    { from: "tdah", to: "lacuna", sign: "+" },
    { from: "demanda", to: "lacuna", sign: "+" },
    { from: "lacuna", to: "entender", sign: "+" },
    { from: "falhas", to: "entender", sign: "+", delay: true },
    { from: "entender", to: "estruturar", sign: "+" },
    { from: "estruturar", to: "emitir", sign: "+" },
    { from: "emitir", to: "executar", sign: "+" },
    { from: "emitir", to: "mapa", sign: "+" },
    { from: "estruturar", to: "r31", sign: "+" },
    { from: "executar", to: "ciclo", sign: "+" },
    { from: "mapa", to: "backlog", sign: "-" },
    { from: "r31", to: "lacuna", sign: "-", delay: true },
    { from: "ciclo", to: "falhas", sign: "-" },
    { from: "backlog", to: "executar", sign: "-" }
  ],
  loops: [
    { id: "R1", name: "Espiral de sobrecarga", path: ["lacuna", "falhas", "backlog"], text: "A lacuna gera falhas, as falhas acumulam backlog e o backlog amplia a lacuna." },
    { id: "R2", name: "Erosão da adesão (paradoxo)", path: ["backlog", "executar", "ciclo", "falhas"], text: "O sistema compensatório depende da função prejudicada: a sobrecarga reduz a execução, o ciclo enfraquece e as falhas voltam a crescer. Por isso os pilares precisam ser de baixa fricção." },
    { id: "B1", name: "Compensação 3:1", path: ["lacuna", "entender", "estruturar", "r31"], text: "Reconhecer a lacuna leva a estruturar a carga em 3:1, que reduz a lacuna (com atraso)." },
    { id: "B2", name: "Visibilidade", path: ["lacuna", "entender", "estruturar", "emitir", "mapa", "backlog"], text: "Externalizar o plano no Mapa-OS torna o backlog visível e o reduz." },
    { id: "B3", name: "Verificação diária", path: ["falhas", "entender", "estruturar", "emitir", "executar", "ciclo"], text: "Falhas detectadas reativam os 4E; o ciclo diário de execução reduz novas falhas." }
  ],
  sources: [
    { id: 1, label: "Barkley, R. A. — Theory of Executive Function & Self-Regulation (slides)", url: "https://www.vapsych.org/assets/docs/Theory%20of%20Executive%20Function%20%20Self%20Regulation%20-%20Barkley.pdf" },
    { id: 2, label: "Luria — três unidades funcionais (MedLink, Executive dysfunction)", url: "https://www.medlink.com/articles/executive-dysfunction" },
    { id: 3, label: "Vygotsky — Mediation (Cambridge Companion to Vygotsky)", url: "https://www.cambridge.org/core/books/abs/cambridge-companion-to-vygotsky/mediation/42274B82CD2F562BFC6EDD1662F0DFD4" },
    { id: 4, label: "PMI — PMBOK® Guide, 7ª ed.: princípios e risco (Project Risk Coach)", url: "https://projectriskcoach.com/pmbok-seventh-edition-principles-and-risk-management/" },
    { id: 5, label: "Sterman, J. — Fine-Tuning Your Causal Loop Diagrams (The Systems Thinker)", url: "https://thesystemsthinker.com/fine-tuning-your-causal-loop-diagrams-part-i/" },
    { id: 6, label: "Willcutt et al. (2005) — Validity of the EF theory of ADHD, Biol. Psychiatry", url: "https://ohsu.elsevierpure.com/en/publications/validity-of-the-executive-function-theory-of-attention-deficit-hy-2/" },
    { id: 7, label: "Editorial (2025) — Executive functions: a transdiagnostic window (PMC)", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12723264/" }
  ]
};
