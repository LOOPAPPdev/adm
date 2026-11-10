import { Link } from 'react-router';
import { Download, ExternalLink } from 'lucide-react';
import { useCurrentProject } from './ProjectLayout';
import { allQuestions, evaluate, exportEnvelope, gaps, nextInfo } from '@/domain/model';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, CardTitle, Eyebrow, Muted } from '@/components/ui/card';
import { EvidenceCounts } from '@/components/EvidenceCounts';
import { downloadText, slug } from '@/lib/download';
import { useLoop } from '@/store/loop-store';
import { clone } from '@/domain/model';

export function exportProject(p: ReturnType<typeof useCurrentProject>, notify: (m: string) => void) {
  const c = clone(p); c.version = (c.version || 1) + 1;
  const name = `loop-${slug(p.name)}.json`;
  downloadText(name, JSON.stringify(exportEnvelope(c), null, 2));
  notify(`Arquivo ${name} gerado.`);
}

export function Overview() {
  const p = useCurrentProject();
  const notify = useLoop(s => s.notify);
  const qs = allQuestions(p), nx = nextInfo(p), gl = gaps(p);
  const base = `/app/projetos/${p.id}`;
  const modules = [
    ['Consultoria · BPM', '/consultoria', `${nx.no} · ${nx.gate}`], ['Descoberta 3×3', '/descoberta', `${qs.filter(q => q.answer.trim()).length} de ${qs.length} perguntas respondidas`],
    ['Organograma', '/organograma', `${p.people.length} nós declarados`], ['Fluxo operacional', '/processos', `${p.activities.length} atividades declaradas`],
    ['Oportunidades', '/oportunidades', `${evaluate(p).filter(o => o.state === 'candidate').length} candidatos por regras`], ['Cenários A/B/C', '/cenarios', `${p.scenarios.B.ops.length} alterações em B · ${p.scenarios.C.ops.length} em C`],
    ['Sistemas (causal)', '/sistemas', `${p.causal.variables.length} variáveis · ${p.causal.links.length} relações`], ['Apresentação', '/apresentacao', `6 etapas · ${gl.length} lacunas`]
  ];
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <Eyebrow>Contexto · B01</Eyebrow>
        <h1 className="mb-1 mt-1.5 text-[clamp(24px,3.4vw,32px)] font-semibold tracking-[-0.04em]">{p.name}</h1>
        <Muted className="text-sm">{p.discovery.B01[0].answer.trim() || 'Objetivo não informado. Preencha B01 na Descoberta 3×3.'}</Muted>
        <Eyebrow className="mb-2 mt-5">Módulos</Eyebrow>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map(([t, s, st]) => (
            <Link key={t} to={base + s} className="group block rounded-ds-lg border border-ds-line bg-ds-surface p-3.5 no-underline hover:border-ds-line-strong"><CardTitle className="text-[13.5px] group-hover:text-ds-accent">{t}</CardTitle><Muted className="mt-2 text-xs">{st}</Muted></Link>
          ))}
        </div>
      </Card>
      <Card className="h-fit">
        <Eyebrow className="mb-2">Estado da informação</Eyebrow>
        <EvidenceCounts items={qs} />
        <div className="mt-4 border-t border-ds-line pt-3"><Eyebrow>Próxima atividade da consultoria</Eyebrow><p className="m-0 mt-1 text-[13px]"><b className="text-ds-accent">{nx.no}</b> {nx.title}</p></div>
        <div className="mt-3 border-t border-ds-line pt-3"><Eyebrow>Próximo gate</Eyebrow><p className="m-0 mt-1 text-[13px]">{nx.gate}</p></div>
        <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" onClick={() => exportProject(p, notify)}><Download size={14} /> Exportar JSON</Button><ButtonLink size="sm" to={`/portal/${p.id}`}><ExternalLink size={14} /> Preview do portal</ButtonLink></div>
      </Card>
    </div>
  );
}
