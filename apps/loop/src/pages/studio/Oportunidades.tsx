import { Link } from 'react-router';
import { useCurrentProject } from '../workspace/ProjectLayout';
import { evaluate, GUARDRAILS, TRI_LABEL, uid, type RuleResult } from '@/domain/model';
import { useLoop } from '@/store/loop-store';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, Eyebrow, Muted } from '@/components/ui/card';
import { Badge, type Tone } from '@/components/ui/badge';
import { Notice } from '@/components/ui/page';

const LOOK: Record<RuleResult['state'], [string, Tone]> = { candidate: ['Candidato', 'purple'], confirm: ['Pedir confirmação', 'dashed'], nomatch: ['Sem correspondência', 'neutral'] };

export function Oportunidades() {
  const p = useCurrentProject();
  const update = useLoop(s => s.update);
  const res = evaluate(p);
  const addToB = (o: RuleResult) => update(p.id, c => {
    const last = c.activities[c.activities.length - 1];
    c.scenarios.B.ops.push({ op: 'add', id: uid('op'), ruleId: o.id, afterId: o.at === 'start' || !last ? 'start' : last.id, label: o.step, ownerId: 'auto' });
  }, `${o.id} adicionada ao cenário B como hipótese.`);
  return (
    <>
      <Notice tone="purple" className="mb-4">Regras explícitas e versionadas (não é IA). Uma correspondência indica um <b>candidato</b> a investigar; não comprova viabilidade nem ganho.</Notice>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {res.map(o => {
          const inB = p.scenarios.B.ops.some(x => x.op === 'add' && x.ruleId === o.id);
          return (
            <Card key={o.id} className="flex flex-col p-4" data-testid={`rule-${o.id}`}>
              <div className="flex items-start justify-between gap-2"><Eyebrow>{o.id} · v{o.version}</Eyebrow><Badge tone={LOOK[o.state][1]} data-testid={`rule-state-${o.id}`}>{LOOK[o.state][0]}</Badge></div>
              <CardTitle className="mt-1.5">{o.title}</CardTitle>
              <ul className="mb-0 mt-2 list-none space-y-0.5 p-0 text-[12.5px]">{o.facts.map(f => <li key={f.key}>{f.label}: <b className={f.value === 'yes' ? 'text-green' : f.value === 'no' ? 'text-red' : 'text-muted'}>{TRI_LABEL[f.value]}</b></li>)}</ul>
              <Muted className="mt-2 text-xs">{o.state === 'nomatch' ? 'A regra não corresponde aos fatos declarados.' : 'Lacunas: ' + o.gaps.join('; ') + '.'}</Muted>
              <div className="mt-auto pt-3">
                {o.state === 'candidate' && !inB && <Button size="sm" variant="primary" onClick={() => addToB(o)}>Adicionar ao cenário B</Button>}
                {inB && <Link to={`/app/projetos/${p.id}/cenarios`} className="text-xs font-bold">No cenário B → ver cenários</Link>}
              </div>
            </Card>
          );
        })}
      </div>
      <Card className="mt-4"><Eyebrow>Salvaguardas das regras</Eyebrow><ul className="mb-0 mt-2 pl-5 text-[13px] text-muted">{GUARDRAILS.map(g => <li key={g}>{g}</li>)}</ul></Card>
    </>
  );
}
