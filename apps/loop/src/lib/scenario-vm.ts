import { applyScenario, ownerName, STATUS_LABEL, structural } from '@/domain/model';
import type { Project } from '@/domain/schema';

export type ScenarioKey = 'A' | 'B' | 'C';
export const opsOf = (p: Project, k: ScenarioKey) => (k === 'A' ? [] : p.scenarios[k].ops);

export function metricsRows(p: Project, k: ScenarioKey) {
  const a = structural(p.activities), b = structural(applyScenario(p.activities, opsOf(p, k)));
  const vol = p.discovery.B04[1], nc = 'não calculável';
  return [
    { l: 'Atividades', a: a.activities, b: b.activities, src: 'derivado da estrutura' },
    { l: 'Transferências entre responsáveis', a: a.handoffs, b: b.handoffs, src: 'derivado da estrutura' },
    { l: 'Executores distintos', a: a.executors, b: b.executors, src: 'derivado da estrutura' },
    { l: 'Volume por período', a: vol?.answer.trim() ? vol.answer : 'não informado', b: '—', src: vol?.answer.trim() ? `B04 · ${STATUS_LABEL[vol.status]}` : 'B04 sem resposta' },
    { l: 'Tempo de ciclo', a: nc, b: nc, src: 'sem baseline medido' },
    { l: 'Custo', a: nc, b: nc, src: 'sem dados e fórmula' },
    { l: 'ROI', a: nc, b: nc, src: 'sem modelo formal' }
  ];
}

export function diffRows(p: Project, k: ScenarioKey) {
  return opsOf(p, k).map((op, i) => {
    if (op.op === 'add') return { i, kind: 'NOVO', tone: 'green' as const, text: `${op.label} — ${ownerName(p.people, op.ownerId)}` };
    const base = p.activities.find(a => a.id === op.nodeId);
    if (op.op === 'reassign') return { i, kind: 'REATRIBUÍDO', tone: 'purple' as const, text: `${base?.label ?? '?'}: ${ownerName(p.people, base?.ownerId ?? '')} → ${ownerName(p.people, op.ownerId)}` };
    return { i, kind: 'REMOVIDO', tone: 'red' as const, text: base?.label ?? '?' };
  });
}

export function chartData(p: Project) {
  const s = (k: ScenarioKey) => structural(applyScenario(p.activities, opsOf(p, k)));
  const A = s('A'), B = s('B'), C = s('C');
  return [
    { metric: 'Atividades', A: A.activities, B: B.activities, C: C.activities },
    { metric: 'Transferências', A: A.handoffs, B: B.handoffs, C: C.handoffs },
    { metric: 'Executores', A: A.executors, B: B.executors, C: C.executors }
  ];
}
