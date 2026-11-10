/**
 * Domain self-tests, shown on /verificacao and run by Vitest (src/domain/model.test.ts).
 * Same 13 checks as the Claude Design prototype, adapted to the typed domain.
 */
import { applyScenario, BLOCKS, BPM, canAccept, evaluate, exportEnvelope, layoutFlow, newProject, orgStructure, parseImport, PHASES3, playback, seedDemo, simulation, structural } from './model';

export interface SelfTest { name: string; pass: boolean; note: string }

export function runSelfTests(): SelfTest[] {
  const res: SelfTest[] = [];
  const t = (name: string, fn: () => boolean) => { let pass = false, note = ''; try { pass = fn() === true; } catch (e) { note = (e as Error).message; } res.push({ name, pass, note }); };
  t('BPM: 23 atividades, 7 fases, 5 gates', () => BPM.steps.length === 23 && BPM.phases.length === 7 && BPM.gates.length === 5);
  t('BPM: cada atividade pertence a exatamente uma fase', () => BPM.steps.every(s => BPM.phases.filter(p => p.steps.includes(s.n)).length === 1));
  t('3×3: 9 blocos, 3 por fase', () => BLOCKS.length === 9 && PHASES3.every(f => BLOCKS.filter(b => b.phase === f.id).length === 3));
  t('Projeção: 2 pessoas + 3 atividades geram só esses elementos', () => {
    const p = newProject('t');
    p.people = [{ id: 'a', name: 'A', role: '', kind: 'pessoa', reportsTo: 'top' }, { id: 'b', name: 'B', role: '', kind: 'pessoa', reportsTo: 'unknown' }];
    p.activities = [1, 2, 3].map(i => ({ id: 'x' + i, label: 'T' + i, type: 'task' as const, ownerId: 'a' }));
    const f = layoutFlow(p.activities, p.people), o = orgStructure(p.people);
    return f.count === 5 && o.roots.length + o.pending.length === 2 && o.pending.length === 1 && o.edges.length === 0;
  });
  t('Playback: avança e termina no fim', () => playback.next(4, 0) === 1 && playback.next(4, 3) === null);
  t('R-TRIAGE: candidato com entrada classificável + encaminhamento humano', () => { const p = newProject('t'); p.facts.classifiableIntake = 'yes'; p.facts.humanRouting = 'yes'; const r = evaluate(p).find(x => x.id === 'R-TRIAGE')!; return r.state === 'candidate' && !('roi' in r); });
  t('R-CRM: CRM não informado não é candidato', () => evaluate(newProject('t')).find(x => x.id === 'R-CRM')!.state === 'confirm');
  t('Cenário B: diff estrutural preserva baseline A', () => {
    const p = seedDemo(), before = JSON.stringify(p.activities);
    const b = applyScenario(p.activities, [{ op: 'add', id: 'n1', afterId: 'start', label: 'X', ownerId: 'auto' }, { op: 'reassign', nodeId: 'ac2', ownerId: 'auto' }]);
    return JSON.stringify(p.activities) === before && b.length === 7 && b[0].change === 'added' && b.find(a => a.id === 'ac2')!.change === 'reassigned';
  });
  t('Indicadores quantitativos permanecem null (não calculável)', () => { const s = structural(seedDemo().activities); return s.cycleTime === null && s.cost === null && s.roi === null; });
  t('Importação: JSON inválido é rejeitado com detalhe', () => { const a = parseImport('{oops'), b = parseImport('{"name":"x"}'); return !a.ok && !b.ok && b.errors.length > 0; });
  t('Exportação/importação: round-trip preserva o projeto', () => { const p = seedDemo(), r = parseImport(JSON.stringify(exportEnvelope(p))); return r.ok && JSON.stringify(r.project) === JSON.stringify(p); });
  t('Gate: G3 pendente bloqueia a atividade 12', () => {
    const p = newProject('t'); p.consulting.currentStep = 12; p.consulting.gates.G1 = 'approved'; p.consulting.gates.G2 = 'approved';
    const r = canAccept(p, 12); p.consulting.gates.G3 = 'approved';
    return !r.ok && r.gate?.id === 'G3' && canAccept(p, 12).ok;
  });
  t('SimulationPort responde not-implemented', () => simulation.run().status === 'not-implemented');
  return res;
}
