import { useMemo } from 'react';
import { useParams } from 'react-router';
import { Check, MessageSquareWarning, RotateCcw } from 'lucide-react';
import { BPM, gaps, layoutFlow, nextInfo } from '@/domain/model';
import { useLoop, useProject, type Role } from '@/store/loop-store';
import { FlowCanvas } from '@/components/diagrams/FlowCanvas';
import { Button, ButtonLink } from '@/components/ui/button';
import { Card, Eyebrow, Muted } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Empty, Notice, PageHeader } from '@/components/ui/page';
import { Segmented } from '@/components/ui/segmented';
import { cn } from '@/lib/cn';
import { NotFound } from '../NotFound';

const REVIEW = { pending: ['Aguardando revisão do cliente', 'neutral'], ok: ['Validação registrada localmente', 'green'], adjust: ['Ajustes solicitados localmente', 'red'] } as const;

/** Client portal preview. Roles are simulated: there is no authentication in v1.0. */
export function Portal() {
  const { id } = useParams();
  const p = useProject(id);
  const { update, portalRole, setPortalRole } = useLoop();
  const layout = useMemo(() => (p ? layoutFlow(p.activities, p.people, p.discovery.B04[0]?.answer) : null), [p]);
  if (!p || !layout) return <NotFound />;
  const gl = gaps(p), nx = nextInfo(p), cur = p.consulting.currentStep;
  const rv = REVIEW[p.portalReview];
  return (
    <>
      <PageHeader eyebrow={`Portal do cliente · ${p.isDemo ? 'dados de exemplo' : 'preview'}`} title={p.name}
        lead="Acompanhe o andamento, veja o fluxo modelado e indique se ele representa a sua operação."
        actions={<Segmented label="Perfil simulado" value={portalRole} onChange={(r: Role) => setPortalRole(r)} options={[{ value: 'cliente', label: 'Perfil Cliente' }, { value: 'consultor', label: 'Perfil Consultor' }]} />} />
      <Notice className="mb-4">Perfis simulados. Não há login nesta versão; em produção cada cliente acessa só o próprio projeto, com rota e senha próprias.</Notice>
      <Card className="mb-4 p-4">
        <Eyebrow className="mb-3">Andamento do projeto</Eyebrow>
        <ol className="m-0 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-4 lg:grid-cols-7" aria-label="Fases da consultoria">
          {BPM.phases.map(ph => {
            const done = ph.steps.every(n => n < cur), now = !done && ph.steps.some(n => n <= cur);
            return (
              <li key={ph.id} className={cn('rounded-xl border p-2.5', done ? 'border-[#cfe6dc] bg-green-soft' : now ? 'border-red bg-red-soft' : 'border-stroke bg-paper')}>
                <span className="eyebrow">{ph.tag}</span><span className="mt-0.5 block text-[12px] font-bold leading-tight">{ph.title}</span>
                <span className={cn('mt-1 block text-[10.5px] font-bold', done ? 'text-green' : now ? 'text-red' : 'text-muted')}>{done ? 'concluída' : now ? 'em andamento' : 'próxima'}</span>
              </li>
            );
          })}
        </ol>
        <Muted className="mt-3 text-xs">Próxima atividade: <b className="text-ink">{nx.no} · {nx.title}</b> · {nx.gate}</Muted>
      </Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-4">
          <Eyebrow className="mb-3">Fluxo modelado da sua operação</Eyebrow>
          {p.activities.length ? <FlowCanvas layout={layout} ariaLabel="Fluxo operacional modelado" height={Math.max(320, layout.height + 60)} /> : <Empty>O fluxo ainda não foi modelado.</Empty>}
        </Card>
        <div className="space-y-4">
          <Card className="p-4" data-testid="portal-review">
            <Eyebrow className="mb-2">Validação do modelo</Eyebrow>
            <Badge tone={rv[1]}>{rv[0]}</Badge>
            {portalRole === 'cliente' ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="success" onClick={() => update(p.id, c => { c.portalReview = 'ok'; }, 'Validação registrada localmente (demo).')}><Check size={14} /> O fluxo representa a operação</Button>
                <Button size="sm" variant="danger" onClick={() => update(p.id, c => { c.portalReview = 'adjust'; }, 'Pedido de ajustes registrado localmente (demo).')}><MessageSquareWarning size={14} /> Pedir ajustes</Button>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <ButtonLink size="sm" variant="primary" to={`/app/projetos/${p.id}/descoberta`}>Editar no Studio</ButtonLink>
                <Button size="sm" variant="ghost" onClick={() => update(p.id, c => { c.portalReview = 'pending'; }, 'Revisão reaberta.')}><RotateCcw size={14} /> Reabrir revisão</Button>
              </div>
            )}
          </Card>
          <Card className="p-4">
            <Eyebrow className="mb-2">O que ainda precisamos de você ({gl.length})</Eyebrow>
            {gl.length ? <ul className="mb-0 mt-0 space-y-1 pl-4 text-[12.5px]">{gl.slice(0, 10).map(g => <li key={g}>{g}</li>)}</ul> : <Muted>Nenhuma lacuna registrada.</Muted>}
            {gl.length > 10 && <Muted className="mt-1 text-xs">+ {gl.length - 10} itens.</Muted>}
          </Card>
        </div>
      </div>
    </>
  );
}
