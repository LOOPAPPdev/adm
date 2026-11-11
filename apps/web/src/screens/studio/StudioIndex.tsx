import { Link } from '@/lib/router';
import { useLoop } from '@/store/loop-store';
import { Badge } from '@/components/ui/badge';

const MODULES: [string, string][] = [
  ['Descoberta 3×3', 'descoberta'], ['Organograma', 'organograma'], ['Processos', 'processos'], ['Oportunidades', 'oportunidades'],
  ['Cenários', 'cenarios'], ['Sistemas', 'sistemas'], ['Evidências', 'evidencias'], ['Apresentação', 'apresentacao']
];

/** /studio: pick a project, then a Studio module. */
export function StudioIndex() {
  const projects = useLoop(s => s.projects.filter(p => !p.archived));
  return (
    <section>
      <p className="eyebrow">LOOP Studio</p>
      <h1 className="mt-1 text-ds-title font-semibold">Diagramas e processos por projeto</h1>
      {projects.length === 0 ? (
        <p className="mt-6 text-ds-muted">Nenhum projeto. <Link to="/app/projetos">Crie um projeto</Link> para abrir o Studio.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {projects.map(p => (
            <li key={p.id} className="rounded-ds-lg border border-ds-line bg-ds-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <Link to={`/app/projetos/${p.id}`} className="font-semibold">{p.name}</Link>
                {p.isDemo && <Badge tone="purple">Dados de exemplo</Badge>}
              </div>
              <nav aria-label={`Módulos do Studio em ${p.name}`} className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-ds-caption">
                {MODULES.map(([label, s]) => <Link key={s} to={`/app/projetos/${p.id}/${s}`}>{label}</Link>)}
              </nav>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
