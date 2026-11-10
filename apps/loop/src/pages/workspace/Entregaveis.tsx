import { Download, FileCode2 } from 'lucide-react';
import { useCurrentProject } from './ProjectLayout';
import { BPM } from '@/domain/model';
import { toBpmnXml } from '@/domain/bpmn';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page';
import { useLoop } from '@/store/loop-store';
import { downloadText, slug } from '@/lib/download';
import { exportProject } from './Overview';

export function Entregaveis() {
  const p = useCurrentProject();
  const notify = useLoop(s => s.notify);
  const cur = p.consulting.currentStep;
  return (
    <>
      <PageHeader eyebrow="Workspace · entregáveis" title="Entregáveis por fase" lead="Estado derivado das atividades aceitas e dos gates registrados localmente."
        actions={<>
          <Button size="sm" onClick={() => exportProject(p, notify)}><Download size={14} /> Projeto (JSON)</Button>
          <Button size="sm" onClick={() => { const n = `loop-${slug(p.name)}.bpmn`; downloadText(n, toBpmnXml(p.activities, p.people, { name: p.name, startLabel: p.discovery.B04[0].answer }), 'application/xml'); notify(`Arquivo ${n} gerado.`); }}><FileCode2 size={14} /> Fluxo (BPMN XML)</Button>
        </>} />
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
          <thead><tr className="border-b border-stroke"><th className="p-3 eyebrow">Fase</th><th className="p-3 eyebrow">Entregável</th><th className="p-3 eyebrow">Gate</th><th className="p-3 eyebrow">Estado</th></tr></thead>
          <tbody>
            {BPM.phases.map(ph => {
              const done = ph.steps.every(n => n < cur), started = ph.steps.some(n => n <= cur);
              const g = ph.gate ? p.consulting.gates[ph.gate] : undefined;
              return (
                <tr key={ph.id} className="border-b border-soft">
                  <td className="p-3"><b>{ph.tag}</b><span className="block text-xs text-muted">{ph.title}</span></td>
                  <td className="p-3">{ph.output}</td>
                  <td className="p-3">{ph.gate ? <Badge tone={g === 'approved' ? 'green' : g === 'rejected' ? 'red' : 'neutral'}>{ph.gate} · {g === 'approved' ? 'aprovado' : g === 'rejected' ? 'não aprovado' : 'pendente'}</Badge> : <span className="text-muted">—</span>}</td>
                  <td className="p-3"><Badge tone={done ? 'green' : started ? 'blue' : 'dashed'}>{done ? 'Concluída' : started ? 'Em andamento' : 'Não iniciada'}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <Eyebrow className="mt-4">Os estados são locais e demonstrativos; não substituem aceite formal do cliente.</Eyebrow>
    </>
  );
}
