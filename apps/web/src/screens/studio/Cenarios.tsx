import { useMemo, useState } from 'react';
import { Undo2 } from 'lucide-react';
import { useCurrentProject } from '../workspace/ProjectLayout';
import { applyScenario, layoutFlow, simulation, SIMULATION_REQUIREMENTS, uid } from '@/domain/model';
import type { ScenarioOp } from '@/domain/schema';
import { useLoop } from '@/store/loop-store';
import { chartData, diffRows, metricsRows, opsOf, type ScenarioKey } from '@/lib/scenario-vm';
import { FlowCanvas } from '@/components/diagrams/FlowCanvas';
import { ScenarioChart } from '@/components/ScenarioChart';
import { MetricsTable } from '@/components/MetricsTable';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, Muted } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input, Label, Select } from '@/components/ui/field';
import { Notice } from '@/components/ui/page';
import { Segmented } from '@/components/ui/segmented';
import { cn } from '@/lib/cn';

export function Cenarios() {
  const p = useCurrentProject();
  const update = useLoop(s => s.update), notify = useLoop(s => s.notify);
  const [key, setKey] = useState<ScenarioKey>('B');
  const [add, setAdd] = useState({ label: '', after: 'start', owner: 'auto' });
  const isA = key === 'A';
  const applied = useMemo(() => applyScenario(p.activities, opsOf(p, key)), [p, key]);
  const layout = useMemo(() => layoutFlow(applied, p.people, p.discovery.B04[0]?.answer), [applied, p.people, p.discovery]);
  const setOps = (fn: (o: ScenarioOp[]) => void) => update(p.id, c => { if (key !== 'A') fn(c.scenarios[key].ops); });
  const ownerOpts = [{ id: 'auto', label: 'Automação em estudo' }, ...p.people.map(x => ({ id: x.id, label: x.name || '(sem nome)' }))];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Segmented label="Cenários" value={key} onChange={k => { setKey(k); setAdd(a => ({ ...a, after: 'start' })); }} options={(['A', 'B', 'C'] as const).map(k => ({ value: k, label: `Cenário ${k}` }))} />
        <Badge tone={isA ? 'neutral' : 'purple'}>{isA ? 'Cenário A · baseline (as-is)' : `${p.scenarios[key].name} · hipótese`}</Badge>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="p-4">
          <Eyebrow className="mb-3">Fluxo do cenário {key}</Eyebrow>
          <FlowCanvas layout={layout} ariaLabel={`Fluxo do cenário ${key}`} height={Math.max(320, layout.height + 60)} />
          {!isA && (
            <>
              <Eyebrow className="mb-2 mt-4">Etapas · alterar responsável ou remover</Eyebrow>
              <ul className="m-0 list-none space-y-1.5 p-0">
                {applied.map(a => {
                  const added = a.change === 'added', removed = a.change === 'removed', base = p.activities.find(x => x.id === a.id);
                  return (
                    <li key={a.id} className="flex flex-wrap items-center gap-2 rounded-ds-md border border-ds-line px-2.5 py-1.5" data-testid={`scn-step-${a.id}`}>
                      <span className={cn('min-w-[160px] flex-1 text-[13px] font-semibold', removed && 'text-ds-muted line-through')}>{a.label}{added && <Badge tone="green" className="ml-1.5">novo</Badge>}</span>
                      <Select aria-label={`Responsável de ${a.label} no cenário ${key}`} className="h-8 w-auto max-w-[220px] text-xs" disabled={removed}
                        value={a.ownerId === 'auto' || p.people.some(y => y.id === a.ownerId) ? a.ownerId : ''}
                        onChange={e => { const v = e.target.value; setOps(o => {
                          if (added) { const x = o.find(y => y.op === 'add' && y.id === a.id); if (x && x.op === 'add') x.ownerId = v; return; }
                          const i = o.findIndex(y => y.op === 'reassign' && y.nodeId === a.id); if (i >= 0) o.splice(i, 1);
                          if (v !== base?.ownerId) o.push({ op: 'reassign', nodeId: a.id, ownerId: v });
                        }); }}>
                        <option value="">responsável a confirmar</option>{ownerOpts.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}
                      </Select>
                      <Button size="sm" variant="ghost" onClick={() => setOps(o => {
                        if (added) { o.splice(o.findIndex(y => y.op === 'add' && y.id === a.id), 1); return; }
                        const i = o.findIndex(y => y.op === 'remove' && y.nodeId === a.id); if (i >= 0) o.splice(i, 1); else o.push({ op: 'remove', nodeId: a.id });
                      })}>{added ? 'Excluir' : removed ? 'Restaurar' : 'Remover'}</Button>
                    </li>
                  );
                })}
              </ul>
              <form className="mt-3 grid gap-2 rounded-ds-lg border border-dashed border-ds-line-strong p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end" aria-label="Adicionar etapa ao cenário"
                onSubmit={e => { e.preventDefault(); const label = add.label.trim(); if (!label) return; setOps(o => { o.push({ op: 'add', id: uid('op'), afterId: add.after, label, ownerId: add.owner }); }); setAdd({ ...add, label: '' }); notify(`Etapa adicionada ao cenário ${key}.`); }}>
                <div><Label htmlFor="add-label">Nova etapa</Label><Input id="add-label" className="h-9" value={add.label} onChange={e => setAdd({ ...add, label: e.target.value })} placeholder="Ex.: Validar pedido" /></div>
                <div><Label htmlFor="add-after">Depois de</Label><Select id="add-after" className="h-9" value={add.after} onChange={e => setAdd({ ...add, after: e.target.value })}><option value="start">Início</option>{applied.filter(a => a.change !== 'removed').map(a => <option key={a.id} value={a.id}>{a.label}</option>)}</Select></div>
                <div><Label htmlFor="add-owner">Responsável</Label><Select id="add-owner" className="h-9" value={add.owner} onChange={e => setAdd({ ...add, owner: e.target.value })}>{ownerOpts.map(x => <option key={x.id} value={x.id}>{x.label}</option>)}</Select></div>
                <Button type="submit" variant="primary" size="sm" className="h-9" disabled={!add.label.trim()}>Adicionar</Button>
              </form>
            </>
          )}
        </Card>
        <div className="space-y-4">
          <Card className="p-4">
            <Eyebrow className="mb-2">Diferenças em relação a A</Eyebrow>
            {isA ? <Muted>O cenário A é o baseline declarado na descoberta. Edite-o em Descoberta 3×3 (B05).</Muted>
              : !opsOf(p, key).length ? <Muted>Nenhuma alteração. Adicione etapas, remova ou reatribua responsáveis.</Muted> : (
                <ul className="m-0 list-none space-y-1.5 p-0" data-testid="diff-list">
                  {diffRows(p, key).map(d => (
                    <li key={d.i} className="flex items-start justify-between gap-2 text-[12.5px]"><span><Badge tone={d.tone} className="mr-1.5">{d.kind}</Badge>{d.text}</span>
                      <Button size="icon" variant="ghost" aria-label="Desfazer alteração" onClick={() => setOps(o => { o.splice(d.i, 1); })}><Undo2 size={14} /></Button></li>
                  ))}
                </ul>
              )}
          </Card>
          <Card className="p-4"><Eyebrow className="mb-2">Indicadores · A × {key}</Eyebrow><MetricsTable rows={metricsRows(p, key)} colB={key} /></Card>
          <Card className="p-4"><Eyebrow className="mb-2">Comparação estrutural A / B / C</Eyebrow><ScenarioChart data={chartData(p)} /></Card>
          <Notice tone="red"><b>Simulação quantitativa: {simulation.run().status}.</b> Requer: {SIMULATION_REQUIREMENTS.join(', ').toLowerCase()}. Nenhum ganho numérico é apresentado como fato.</Notice>
        </div>
      </div>
    </div>
  );
}
