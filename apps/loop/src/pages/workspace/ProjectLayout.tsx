import { Link, Outlet, useOutletContext, useParams } from 'react-router';
import { useProject } from '@/store/loop-store';
import type { Project } from '@/domain/schema';
import { Badge } from '@/components/ui/badge';
import { NavTabs } from '@/components/ui/segmented';
import { NotFound } from '../NotFound';

export const useCurrentProject = () => useOutletContext<Project>();

export function ProjectLayout() {
  const { id } = useParams();
  const p = useProject(id);
  if (!p) return <NotFound />;
  const base = `/app/projetos/${p.id}`;
  const tabs = [['Visão geral', ''], ['Consultoria', '/consultoria'], ['Descoberta 3×3', '/descoberta'], ['Organograma', '/organograma'], ['Processos', '/processos'], ['Oportunidades', '/oportunidades'], ['Cenários', '/cenarios'], ['Sistemas', '/sistemas'], ['Evidências', '/evidencias'], ['Apresentação', '/apresentacao'], ['Entregáveis', '/entregaveis']];
  return (
    <>
      <nav aria-label="Trilha" className="mb-2.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link to="/app">Workspace</Link> / <Link to="/app/projetos">Projetos</Link> / <b className="text-ink">{p.name}</b>
        <Badge tone={p.isDemo ? 'purple' : 'neutral'}>{p.isDemo ? 'Dados de exemplo' : 'Rascunho local'}</Badge>
      </nav>
      <NavTabs label="Módulos do projeto" className="no-print mb-4" items={tabs.map(([label, s]) => ({ to: base + s, label, end: s === '' }))} />
      <Outlet context={p} />
    </>
  );
}
