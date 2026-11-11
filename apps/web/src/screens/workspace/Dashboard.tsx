import { Link } from '@/lib/router';
import { BPM, nextInfo } from '@/domain/model';
import { useLoop } from '@/store/loop-store';
import { ButtonLink } from '@/components/ui/button';
import { Card, Eyebrow, Muted } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Empty, PageHeader } from '@/components/ui/page';

export function Dashboard() {
  const projects = useLoop(s => s.projects);
  const act = projects.filter(p => !p.archived);
  const pend = act.reduce((n, p) => n + BPM.gates.filter(g => p.consulting.gates[g.id] !== 'approved').length, 0);
  const rows = [...act].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 6);
  return (
    <>
      <PageHeader eyebrow="Workspace do consultor" title="Painel" lead="Acesso direto em modo demo. Não há autenticação nesta versão." actions={<ButtonLink to="/app/projetos" variant="primary">Projetos</ButtonLink>} />
      <dl className="mb-4 grid grid-cols-3 gap-3">
        {[[act.length, 'Projetos ativos'], [pend, 'Gates pendentes'], [projects.length - act.length, 'Arquivados']].map(([v, l]) => (
          <Card key={l} className="p-4"><dd className="m-0 text-[26px] font-semibold">{String(v).padStart(2, '0')}</dd><dt className="eyebrow mt-1">{l}</dt></Card>
        ))}
      </dl>
      <Card>
        <Eyebrow className="mb-3">Atualizados recentemente</Eyebrow>
        {!rows.length ? <Empty>Nenhum projeto ativo. <Link to="/app/projetos">Criar projeto</Link>.</Empty> : (
          <ul className="m-0 list-none divide-y divide-ds-line p-0">
            {rows.map(p => { const n = nextInfo(p); return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="min-w-0"><Link to={`/app/projetos/${p.id}`} className="text-[14px] font-semibold">{p.name}</Link><Muted className="mt-0.5 text-xs"><b className="text-ds-accent">{n.no}</b> · {n.title} · {n.gate}</Muted></div>
                <Badge tone={p.isDemo ? 'purple' : 'neutral'}>{p.isDemo ? 'Dados de exemplo' : 'Rascunho local'}</Badge>
              </li>); })}
          </ul>
        )}
      </Card>
    </>
  );
}
