import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { FileCode2 } from 'lucide-react';
import { useCurrentProject } from '../workspace/ProjectLayout';
import { layoutFlow, ownerName } from '@/domain/model';
import { toBpmnXml } from '@/domain/bpmn';
import { useLoop } from '@/store/loop-store';
import { usePlayback } from '@/lib/use-playback';
import { downloadText, slug } from '@/lib/download';
import { FlowCanvas } from '@/components/diagrams/FlowCanvas';
import { BpmnView } from '@/components/diagrams/BpmnView';
import { PlaybackBar } from '@/components/PlaybackBar';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, Muted } from '@/components/ui/card';
import { Input, Label, Select } from '@/components/ui/field';
import { Empty, Notice } from '@/components/ui/page';
import { Segmented } from '@/components/ui/segmented';

export function Processos() {
  const p = useCurrentProject();
  const { update, notify } = useLoop();
  const [view, setView] = useState<'flow' | 'bpmn'>('flow');
  const [sel, setSel] = useState('');
  const start = p.discovery.B04[0]?.answer ?? '';
  const layout = useMemo(() => layoutFlow(p.activities, p.people, start), [p.activities, p.people, start]);
  const xml = useMemo(() => toBpmnXml(p.activities, p.people, { name: p.name, startLabel: start }), [p.activities, p.people, p.name, start]);
  const pb = usePlayback(layout.count);
  if (!p.activities.length) return <Empty>Nenhuma atividade declarada. Preencha B05 na <Link to={`/app/projetos/${p.id}/descoberta`}>Descoberta 3×3</Link>.</Empty>;
  const i = layout.nodes.findIndex(n => n.id === sel), n = layout.nodes[i];
  const ai = p.activities.findIndex(a => a.id === sel), act = p.activities[ai];
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Segmented label="Notação" value={view} onChange={setView} options={[{ value: 'flow', label: 'Fluxo com raias' }, { value: 'bpmn', label: 'BPMN 2.0 (leitura)' }]} />
          <Button size="sm" onClick={() => { const name = `loop-${slug(p.name)}.bpmn`; downloadText(name, xml, 'application/xml'); notify(`Arquivo ${name} gerado.`); }}><FileCode2 size={14} /> Exportar BPMN</Button>
        </div>
        {view === 'flow' ? (
          <>
            <FlowCanvas layout={layout} activeIdx={pb.idx} selectedId={sel} onPick={setSel} height={Math.max(360, layout.height + 60)} ariaLabel="Fluxo operacional com raias por responsável" />
            <div className="mt-3"><PlaybackBar pb={pb} count={layout.count} /></div>
          </>
        ) : <BpmnView xml={xml} height={Math.max(360, layout.height + 80)} />}
        <Notice className="mt-3">{view === 'flow' ? 'Play mostra uma progressão visual, não execução BPMN.' : 'Projeção em BPMN 2.0 para leitura e troca com outras ferramentas. O processo não é executável (isExecutable="false"): faltam condições, eventos e dados.'}</Notice>
      </Card>
      <Card className="h-fit" aria-live="polite">
        {!n ? <Muted>Clique numa etapa do fluxo para ver entrada, saída e responsável.</Muted> : (
          <>
            <Eyebrow>{n.type === 'task' ? 'Tarefa' : n.type === 'gateway' ? 'Decisão' : n.type === 'start' ? 'Evento de início (B04)' : 'Evento de fim'}</Eyebrow>
            <h2 className="mb-3 mt-1 text-lg font-semibold">{n.label}</h2>
            {act && (
              <div className="mb-3 grid gap-2">
                <div><Label htmlFor="sel-label">Nome</Label><Input id="sel-label" value={act.label} onChange={e => { const v = e.target.value; update(p.id, c => { c.activities[ai].label = v; }); }} /></div>
                <div><Label htmlFor="sel-owner">Responsável</Label>
                  <Select id="sel-owner" value={p.people.some(x => x.id === act.ownerId) ? act.ownerId : ''} onChange={e => { const v = e.target.value; update(p.id, c => { c.activities[ai].ownerId = v; }); }}>
                    <option value="">responsável a confirmar</option>{p.people.map(x => <option key={x.id} value={x.id}>{x.name || '(sem nome)'}</option>)}
                  </Select></div>
              </div>
            )}
            <dl className="space-y-2.5">
              {[['Entrada (derivada da sequência)', i > 0 ? layout.nodes[i - 1].label : '—'], ['Saída (derivada da sequência)', i < layout.nodes.length - 1 ? layout.nodes[i + 1].label : '—'], ['Responsável', act ? ownerName(p.people, act.ownerId) : '—']].map(([l, v]) => (
                <div key={l} className="border-t border-ds-line pt-2"><dt className="eyebrow">{l}</dt><dd className="m-0 mt-0.5 text-[13px]">{v}</dd></div>
              ))}
            </dl>
          </>
        )}
      </Card>
    </div>
  );
}
