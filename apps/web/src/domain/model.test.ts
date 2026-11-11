import { describe, expect, it } from 'vitest';
import { BpmnModdle } from 'bpmn-moddle';
import { runSelfTests } from './self-tests';
import { applyScenario, evaluate, exportEnvelope, gaps, newProject, parseImport, seedCleanSea, seedDemo, setGate, validateProject } from './model';
import { toBpmnXml } from './bpmn';
import { canApproveLink, findLoops } from './causal';
import { Project } from './schema';
import { DexieProjectRepository } from '@/ports/DexieProjectRepository';
import { MemoryProjectRepository } from '@/ports/MemoryProjectRepository';
import { HttpProjectRepository } from '@/ports/HttpProjectRepository';
import { useLoop } from '@/store/loop-store';

describe('self-tests do domínio (paridade com o protótipo)', () => {
  for (const t of runSelfTests()) it(t.name, () => expect(t.pass, t.note).toBe(true));
});

describe('seeds', () => {
  it('demo e Clean Sea passam no schema', () => {
    expect(validateProject(seedDemo())).toEqual([]);
    expect(validateProject(seedCleanSea())).toEqual([]);
  });
  it('Clean Sea: CRM não é inferido; R-CRM não vira candidato', () => {
    const r = evaluate(seedCleanSea());
    expect(r.find(x => x.id === 'R-CRM')!.state).toBe('confirm');
    expect(r.filter(x => x.state === 'candidate').map(x => x.id).sort()).toEqual(['R-ALERT', 'R-DOCS', 'R-UNIFY']);
  });
  it('Clean Sea: atividade sem responsável aparece como lacuna', () => {
    expect(gaps(seedCleanSea())).toContain('B05 · Responsável de "Monitorar navio" a confirmar');
  });
  it('fato "não" desqualifica a regra', () => {
    const p = seedDemo(); p.facts.humanRouting = 'no';
    expect(evaluate(p).find(x => x.id === 'R-TRIAGE')!.state).toBe('nomatch');
  });
});

describe('importação', () => {
  it('aceita export do protótipo Claude Design (sem campo causal)', () => {
    const p = seedDemo() as Record<string, unknown>; delete p.causal;
    const r = parseImport(JSON.stringify({ schema: 'loop.project', schemaVersion: 1, exportedAt: '', notice: '', project: p }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.project.causal).toEqual({ variables: [], links: [] });
  });
  it('rejeita estado de evidência desconhecido com caminho do campo', () => {
    const p = seedDemo() as unknown as { discovery: Record<string, { status: string }[]> };
    p.discovery.B01[0].status = 'talvez';
    const r = parseImport(JSON.stringify(p));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.join(' ')).toMatch(/discovery\.B01\.0\.status/);
  });
  it('rejeita bloco ausente e array no lugar de objeto', () => {
    const p = seedDemo() as unknown as { discovery: Record<string, unknown> }; delete p.discovery.B07;
    const r = parseImport(JSON.stringify(p));
    expect(!r.ok && r.errors.some(e => e.includes('B07'))).toBe(true);
    expect(parseImport('[]').ok).toBe(false);
  });
  it('gera id quando ausente', () => {
    const p = seedDemo() as Partial<ReturnType<typeof seedDemo>>; delete p.id;
    const r = parseImport(JSON.stringify(exportEnvelope(p as never)));
    expect(r.ok && r.project.id.startsWith('prj_')).toBe(true);
  });
});

describe('gates', () => {
  it('rejeitar G4 devolve o projeto à atividade 14', () => {
    const p = newProject('t'); p.consulting.currentStep = 19;
    setGate(p, 'G4', 'rejected');
    expect(p.consulting.currentStep).toBe(14);
  });
});

describe('cenários', () => {
  it('remove e reatribui sem tocar no baseline', () => {
    const p = seedDemo();
    const b = applyScenario(p.activities, [{ op: 'remove', nodeId: 'ac4' }, { op: 'reassign', nodeId: 'ac6', ownerId: 'auto' }]);
    expect(b.find(a => a.id === 'ac4')!.change).toBe('removed');
    expect(p.activities.find(a => a.id === 'ac6')!.ownerId).toBe('pe5');
  });
});

describe('BPMN XML', () => {
  it('gera XML que o bpmn-moddle lê sem avisos', async () => {
    const p = seedDemo();
    const xml = toBpmnXml(p.activities, p.people, { name: p.name, startLabel: 'Solicitação recebida' });
    const { rootElement, warnings } = await new BpmnModdle().fromXML(xml);
    expect(warnings).toEqual([]);
    const proc = (rootElement as unknown as { rootElements: { $type: string; isExecutable?: boolean; flowElements?: unknown[] }[] }).rootElements.find(e => e.$type === 'bpmn:Process')!;
    expect(proc.isExecutable).toBe(false);
    expect(proc.flowElements!.length).toBe(8 + 7); // 6 atividades + início + fim, 7 fluxos
  });
  it('escapa caracteres especiais', () => {
    const p = newProject('A & <B>'); p.activities = [{ id: 'x', label: 'Ok? "sim" & <não>', type: 'task', ownerId: '' }];
    expect(toBpmnXml(p.activities, p.people, { name: p.name })).toContain('Ok? &quot;sim&quot; &amp; &lt;não&gt;');
  });
});

describe('mapa causal', () => {
  it('detecta laço de reforço (R) e de balanço (B)', () => {
    const p = seedDemo();
    const loops = findLoops(p.causal.variables, p.causal.links);
    expect(loops).toHaveLength(1);
    expect(loops[0].kind).toBe('R');
    const bal = findLoops(p.causal.variables, [...p.causal.links.slice(0, 2), { ...p.causal.links[2], polarity: '-' }]);
    expect(bal[0].kind).toBe('B');
  });
  it('relação sem justificativa não pode ser confirmada', () => {
    expect(canApproveLink({ id: 'x', from: 'a', to: 'b', polarity: '+', delay: false, status: 'hypothesis', note: ' ' }).ok).toBe(false);
  });
});

describe('repositórios', () => {
  it('Dexie: put/list/remove com IndexedDB', async () => {
    const repo = new DexieProjectRepository('loop-test-' + Math.random());
    const p = seedDemo();
    await repo.put(p);
    expect((await repo.list()).map(x => x.id)).toEqual(['demo']);
    await repo.remove('demo');
    expect(await repo.list()).toEqual([]);
  });
  it('Dexie: registro inválido é ignorado na leitura', async () => {
    const repo = new DexieProjectRepository('loop-test-' + Math.random());
    await repo.put({ id: 'bad', name: '' } as never);
    expect(await repo.list()).toEqual([]);
  });
  it('HTTP: contrato existe e falha explicitamente', async () => {
    await expect(new HttpProjectRepository('/api').list()).rejects.toThrow(/não implementado/);
  });
});

describe('store', () => {
  it('cria o demo, salva alterações e as relê do repositório', async () => {
    const repo = new MemoryProjectRepository();
    await useLoop.getState().init(repo);
    expect(useLoop.getState().projects.map(p => p.id)).toEqual(['demo']);
    useLoop.getState().update('demo', p => { p.name = 'Renomeado'; });
    await new Promise(r => setTimeout(r, 0));
    expect((await repo.list())[0].name).toBe('Renomeado');
    expect(Project.safeParse((await repo.list())[0]).success).toBe(true);
  });
});
