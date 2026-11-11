/**
 * LOOP domain — typed port of docs/loop-app/design/loop-core.js.
 * Pure functions. No UI, no colors, no generative AI, no network.
 */
import bpmData from '@/data/consulting-bpm.json';
import discovery from '@/data/discovery-3x3.json';
import rulesData from '@/data/opportunity-rules.json';
import type { Activity, EvidenceStatus, Person, Project, ScenarioOp, TriState } from './schema';
import { describeIssues, ExportEnvelope, Project as ProjectSchema } from './schema';

export type OwnerKey = 'C' | 'H' | 'P' | 'T';
export type BpmStep = (typeof bpmData.steps)[number] & { owner: OwnerKey };
export type BpmPhase = (typeof bpmData.phases)[number] & { gate?: string };
export type BpmGate = (typeof bpmData.gates)[number];

export const BPM = {
  phases: bpmData.phases as BpmPhase[],
  steps: bpmData.steps as BpmStep[],
  gates: bpmData.gates as BpmGate[],
  owners: bpmData.owners as Record<OwnerKey, { label: string; lane: string }>,
  returnTo: bpmData.returnTo as Record<string, number>
};
export const PHASES3 = discovery.phases;
export const BLOCKS = discovery.blocks;
export const FACTS = discovery.facts;
export const RULES = rulesData.rules;
export const GUARDRAILS = rulesData.guardrails;

export const STATUS_LABEL: Record<EvidenceStatus, string> = {
  unknown: 'não informado', informed: 'informado', hypothesis: 'hipótese', restricted: 'restrito', confirmed: 'confirmado'
};
export const TRI_LABEL: Record<TriState, string> = { yes: 'sim', no: 'não', unknown: 'não informado' };

let seq = 0;
export const uid = (p: string) => `${p}_${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o)) as T;

export function newProject(name: string): Project {
  const t = new Date().toISOString();
  const disc: Project['discovery'] = {};
  BLOCKS.forEach(b => { disc[b.id] = b.qs.map((q, i) => ({ id: `${b.id}_q${i + 1}`, text: q, answer: '', status: 'unknown', custom: false })); });
  const facts: Project['facts'] = {};
  FACTS.forEach(f => { facts[f.key] = 'unknown'; });
  const gates: Project['consulting']['gates'] = {};
  BPM.gates.forEach(g => { gates[g.id] = 'pending'; });
  return {
    id: uid('prj'), name, version: 1, status: 'draft', archived: false, isDemo: false, createdAt: t, updatedAt: t,
    discovery: disc, facts, people: [], activities: [],
    scenarios: { B: { name: 'Cenário B · intervenção', kind: 'intervention', ops: [] }, C: { name: 'Cenário C · alternativa', kind: 'alternative', ops: [] } },
    consulting: { currentStep: 1, gates }, portalReview: 'pending', causal: { variables: [], links: [] }
  };
}

function setQ(p: Project, block: string, i: number, answer: string, status: EvidenceStatus) {
  const q = p.discovery[block][i];
  q.answer = answer; q.status = status;
}

/** Fictitious example — always flagged isDemo. */
export function seedDemo(): Project {
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
  p.causal = {
    variables: [
      { id: 'v1', label: 'Solicitações na fila', unit: 'pedidos', status: 'hypothesis' },
      { id: 'v2', label: 'Tempo de resposta', unit: 'horas', status: 'hypothesis' },
      { id: 'v3', label: 'Retrabalho de classificação', unit: '', status: 'hypothesis' },
      { id: 'v4', label: 'Capacidade do atendimento', unit: '', status: 'unknown' }
    ],
    links: [
      { id: 'l1', from: 'v1', to: 'v2', polarity: '+', delay: false, status: 'hypothesis', note: 'Fila maior tende a aumentar o tempo de resposta.' },
      { id: 'l2', from: 'v2', to: 'v3', polarity: '+', delay: true, status: 'hypothesis', note: 'Pressa aumenta erros (exemplo).' },
      { id: 'l3', from: 'v3', to: 'v1', polarity: '+', delay: false, status: 'hypothesis', note: 'Retrabalho volta para a fila.' },
      { id: 'l4', from: 'v4', to: 'v2', polarity: '-', delay: false, status: 'hypothesis', note: 'Mais capacidade reduz o tempo.' }
    ]
  };
  return p;
}

/**
 * Clean Sea discovery template, from the client's operational material (LOOP 3×3 v0.4).
 * Personal names are omitted on purpose: nodes use functions only.
 */
export function seedCleanSea(): Project {
  const p = newProject('Clean Sea · template de descoberta');
  Object.assign(p.facts, { spreadsheet: 'yes', multiChannel: 'yes', trackingSources: 'yes', repetitiveDocs: 'yes' });
  setQ(p, 'B01', 0, 'Recolha de resíduos em operação portuária (interpretação do material fornecido).', 'hypothesis');
  setQ(p, 'B01', 1, 'Do primeiro contato do cliente ao encerramento documental.', 'hypothesis');
  setQ(p, 'B03', 0, 'Planilha, Forms e WhatsApp; MarineTraffic, Praticagem SP e semafórico para navios. CRM não confirmado.', 'informed');
  setQ(p, 'B04', 0, 'Pedido do cliente', 'informed');
  setQ(p, 'B04', 1, 'Cerca de 8 operações por mês; pedidos chegam 4 a 7 dias antes.', 'informed');
  setQ(p, 'B06', 0, 'Clima pode atrasar navios e concentrar operações; despacho depende da confirmação de chegada. Documentos D2/D3/D4 preenchidos manualmente.', 'informed');
  setQ(p, 'B08', 0, 'Atraso meteorológico; sobreposição de operações; dependência do WhatsApp.', 'informed');
  setQ(p, 'B09', 0, 'Triagem de solicitações (hipótese). Validação do cliente pendente.', 'hypothesis');
  p.people = [
    { id: 'cs1', name: 'Comercial', role: 'Fecha o pedido com o cliente', kind: 'area', reportsTo: 'unknown' },
    { id: 'cs2', name: 'Comunicação', role: 'Registro e avisos', kind: 'pessoa', reportsTo: 'unknown' },
    { id: 'cs3', name: 'Logística / coordenação', role: 'Despacha equipe e encerra', kind: 'pessoa', reportsTo: 'unknown' },
    { id: 'cs4', name: 'Operação / documentação', role: 'Confirma chegada, executa e documenta', kind: 'equipe', reportsTo: 'unknown' },
    { id: 'cs5', name: 'Motoristas', role: 'Transporte', kind: 'equipe', reportsTo: 'cs3' }
  ];
  p.activities = [
    { id: 'p01', label: 'Cliente solicita', type: 'task', ownerId: 'cs1' },
    { id: 'p02', label: 'Comercial fecha', type: 'task', ownerId: 'cs1' },
    { id: 'p03', label: 'Registro e aviso', type: 'task', ownerId: 'cs2' },
    { id: 'p04', label: 'Monitorar navio', type: 'task', ownerId: '' },
    { id: 'p05', label: 'Chegada confirmada?', type: 'gateway', ownerId: 'cs4' },
    { id: 'p06', label: 'Despachar equipe', type: 'task', ownerId: 'cs3' },
    { id: 'p07', label: 'Executar operação', type: 'task', ownerId: 'cs4' },
    { id: 'p08', label: 'Documentar e encerrar', type: 'task', ownerId: 'cs3' }
  ];
  p.causal = {
    variables: [
      { id: 'c1', label: 'Atrasos meteorológicos', unit: '', status: 'informed' },
      { id: 'c2', label: 'Operações simultâneas', unit: 'operações', status: 'informed' },
      { id: 'c3', label: 'Carga da equipe', unit: '', status: 'hypothesis' },
      { id: 'c4', label: 'Erros de documentação', unit: '', status: 'hypothesis' }
    ],
    links: [
      { id: 'k1', from: 'c1', to: 'c2', polarity: '+', delay: true, status: 'informed', note: 'Material operacional: atrasos concentram operações.' },
      { id: 'k2', from: 'c2', to: 'c3', polarity: '+', delay: false, status: 'hypothesis', note: '' },
      { id: 'k3', from: 'c3', to: 'c4', polarity: '+', delay: false, status: 'hypothesis', note: 'D2/D3/D4 manuais.' }
    ]
  };
  return p;
}

export type ImportResult = { ok: true; project: Project } | { ok: false; errors: string[] };

export function validateProject(o: unknown): string[] {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return ['O arquivo não contém um objeto de projeto.'];
  const r = ProjectSchema.safeParse(o);
  return r.success ? [] : describeIssues(r.error);
}

export function parseImport(text: string): ImportResult {
  let o: unknown;
  try { o = JSON.parse(text); } catch (err) { return { ok: false, errors: ['JSON malformado: ' + (err as Error).message] }; }
  const env = ExportEnvelope.safeParse(o);
  const raw = env.success ? env.data.project : o;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, errors: ['O arquivo não contém um objeto de projeto.'] };
  const r = ProjectSchema.safeParse(raw);
  if (!r.success) return { ok: false, errors: describeIssues(r.error) };
  const project = r.data as Project;
  if (!project.id) project.id = uid('prj');
  return { ok: true, project };
}

export const DEMO_NOTICE = 'Demonstração local. Dados de exemplo e hipóteses não são dados confirmados do cliente. Simulação visual — não execução real.';
export function exportEnvelope(p: Project) {
  return { schema: 'loop.project' as const, schemaVersion: 1, exportedAt: new Date().toISOString(), notice: DEMO_NOTICE, project: p };
}

/** ProcessPlaybackPort — visual progression, not BPMN execution. */
export const playback = { next: (count: number, idx: number): number | null => (idx < count - 1 ? idx + 1 : null) };

/** SimulationPort — no solver in this release (RN-05). */
export const SIMULATION_REQUIREMENTS = ['Estoques e fluxos definidos', 'Equações formais', 'Unidades coerentes', 'Parâmetros medidos', 'Condições iniciais', 'Testes do modelo aprovados'];
export const simulation = {
  run: () => ({ status: 'not-implemented' as const, reason: 'insufficient-model' as const, message: 'Sem stocks, fluxos, unidades, parâmetros e testes definidos.' })
};

export type RuleState = 'candidate' | 'confirm' | 'nomatch';
export interface RuleResult {
  id: string; version: string; title: string; state: RuleState;
  facts: { key: string; label: string; value: TriState }[];
  gaps: string[]; step: string; at: 'start' | 'end';
}

/** OpportunityRulesPort — deterministic table. A match is a candidate, never a proven gain. */
export function evaluate(p: Project): RuleResult[] {
  return RULES.map(r => {
    const facts = r.needs.map(k => ({ key: k, label: FACTS.find(f => f.key === k)!.label, value: (p.facts[k] ?? 'unknown') as TriState }));
    const state: RuleState = facts.some(f => f.value === 'no') ? 'nomatch' : facts.every(f => f.value === 'yes') ? 'candidate' : 'confirm';
    const gaps = facts.filter(f => f.value === 'unknown').map(f => 'Confirmar: ' + f.label).concat(state === 'nomatch' ? [] : r.gaps);
    return { id: r.id, version: rulesData.version, title: r.title, state, facts, gaps, step: r.step, at: r.at as 'start' | 'end' };
  });
}

export type FlowActivity = Activity & { change: null | 'added' | 'reassigned' | 'removed'; prevOwner?: string; ruleId?: string };

/** Applies scenario operations on a copy. The baseline (A) is never mutated. */
export function applyScenario(acts: Activity[], ops: ScenarioOp[] = []): FlowActivity[] {
  const list: FlowActivity[] = acts.map(a => ({ ...a, change: null }));
  ops.forEach(op => {
    if (op.op === 'add') {
      const item: FlowActivity = { id: op.id, label: op.label, type: 'task', ownerId: op.ownerId, change: 'added', ruleId: op.ruleId };
      if (op.afterId === 'start') list.unshift(item);
      else {
        const i = list.findIndex(a => a.id === op.afterId);
        if (i < 0 || op.afterId === 'end') list.push(item); else list.splice(i + 1, 0, item);
      }
      return;
    }
    const a = list.find(x => x.id === op.nodeId);
    if (!a) return;
    if (op.op === 'reassign') { a.prevOwner = a.ownerId; a.ownerId = op.ownerId; a.change = 'reassigned'; }
    if (op.op === 'remove') a.change = 'removed';
  });
  return list;
}

export interface StructuralMetrics { activities: number; handoffs: number; executors: number; cycleTime: null; cost: null; roi: null }
/** Structural indicators only. Quantitative indicators stay null until a formal model exists. */
export function structural(acts: (Activity & { change?: FlowActivity['change'] })[]): StructuralMetrics {
  const live = acts.filter(a => a.change !== 'removed');
  let handoffs = 0;
  for (let i = 1; i < live.length; i++) if (live[i].ownerId !== live[i - 1].ownerId) handoffs++;
  return { activities: live.length, handoffs, executors: new Set(live.map(a => a.ownerId || '?')).size, cycleTime: null, cost: null, roi: null };
}

export function ownerName(people: Person[], id: string): string {
  if (id === 'auto') return 'Automação em estudo';
  const p = people.find(x => x.id === id);
  return p ? p.name || '(sem nome)' : 'Responsável a confirmar';
}

export function canAccept(p: Project, n: number): { ok: true } | { ok: false; reason: string; gate?: BpmGate } {
  if (n !== p.consulting.currentStep) return { ok: false, reason: `A atividade atual do projeto é a ${p.consulting.currentStep}. Aceite as atividades em sequência.` };
  const g = BPM.gates.find(x => x.after < n && p.consulting.gates[x.id] !== 'approved');
  if (g) return { ok: false, gate: g, reason: `${g.id} · ${g.title} — estado: ${p.consulting.gates[g.id] === 'rejected' ? 'não aprovado' : 'pendente'}.` };
  return { ok: true };
}

/** Sets a gate and applies the return rule of the consulting BPM when rejected. */
export function setGate(p: Project, gateId: string, v: 'pending' | 'approved' | 'rejected') {
  p.consulting.gates[gateId] = v;
  const back = BPM.returnTo[gateId];
  if (v === 'rejected' && p.consulting.currentStep > back) p.consulting.currentStep = back;
}

export function gaps(p: Project): string[] {
  const out: string[] = [];
  BLOCKS.forEach(b => p.discovery[b.id].forEach(q => { if (!q.answer.trim() || q.status === 'unknown') out.push(`${b.id} · ${q.text}`); }));
  FACTS.forEach(f => { if (p.facts[f.key] === 'unknown') out.push(`${f.block} · ${f.label}: não informado`); });
  const ids = p.people.map(x => x.id);
  p.people.forEach(x => { if (x.reportsTo !== 'top' && !ids.includes(x.reportsTo)) out.push(`B02 · Reporte de "${x.name || '(sem nome)'}" a confirmar`); });
  p.activities.forEach(a => { if (a.ownerId !== 'auto' && !ids.includes(a.ownerId)) out.push(`B05 · Responsável de "${a.label}" a confirmar`); });
  return out;
}

export function allQuestions(p: Project) {
  return BLOCKS.flatMap(b => p.discovery[b.id].map(q => ({ ...q, block: b.id, effective: (q.answer.trim() ? q.status : 'unknown') as EvidenceStatus })));
}

export function nextInfo(p: Project) {
  const cur = p.consulting.currentStep, s = BPM.steps[cur - 1];
  const g = BPM.gates.find(x => p.consulting.gates[x.id] !== 'approved');
  return {
    no: s ? 'PASSO ' + String(cur).padStart(2, '0') : 'CICLO',
    title: s ? s.title : 'Todas as 23 atividades aceitas localmente.',
    gate: g ? `${g.id} · ${g.title} (${p.consulting.gates[g.id] === 'rejected' ? 'não aprovado' : 'pendente'})` : 'Todos os gates aprovados (demo local)'
  };
}

export function phaseOf(n: number) { return BPM.phases.find(x => x.steps.includes(n))!; }

/** Tree projection of the org chart. Nodes whose manager is not declared stay "a confirmar". */
export function orgStructure(people: Person[]) {
  const ids = new Set(people.map(p => p.id));
  const roots: Person[] = [], pending: Person[] = [], edges: { from: string; to: string }[] = [];
  people.forEach(p => {
    if (p.reportsTo === 'top') roots.push(p);
    else if (ids.has(p.reportsTo) && p.reportsTo !== p.id) edges.push({ from: p.reportsTo, to: p.id });
    else pending.push(p);
  });
  // Nodes that hang under a pending node are still placed in the tree under it.
  return { roots, pending, edges };
}

/** Swimlane flow layout (start → activities → end), shared by React Flow and the BPMN export. */
export const FLOW_GEOM = { laneH: 104, x0: 196, dx: 172, taskW: 132, taskH: 60, gw: 48, ev: 34 };
export function layoutFlow(acts: FlowActivity[] | Activity[], people: Person[], startLabel = '') {
  const live = (acts as FlowActivity[]).filter(a => a.change !== 'removed');
  type N = { id: string; type: 'start' | 'end' | 'task' | 'gateway'; label: string; ownerId: string; change: FlowActivity['change']; ruleId?: string };
  const seqn: N[] = [
    { id: 'start', type: 'start', label: startLabel || 'Início', ownerId: live.length ? live[0].ownerId : '', change: null },
    ...live.map(a => ({ id: a.id, type: a.type, label: a.label, ownerId: a.ownerId, change: a.change ?? null, ruleId: a.ruleId })),
    { id: 'end', type: 'end', label: 'Fim', ownerId: live.length ? live[live.length - 1].ownerId : '', change: null }
  ];
  const laneIds: string[] = [];
  seqn.forEach(n => { if (!laneIds.includes(n.ownerId)) laneIds.push(n.ownerId); });
  const G = FLOW_GEOM;
  const lanes = laneIds.map((k, i) => ({ id: k || 'none', ownerId: k, label: ownerName(people, k), top: i * G.laneH, height: G.laneH, auto: k === 'auto' }));
  const nodes = seqn.map((n, i) => ({ ...n, idx: i, cx: G.x0 + i * G.dx, cy: laneIds.indexOf(n.ownerId) * G.laneH + G.laneH / 2, owner: ownerName(people, n.ownerId) }));
  return { nodes, lanes, width: G.x0 + (seqn.length - 1) * G.dx + 110, height: Math.max(lanes.length, 1) * G.laneH, count: seqn.length, activities: live.length };
}
export type FlowLayout = ReturnType<typeof layoutFlow>;
