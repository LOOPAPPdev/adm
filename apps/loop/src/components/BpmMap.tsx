import { useState } from 'react';
import { ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { BPM, canAccept, phaseOf, setGate } from '@/domain/model';
import type { Project } from '@/domain/schema';
import { useLoop } from '@/store/loop-store';
import { cn } from '@/lib/cn';
import { Button } from './ui/button';
import { Card, CardTitle, Eyebrow, Muted } from './ui/card';
import { Badge, type Tone } from './ui/badge';
import { Select } from './ui/field';
import { Notice } from './ui/page';
import { Segmented } from './ui/segmented';

const OWNER_TONE: Record<string, Tone> = { C: 'neutral', H: 'blue', P: 'purple', T: 'green' };
const GATE_LOOK = { pending: ['PENDENTE', 'neutral'], approved: ['APROVADO', 'green'], rejected: ['NÃO APROVADO', 'red'] } as const;
type Tab = 'mapa' | 'raias' | 'gates' | 'saidas';

/** Consulting BPM (23 activities, 7 phases, 5 gates). Read-only on /metodo; editable inside a project. */
export function BpmMap({ project }: { project?: Project }) {
  const editable = !!project;
  const update = useLoop(s => s.update);
  const cur = project?.consulting.currentStep ?? 0;
  const [sel, setSel] = useState(editable ? Math.min(cur, 23) : 5);
  const [tab, setTab] = useState<Tab>('mapa');
  const [filter, setFilter] = useState('all');
  const [block, setBlock] = useState<{ reason: string; evidence: string } | null>(null);

  const open = (n: number) => {
    if (n < 1 || n > 23) return;
    const ph = phaseOf(n);
    setSel(n); setTab('mapa'); setBlock(null);
    if (filter !== 'all' && filter !== ph.id) setFilter(ph.id);
  };
  const st = BPM.steps[sel - 1], sph = phaseOf(sel);
  const shown = BPM.phases.filter(p => filter === 'all' || p.id === filter);

  const accept = () => {
    if (!project) return;
    const r = canAccept(project, sel);
    if (!r.ok) { setBlock({ reason: r.reason, evidence: r.gate ? 'Evidência exigida: ' + r.gate.evidence : '' }); return; }
    update(project.id, c => { c.consulting.currentStep = sel + 1; }, `Aceite local da atividade ${sel} registrado.`);
    if (sel < 23) open(sel + 1);
  };
  const gate = (id: string, v: 'pending' | 'approved' | 'rejected') => project && update(project.id, c => setGate(c, id, v),
    v === 'rejected' ? `${id} não aprovado. Retorno à atividade ${BPM.returnTo[id]}.` : `${id}: estado local atualizado.`);

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <Segmented label="Visões do BPM" value={tab} onChange={setTab} options={[{ value: 'mapa', label: 'Mapa BPM' }, { value: 'raias', label: 'Raias / Equipe' }, { value: 'gates', label: 'Decisões' }, { value: 'saidas', label: 'Entregáveis' }]} />
        <div className="flex flex-wrap gap-2">
          <Select aria-label="Filtrar fase" className="h-9 w-auto min-w-[220px]" value={filter} disabled={tab !== 'mapa'}
            onChange={e => { const f = e.target.value, ph = BPM.phases.find(x => x.id === f); setFilter(f); if (ph && !ph.steps.includes(sel)) setSel(ph.steps[0]); }}>
            <option value="all">Todas as fases</option>
            {BPM.phases.map(p => <option key={p.id} value={p.id}>{p.tag} · {p.title}</option>)}
          </Select>
          <Button size="sm" onClick={() => window.print()}><Printer size={14} /> Imprimir</Button>
        </div>
      </div>

      {tab === 'mapa' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-3">
            {shown.map(ph => {
              const g = BPM.gates.find(x => x.id === ph.gate);
              return (
                <Card key={ph.id} className="p-4">
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                    <div><Eyebrow>{ph.tag} · atividades {ph.steps.length > 1 ? `${ph.steps[0]}–${ph.steps.at(-1)}` : ph.steps[0]}</Eyebrow><CardTitle className="mt-1">{ph.title}</CardTitle><Muted>{ph.sub}</Muted></div>
                    {g && <Badge tone={editable ? (GATE_LOOK[project!.consulting.gates[g.id]][1] as Tone) : 'neutral'}>{g.id} · {g.title}{editable ? ' · ' + GATE_LOOK[project!.consulting.gates[g.id]][0].toLowerCase() : ''}</Badge>}
                  </div>
                  <ol className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2 xl:grid-cols-3">
                    {ph.steps.map(n => {
                      const x = BPM.steps[n - 1], o = BPM.owners[x.owner];
                      return (
                        <li key={n}>
                          <button onClick={() => open(n)} aria-pressed={n === sel} aria-label={`Atividade ${n}: ${x.title}`}
                            className={cn('h-full w-full rounded-xl border bg-paper p-3 text-left transition-shadow', n === sel ? 'border-red shadow-[0_0_0_3px_#c9303815]' : 'border-soft hover:border-line-strong')}>
                            <div className="mb-1 flex items-center justify-between gap-2"><span className="text-[11px] font-extrabold text-muted">{String(n).padStart(2, '0')}</span>
                              {editable && <span className={cn('text-[10.5px] font-bold', n < cur ? 'text-green' : n === cur ? 'text-red' : 'text-transparent')}>{n < cur ? '✓ aceita' : n === cur ? '● atual' : '·'}</span>}</div>
                            <span className="block text-[13px] font-bold leading-snug">{x.title}</span>
                            <span className="mt-0.5 block text-[11.5px] text-muted">{x.caption}</span>
                            <Badge tone={OWNER_TONE[x.owner]} className="mt-2">{o.label}</Badge>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                  <p className="m-0 mt-3 text-xs text-muted"><b className="text-ink">Saída:</b> {ph.output}</p>
                </Card>
              );
            })}
          </div>
          <Card className="h-fit p-5 lg:sticky lg:top-4" aria-live="polite">
            <Eyebrow>PASSO {String(st.n).padStart(2, '0')} · FASE {sph.id}</Eyebrow>
            <h2 className="mb-1 mt-1.5 text-xl font-extrabold tracking-tight">{st.title}</h2>
            <Muted>{st.desc}</Muted>
            <dl className="mt-4 space-y-2.5">
              {[['Responsável principal', BPM.owners[st.owner].label], ['Entradas', st.input], ['Processamento / ação', st.action], ['Saída / artefato', st.output], ['Gate de aceite', st.accept], ['Potencial de automação / agentes', st.automation]].map(([l, v]) => (
                <div key={l} className="border-t border-soft pt-2"><dt className="eyebrow">{l}</dt><dd className="m-0 mt-0.5 text-[13px] leading-relaxed">{v}</dd></div>
              ))}
            </dl>
            {editable && <p className="mt-3 text-xs font-semibold text-muted">{sel < cur ? 'Aceita localmente.' : sel === cur ? 'Atividade atual do projeto.' : `Futura — atividade atual: ${cur}.`}</p>}
            {block && <Notice tone="red" className="mt-3"><b>Bloqueado.</b> {block.reason}{block.evidence && <><br />{block.evidence}</>}</Notice>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => open(sel - 1)} disabled={sel === 1}><ChevronLeft size={14} /> Anterior</Button>
              <Button size="sm" onClick={() => open(sel + 1)} disabled={sel === 23}>Próxima <ChevronRight size={14} /></Button>
              {editable && <Button size="sm" variant="primary" onClick={accept} disabled={sel !== cur}>Aceitar atividade (demo)</Button>}
            </div>
          </Card>
        </div>
      )}

      {tab === 'raias' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[980px] border-collapse text-left text-[12px]">
            <thead><tr><th className="sticky left-0 bg-paper p-3 eyebrow">Raia</th>{BPM.phases.map(p => <th key={p.id} className="border-l border-soft p-3 align-bottom"><span className="eyebrow">{p.tag}</span><span className="block text-[12px] font-bold normal-case">{p.title}</span></th>)}</tr></thead>
            <tbody>
              {(Object.keys(BPM.owners) as (keyof typeof BPM.owners)[]).map(k => (
                <tr key={k} className="border-t border-stroke">
                  <th scope="row" className="sticky left-0 bg-paper p-3 text-[12px] font-bold">{BPM.owners[k].lane}</th>
                  {BPM.phases.map(ph => (
                    <td key={ph.id} className="border-l border-soft p-2 align-top">
                      {ph.steps.map(n => BPM.steps[n - 1]).filter(x => x.owner === k).map(x => (
                        <button key={x.n} onClick={() => open(x.n)} className="mb-1.5 block w-full rounded-lg border border-stroke bg-soft px-2 py-1.5 text-left text-[11.5px] font-semibold hover:border-line-strong">{String(x.n).padStart(2, '0')} · {x.title}</button>
                      ))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'gates' && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {BPM.gates.map(g => {
            const gs = editable ? project!.consulting.gates[g.id] : 'pending';
            return (
              <Card key={g.id} className="p-4" data-testid={`gate-${g.id}`}>
                <div className="flex items-start justify-between gap-2"><Eyebrow>{g.id} · após a atividade {g.after}</Eyebrow><Badge tone={GATE_LOOK[gs][1] as Tone}>{GATE_LOOK[gs][0]}</Badge></div>
                <CardTitle className="mt-1.5">{g.title}</CardTitle>
                <p className="mb-1 mt-2 text-[12.5px]"><b className="text-green">Sim:</b> {g.yes}</p>
                <p className="m-0 text-[12.5px]"><b className="text-red">Não:</b> {g.no}</p>
                <Muted className="mt-2 text-xs">Evidência: {g.evidence}</Muted>
                {editable && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Button size="sm" variant="success" onClick={() => gate(g.id, 'approved')}>Aprovar</Button>
                    <Button size="sm" variant="danger" onClick={() => gate(g.id, 'rejected')}>Não aprovar</Button>
                    <Button size="sm" variant="ghost" onClick={() => gate(g.id, 'pending')}>Reabrir</Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab === 'saidas' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead><tr className="border-b border-stroke"><th className="p-3 eyebrow">Fase</th><th className="p-3 eyebrow">Entregável</th><th className="p-3 eyebrow">Condição de saída</th></tr></thead>
            <tbody>{BPM.phases.map(p => <tr key={p.id} className="border-b border-soft"><td className="p-3 font-bold">{p.tag}</td><td className="p-3">{p.output}</td><td className="p-3 text-muted">{p.condition}</td></tr>)}</tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
