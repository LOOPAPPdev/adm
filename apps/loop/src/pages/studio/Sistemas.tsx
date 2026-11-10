import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useCurrentProject } from '../workspace/ProjectLayout';
import { canApproveLink, findLoops } from '@/domain/causal';
import { SIMULATION_REQUIREMENTS, STATUS_LABEL, simulation, uid } from '@/domain/model';
import { EVIDENCE, type CausalLink } from '@/domain/schema';
import { useLoop } from '@/store/loop-store';
import { CausalCanvas } from '@/components/diagrams/CausalCanvas';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, Muted } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input, Select } from '@/components/ui/field';
import { Notice } from '@/components/ui/page';

export function Sistemas() {
  const p = useCurrentProject();
  const { update, notify } = useLoop();
  const [blocked, setBlocked] = useState('');
  const { variables, links } = p.causal;
  const loops = useMemo(() => findLoops(variables, links), [variables, links]);
  const loopNodes = useMemo(() => new Set(loops.flatMap(l => l.nodes)), [loops]);
  const name = (id: string) => variables.find(v => v.id === id)?.label || '?';
  const setLink = (i: number, patch: Partial<CausalLink>) => {
    const next = { ...links[i], ...patch };
    if (next.status === 'confirmed') { const r = canApproveLink(next); if (!r.ok) { setBlocked(r.reason); return; } }
    setBlocked('');
    update(p.id, c => { Object.assign(c.causal.links[i], patch); });
  };

  return (
    <div className="space-y-4">
      <Notice tone="purple">Mapa causal qualitativo (CLD). Uma seta não prova causalidade (RN-04). Laços indicam padrões para investigar, não previsões.</Notice>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><Eyebrow>Diagrama de laços causais</Eyebrow><Muted className="text-xs">+ mesma direção · − direção oposta · ‖ atraso · tracejado = hipótese</Muted></div>
          {variables.length ? <CausalCanvas variables={variables} links={links} loopNodes={loopNodes} height={440} /> : <Muted>Adicione variáveis para começar.</Muted>}
          <Eyebrow className="mb-2 mt-4">Laços de realimentação ({loops.length})</Eyebrow>
          {!loops.length ? <Muted>Nenhum laço fechado.</Muted> : (
            <ul className="m-0 list-none space-y-1.5 p-0" data-testid="loops">
              {loops.map(l => <li key={l.id} className="text-[13px]"><Badge tone={l.kind === 'R' ? 'green' : 'blue'} className="mr-1.5">{l.kind === 'R' ? 'R · reforço' : 'B · equilíbrio'}</Badge>{l.nodes.map(name).join(' → ')} → {name(l.nodes[0])} <span className="text-xs text-ds-muted">· evidência mais fraca: {STATUS_LABEL[l.weakest]}</span></li>)}
            </ul>
          )}
        </Card>
        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between"><Eyebrow>Variáveis</Eyebrow><Button size="sm" onClick={() => update(p.id, c => { c.causal.variables.push({ id: uid('v'), label: 'Nova variável', unit: '', status: 'hypothesis' }); })}><Plus size={14} /> Variável</Button></div>
            <ul className="m-0 list-none space-y-1.5 p-0">
              {variables.map((v, i) => (
                <li key={v.id} className="grid grid-cols-[1fr_90px_auto] gap-1.5">
                  <Input aria-label={`Variável ${i + 1}`} className="h-8 text-xs" value={v.label} onChange={e => { const x = e.target.value; update(p.id, c => { c.causal.variables[i].label = x; }); }} />
                  <Input aria-label={`Unidade da variável ${i + 1}`} placeholder="unidade" className="h-8 text-xs" value={v.unit} onChange={e => { const x = e.target.value; update(p.id, c => { c.causal.variables[i].unit = x; }); }} />
                  <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Remover variável ${v.label}`} onClick={() => update(p.id, c => { c.causal.variables.splice(i, 1); c.causal.links = c.causal.links.filter(l => l.from !== v.id && l.to !== v.id); })}><Trash2 size={14} /></Button>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-4">
            <div className="mb-2 flex items-center justify-between"><Eyebrow>Relações</Eyebrow>
              <Button size="sm" disabled={variables.length < 2} onClick={() => update(p.id, c => { c.causal.links.push({ id: uid('l'), from: variables[0].id, to: variables[1].id, polarity: '+', delay: false, status: 'hypothesis', note: '' }); })}><Plus size={14} /> Relação</Button></div>
            {blocked && <Notice tone="red" className="mb-2">{blocked}</Notice>}
            <ul className="m-0 list-none space-y-2 p-0">
              {links.map((l, i) => (
                <li key={l.id} className="space-y-1.5 rounded-ds-md border border-ds-line p-2" data-testid={`link-${i}`}>
                  <div className="grid grid-cols-[1fr_56px_1fr] gap-1.5">
                    <Select aria-label={`Origem da relação ${i + 1}`} className="h-8 text-xs" value={l.from} onChange={e => setLink(i, { from: e.target.value })}>{variables.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}</Select>
                    <Select aria-label={`Polaridade da relação ${i + 1}`} className="h-8 px-2 text-xs" value={l.polarity} onChange={e => setLink(i, { polarity: e.target.value as '+' | '-' })}><option value="+">+</option><option value="-">−</option></Select>
                    <Select aria-label={`Destino da relação ${i + 1}`} className="h-8 text-xs" value={l.to} onChange={e => setLink(i, { to: e.target.value })}>{variables.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}</Select>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_auto] items-center gap-1.5">
                    <Input aria-label={`Fonte ou justificativa da relação ${i + 1}`} placeholder="Fonte / justificativa" className="h-8 text-xs" value={l.note} onChange={e => { const x = e.target.value; update(p.id, c => { c.causal.links[i].note = x; }); }} />
                    <Select aria-label={`Estado da relação ${i + 1}`} className="h-8 w-auto text-xs" value={l.status} onChange={e => setLink(i, { status: e.target.value as CausalLink['status'] })}>{EVIDENCE.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</Select>
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={l.delay} onChange={e => setLink(i, { delay: e.target.checked })} /> atraso</label>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => update(p.id, c => { c.causal.links.splice(i, 1); })}><Trash2 size={13} /> Remover</Button>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-4" data-testid="sim-gate">
            <Eyebrow className="mb-2">Gate de simulação quantitativa</Eyebrow>
            <Badge tone="red">{simulation.run().status}</Badge>
            <Muted className="mt-2">Para simular (System Dynamics) faltam:</Muted>
            <ul className="mb-2 mt-1 pl-5 text-[12.5px]">{SIMULATION_REQUIREMENTS.map(r => <li key={r}>{r}</li>)}</ul>
            <Button size="sm" onClick={() => notify('Simulação bloqueada: o modelo é qualitativo. A análise qualitativa continua disponível.')}>Solicitar valores futuros</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
