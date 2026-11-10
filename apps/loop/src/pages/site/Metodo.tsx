import { BpmMap } from '@/components/BpmMap';
import { PageHeader } from '@/components/ui/page';

export function Metodo() {
  return (
    <>
      <PageHeader eyebrow="Process model · BPM operacional da consultoria" title="Do primeiro contato ao próximo projeto"
        lead="23 atividades em 7 fases, com 5 gates de decisão. A demonstração (atividade 5) acontece antes da venda (gate G1). Clique numa atividade para ver entradas, ação, saída e critério de aceite." />
      <BpmMap />
    </>
  );
}
