import { Link } from 'react-router';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardTitle, Eyebrow, Muted } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page';
import { BPM } from '@/domain/model';

const HOW = [
  ['01', 'Descoberta 3×3', 'Nove blocos em três fases. Cada resposta leva um estado de evidência.'],
  ['02', 'Organograma e fluxo', 'Projeções do mesmo modelo. Relações não informadas ficam “a confirmar”.'],
  ['03', 'Oportunidades por regras', 'Regras explícitas produzem candidatos, com fatos usados e lacunas.'],
  ['04', 'Cenários A/B/C', 'Diferenças estruturais. Números só com dados e fórmulas definidos.']
];
const AREAS = [
  ['LOOP CONSULTING', 'Soluções e limites', 'O que está disponível agora e o que depende de backend.', '/solucoes'],
  ['WORKSPACE DO CONSULTOR', 'Projetos, gates e entregáveis', 'Acesso direto em modo demo; não há login real.', '/app'],
  ['LOOP STUDIO', 'Abrir o projeto de exemplo', 'Formulário 3×3 com diagramas atualizados a cada alteração.', '/app/projetos/demo/descoberta'],
  ['PORTAL DO CLIENTE', 'Ver como o cliente acompanha', 'Fluxo, lacunas e validação, com perfil cliente ou consultor.', '/portal/demo']
];

export function Home() {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
        <PageHeader size="xl" eyebrow="Consultoria · modelagem organizacional" title={<>Veja a operação antes de decidir onde intervir.</>}
          lead="A LOOP modela organograma, fluxo de informação e cenários de intervenção em um único modelo. Cada afirmação mostra o seu estado de evidência: confirmado, informado, hipótese, restrito ou não informado."
          actions={<><ButtonLink to="/demonstracao" variant="primary" size="lg">Ver demonstração</ButtonLink><ButtonLink to="/metodo" size="lg">Conhecer o método</ButtonLink><ButtonLink to="/contato" size="lg">Contato</ButtonLink></>} />
        <dl className="m-0 grid grid-cols-3 gap-2">
          {[[BPM.steps.length, 'Atividades'], [BPM.phases.length, 'Fases'], [BPM.gates.length, 'Gates']].map(([v, l]) => (
            <Card key={l} className="min-w-[88px] p-3.5"><dd className="m-0 text-[22px] font-semibold">{String(v).padStart(2, '0')}</dd><dt className="eyebrow mt-1 text-[10px]">{l}</dt></Card>
          ))}
        </dl>
      </div>
      <Card className="mb-4">
        <Eyebrow>Como funciona</Eyebrow>
        <h2 className="mb-4 mt-1 text-lg font-semibold">Um modelo, quatro projeções</h2>
        <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {HOW.map(([n, t, d]) => (
            <li key={n} className="rounded-ds-lg border border-ds-line border-t-2 border-t-red p-3.5"><Eyebrow>{n}</Eyebrow><CardTitle className="mt-1.5 text-[14px]">{t}</CardTitle><Muted className="mt-1 text-xs">{d}</Muted></li>
          ))}
        </ol>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {AREAS.map(([e, t, d, to]) => (
          <Link key={to} to={to} className="group block no-underline"><Card className="h-full p-4 transition-colors group-hover:border-ds-line-strong"><Eyebrow>{e}</Eyebrow><CardTitle className="mt-1.5 group-hover:text-ds-accent">{t}</CardTitle><Muted className="mt-1">{d}</Muted></Card></Link>
        ))}
      </div>
    </>
  );
}
