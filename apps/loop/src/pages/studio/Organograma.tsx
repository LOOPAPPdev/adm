import { useState } from 'react';
import { Link } from 'react-router';
import { useCurrentProject } from '../workspace/ProjectLayout';
import { orgStructure } from '@/domain/model';
import { OrgCanvas } from '@/components/diagrams/OrgCanvas';
import { Card, Eyebrow, Muted } from '@/components/ui/card';
import { Empty } from '@/components/ui/page';

export function Organograma() {
  const p = useCurrentProject();
  const [sel, setSel] = useState('');
  const sp = p.people.find(x => x.id === sel);
  const boss = sp && p.people.find(x => x.id === sp.reportsTo);
  const s = orgStructure(p.people);
  if (!p.people.length) return <Empty>Nenhuma pessoa declarada. Preencha B02 na <Link to={`/app/projetos/${p.id}/descoberta`}>Descoberta 3×3</Link>.</Empty>;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><Eyebrow>Organograma · projeção de B02</Eyebrow><Muted className="text-xs">{p.people.length} nós · {s.pending.length} com reporte a confirmar · clique para detalhar</Muted></div>
        <OrgCanvas people={p.people} selectedId={sel} onPick={setSel} height={520} ariaLabel="Organograma do projeto" />
      </Card>
      <Card className="h-fit" aria-live="polite">
        {!sp ? <Muted>Selecione um nó para ver função, reporte e atividades associadas.</Muted> : (
          <>
            <Eyebrow>{sp.kind === 'area' ? 'área' : sp.kind}</Eyebrow>
            <h2 className="mb-3 mt-1 text-lg font-extrabold">{sp.name || '(sem nome)'}</h2>
            <dl className="space-y-2.5">
              {[['Função', sp.role || 'não informada'], ['Reporta a', sp.reportsTo === 'top' ? 'Topo da estrutura' : boss ? boss.name : 'a confirmar'],
                ['Atividades associadas (B05)', p.activities.filter(a => a.ownerId === sp.id).map(a => a.label).join(' · ') || 'Nenhuma atividade declarada para este nó.'],
                ['Subordinados diretos', p.people.filter(x => x.reportsTo === sp.id).map(x => x.name).join(' · ') || 'nenhum declarado']].map(([l, v]) => (
                <div key={l} className="border-t border-soft pt-2"><dt className="eyebrow">{l}</dt><dd className="m-0 mt-0.5 text-[13px]">{v}</dd></div>
              ))}
            </dl>
          </>
        )}
      </Card>
    </div>
  );
}
