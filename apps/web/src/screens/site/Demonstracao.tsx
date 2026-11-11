import { useMemo } from 'react';
import { FlowCanvas } from '@/components/diagrams/FlowCanvas';
import { PlaybackBar } from '@/components/PlaybackBar';
import { ButtonLink } from '@/components/ui/button';
import { Card, Eyebrow } from '@/components/ui/card';
import { Notice, PageHeader } from '@/components/ui/page';
import { Badge } from '@/components/ui/badge';
import { layoutFlow, seedDemo } from '@/domain/model';
import { usePlayback } from '@/lib/use-playback';

export function Demonstracao() {
  const demo = useMemo(seedDemo, []);
  const layout = useMemo(() => layoutFlow(demo.activities, demo.people, demo.discovery.B04[0].answer), [demo]);
  const pb = usePlayback(layout.count);
  return (
    <>
      <PageHeader eyebrow="Demonstração · dados de exemplo" title="Siga uma solicitação pela operação"
        lead="Este fluxo usa uma operação fictícia. O Play mostra a sequência das etapas e quem responde por cada uma. Não representa tempos reais nem execução de processo."
        actions={<><ButtonLink to="/app/projetos/demo/descoberta" variant="primary">Editar no Studio</ButtonLink><ButtonLink to="/app/projetos/demo/apresentacao">Modo apresentação</ButtonLink></>} />
      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><Eyebrow>Fluxo operacional · raias por responsável</Eyebrow></div><Badge tone="purple">Dados de exemplo</Badge></div>
        <FlowCanvas layout={layout} activeIdx={pb.idx} ariaLabel="Fluxo operacional de exemplo com raias por responsável" />
        <div className="mt-3"><PlaybackBar pb={pb} count={layout.count} /></div>
      </Card>
      <Notice className="mt-4">A animação é uma progressão visual (ProcessPlaybackPort). Execução BPMN e simulação de dinâmica de sistemas são motores separados e ainda não estão implementados.</Notice>
    </>
  );
}
