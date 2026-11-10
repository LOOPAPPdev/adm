import { Card, CardTitle, Eyebrow, Muted } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, Notice } from '@/components/ui/page';

const PRODUCTS = [
  ['LOOP Core', 'Dados, modelagem organizacional, mapas causais e comparação estrutural. Opera sem IA generativa.', 'Disponível (local)', 'green'],
  ['LOOP Studio / Consulting', 'Abertura de projetos, descoberta 3×3, diagramas, oportunidades, cenários, apresentação e portal do cliente.', 'Disponível (local)', 'green'],
  ['Aplicação operacional do cliente', 'Tarefas, comunicação, documentos, indicadores e integrações. Configuração por caso de uso.', 'Depende de backend', 'neutral'],
  ['Agentes de cliente (opcionais)', 'Orquestrador, triagem, extração, rascunhos e Q&A. Executam processos do cliente; não são o motor de cálculo.', 'Opcional · contratado', 'purple']
] as const;
const NOW = ['Projetos, versões locais, importação e exportação JSON', 'Descoberta 3×3 com 5 estados de evidência', 'Organograma, fluxo com raias, Play/Pausa e exportação BPMN 2.0 (notação)', 'Regras determinísticas de oportunidade (5 regras versionadas)', 'Cenários A/B/C com diferenças estruturais', 'Mapa causal qualitativo com detecção de laços', 'Modo apresentação e portal do cliente (simulado)'];
const LATER = ['Login, perfis e permissões reais', 'Sincronização com o repositório do projeto do cliente', 'Envio de mensagens, e-mail e WhatsApp', 'Execução BPMN e motor de System Dynamics validados', 'Indicadores quantitativos (tempo, custo, ROI) com dados medidos', 'Agentes de IA em produção, com gates e auditoria'];

export function Solucoes() {
  return (
    <>
      <PageHeader eyebrow="LOOP Consulting · soluções" title="O que está disponível e o que depende de backend" lead="Separamos o que esta versão faz no navegador do que exige servidor, autenticação ou dados medidos do cliente." />
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        {PRODUCTS.map(([t, d, s, tone]) => <Card key={t} className="p-4"><div className="flex items-start justify-between gap-2"><CardTitle>{t}</CardTitle><Badge tone={tone}>{s}</Badge></div><Muted className="mt-1.5">{d}</Muted></Card>)}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Card><Eyebrow>Disponível nesta versão</Eyebrow><ul className="mb-0 mt-3 space-y-1.5 pl-5 text-[13px]">{NOW.map(x => <li key={x}>{x}</li>)}</ul></Card>
        <Card><Eyebrow>Requer backend ou dados do cliente</Eyebrow><ul className="mb-0 mt-3 space-y-1.5 pl-5 text-[13px] text-muted">{LATER.map(x => <li key={x}>{x}</li>)}</ul></Card>
      </div>
      <Notice className="mt-4">Um diagrama não produz sozinho uma previsão válida. Ganhos numéricos só são apresentados quando há baseline medido, fórmula e unidade definidos.</Notice>
    </>
  );
}
