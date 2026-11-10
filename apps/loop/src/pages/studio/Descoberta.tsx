import { useEffect, useMemo, useRef, useState } from 'react';
import { useFieldArray, useForm, type Control, type UseFormRegister, type FieldErrors, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useCurrentProject } from '../workspace/ProjectLayout';
import { BLOCKS, FACTS, PHASES3, STATUS_LABEL, TRI_LABEL, allQuestions, gaps, layoutFlow, uid } from '@/domain/model';
import { Activity, EVIDENCE, Person, Question, TriState } from '@/domain/schema';
import { useLoop } from '@/store/loop-store';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, Eyebrow, Muted } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { FieldError, Input, Label, Select, Textarea } from '@/components/ui/field';
import { Empty, Notice } from '@/components/ui/page';
import { Segmented } from '@/components/ui/segmented';
import { FlowCanvas } from '@/components/diagrams/FlowCanvas';
import { OrgCanvas } from '@/components/diagrams/OrgCanvas';
import { EvidenceCounts } from '@/components/EvidenceCounts';

/** Form schema: reuses the domain entities and adds UI rules (RQ-02: no status without an answer). */
const DiscoveryForm = z.object({
  discovery: z.record(z.string(), z.array(Question.superRefine((q, ctx) => {
    if (!q.answer.trim() && q.status !== 'unknown' && q.status !== 'restricted') ctx.addIssue({ code: 'custom', path: ['status'], message: 'Escreva a resposta antes de definir o estado.' });
    if (!q.text.trim()) ctx.addIssue({ code: 'custom', path: ['text'], message: 'A pergunta não pode ficar vazia.' });
  }))),
  facts: z.record(z.string(), TriState),
  people: z.array(Person.superRefine((p, ctx) => { if (!p.name.trim()) ctx.addIssue({ code: 'custom', path: ['name'], message: 'Informe o nome ou a função.' }); })),
  activities: z.array(Activity.superRefine((a, ctx) => { if (!a.label.trim()) ctx.addIssue({ code: 'custom', path: ['label'], message: 'Informe o nome da atividade.' }); }))
});
type FormValues = z.input<typeof DiscoveryForm>;
type FormOut = z.output<typeof DiscoveryForm>;
type Ctl = Control<FormValues, unknown, FormOut>;

export function Descoberta() {
  const p = useCurrentProject();
  // Remount the form only when the project changes, never on its own autosave.
  return <DiscoveryEditor key={p.id} />;
}

function DiscoveryEditor() {
  const p = useCurrentProject();
  const update = useLoop(s => s.update);
  const [phase, setPhase] = useState('A');
  const [preview, setPreview] = useState<'flow' | 'org'>('flow');
  const [open, setOpen] = useState(true);
  const { control, register, watch, trigger, formState: { errors } } = useForm<FormValues, unknown, FormOut>({
    resolver: zodResolver(DiscoveryForm), mode: 'onChange',
    defaultValues: { discovery: p.discovery, facts: p.facts, people: p.people, activities: p.activities }
  });

  // Autosave: debounce form changes into the store (single write path). Normalizes RQ-02 cases.
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pending = useRef<FormValues | null>(null);
  useEffect(() => {
    const flush = () => {
      const v = pending.current; pending.current = null;
      if (!v) return;
      update(p.id, c => {
        c.discovery = Object.fromEntries(Object.entries(v.discovery).map(([k, qs]) => [k, (qs ?? []).map(q => ({ ...q, custom: !!q.custom, answer: q.status === 'restricted' && !q.answer.trim() ? '(restrito)' : q.answer }))]));
        c.facts = { ...c.facts, ...v.facts };
        c.people = (v.people ?? []).map(x => ({ ...x, kind: x.kind ?? 'pessoa' }));
        c.activities = (v.activities ?? []).map(x => ({ ...x }));
      });
    };
    const sub = watch(v => { pending.current = structuredClone(v) as FormValues; clearTimeout(timer.current); timer.current = setTimeout(flush, 300); });
    return () => { sub.unsubscribe(); clearTimeout(timer.current); flush(); };
  }, [watch, update, p.id]);

  const qs = allQuestions(p), gl = gaps(p);
  const layout = useMemo(() => layoutFlow(p.activities, p.people, p.discovery.B04[0]?.answer), [p.activities, p.people, p.discovery]);
  const people = useWatch({ control, name: 'people' });

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,560px)_minmax(0,1fr)]">
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div><Eyebrow>Descoberta · 3 fases × 3 blocos</Eyebrow><p className="m-0 mt-0.5 text-[13px] text-muted" data-testid="discovery-progress">{qs.filter(q => q.answer.trim()).length} de {qs.length} respostas · {gl.length} lacunas</p></div>
          <Button size="sm" variant="ghost" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Recolher perguntas' : 'Mostrar perguntas'}</Button>
        </div>
        <Segmented label="Fases da descoberta" className="mb-3" value={phase} onChange={setPhase} options={PHASES3.map(f => ({ value: f.id, label: `Fase ${f.id} · ${f.title}` }))} />
        {open && (
          <form noValidate onSubmit={e => e.preventDefault()} aria-label="Formulário de descoberta 3×3" className="space-y-3">
            {BLOCKS.map(b => (
              <Card key={b.id} className={phase === b.phase ? 'p-4' : 'hidden'}>
                <div className="mb-3 flex items-baseline gap-2"><span className="rounded-md bg-soft px-1.5 py-0.5 text-[11px] font-extrabold text-muted">{b.id}</span><CardTitle>{b.title}</CardTitle></div>
                <Questions block={b.id} control={control} register={register} errors={errors} trigger={trigger} />
                {FACTS.filter(f => f.block === b.id).length > 0 && (
                  <div className="mt-3 grid gap-2 border-t border-soft pt-3 sm:grid-cols-2">
                    {FACTS.filter(f => f.block === b.id).map(f => (
                      <div key={f.key}><Label htmlFor={`fact-${f.key}`} className="font-semibold">{f.label}</Label>
                        <Select id={`fact-${f.key}`} className="h-9" {...register(`facts.${f.key}`)}>{(['unknown', 'yes', 'no'] as const).map(v => <option key={v} value={v}>{TRI_LABEL[v]}</option>)}</Select></div>
                    ))}
                  </div>
                )}
                {b.id === 'B02' && <PeopleEditor control={control} register={register} errors={errors} />}
                {b.id === 'B05' && <ActivitiesEditor control={control} register={register} errors={errors} people={people} />}
              </Card>
            ))}
          </form>
        )}
        <Notice className="mt-3">Campos em branco ficam <b>não informado</b>. O sistema não preenche valores ausentes nem eleva hipóteses a confirmado.</Notice>
      </div>
      <div className="space-y-3 xl:sticky xl:top-4 xl:self-start">
        <Card className="p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><Eyebrow>Prévia ao vivo</Eyebrow>
            <Segmented label="Tipo de prévia" value={preview} onChange={setPreview} options={[{ value: 'flow', label: 'Fluxo' }, { value: 'org', label: 'Organograma' }]} /></div>
          {preview === 'flow'
            ? (p.activities.length ? <FlowCanvas layout={layout} ariaLabel="Prévia do fluxo operacional" height={380} /> : <Empty>Nenhuma atividade declarada em B05 (Fase B).</Empty>)
            : (p.people.length ? <OrgCanvas people={p.people} ariaLabel="Prévia do organograma" height={380} /> : <Empty>Nenhuma pessoa declarada em B02 (Fase A).</Empty>)}
        </Card>
        <Card className="p-4"><Eyebrow className="mb-2">Estado da informação</Eyebrow><EvidenceCounts items={qs} /></Card>
      </div>
    </div>
  );
}

interface EdProps { control: Ctl; register: UseFormRegister<FormValues>; errors: FieldErrors<FormValues> }

function Questions({ block, control, register, errors, trigger }: EdProps & { block: string; trigger: (n: `discovery.${string}`) => Promise<boolean> }) {
  const { fields, append, remove } = useFieldArray({ control, name: `discovery.${block}` as const });
  const values = useWatch({ control, name: `discovery.${block}` as const });
  return (
    <div className="space-y-3">
      {fields.map((f, i) => {
        const v = values?.[i] ?? f;
        const err = errors.discovery?.[block]?.[i];
        const eff = v.answer?.trim() ? v.status : 'unknown';
        const id = `${block}-${i}`;
        return (
          <div key={f.id} className="rounded-xl border border-soft p-3" data-testid={`q-${id}`}>
            {f.custom
              ? <><Label htmlFor={`${id}-t`}>Pergunta personalizada</Label><Input id={`${id}-t`} className="mb-2 h-9" aria-invalid={!!err?.text} {...register(`discovery.${block}.${i}.text`)} /><FieldError msg={err?.text?.message} /></>
              : <Label htmlFor={`${id}-a`} className="text-[13px]">{f.text}</Label>}
            <Textarea id={`${id}-a`} rows={2} placeholder="Resposta (deixe em branco se não informado)" {...register(`discovery.${block}.${i}.answer`, { onChange: () => void trigger(`discovery.${block}`) })} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Select aria-label={`Estado de evidência: ${f.text}`} className="h-8 w-auto text-xs" aria-invalid={!!err?.status} {...register(`discovery.${block}.${i}.status`, { onChange: () => void trigger(`discovery.${block}`) })}>
                {EVIDENCE.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </Select>
              <StatusBadge status={eff} />
              {f.custom && <Button size="sm" variant="ghost" onClick={() => remove(i)} aria-label="Remover pergunta"><Trash2 size={14} /></Button>}
            </div>
            <FieldError msg={err?.status?.message} />
          </div>
        );
      })}
      <Button size="sm" variant="ghost" onClick={() => append({ id: uid('q'), text: 'Nova pergunta', answer: '', status: 'unknown', custom: true })}><Plus size={14} /> Adicionar pergunta</Button>
    </div>
  );
}

function PeopleEditor({ control, register, errors }: EdProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'people' });
  const people = useWatch({ control, name: 'people' }) ?? [];
  return (
    <div className="mt-3 border-t border-soft pt-3">
      <div className="mb-2 flex items-center justify-between"><Eyebrow>Organograma · nós</Eyebrow><Button size="sm" onClick={() => append({ id: uid('pe'), name: '', role: '', kind: 'pessoa', reportsTo: 'unknown' })}><Plus size={14} /> Pessoa / equipe</Button></div>
      {!fields.length && <Muted className="text-xs">Nenhuma pessoa declarada.</Muted>}
      <ul className="m-0 list-none space-y-2 p-0">
        {fields.map((f, i) => (
          <li key={f.id} className="grid gap-2 rounded-xl border border-soft p-2.5 sm:grid-cols-2" data-testid={`person-${i}`}>
            <div><Input aria-label={`Nome do nó ${i + 1}`} placeholder="Nome ou função" className="h-9" aria-invalid={!!errors.people?.[i]?.name} {...register(`people.${i}.name`)} /><FieldError msg={errors.people?.[i]?.name?.message} /></div>
            <Input aria-label={`Função do nó ${i + 1}`} placeholder="O que faz" className="h-9" {...register(`people.${i}.role`)} />
            <Select aria-label={`Tipo do nó ${i + 1}`} className="h-9" {...register(`people.${i}.kind`)}><option value="pessoa">pessoa</option><option value="equipe">equipe</option><option value="area">área</option></Select>
            <div className="flex gap-2">
              <Select aria-label={`Reporta a (nó ${i + 1})`} className="h-9" {...register(`people.${i}.reportsTo`)}>
                <option value="unknown">reporte a confirmar</option><option value="top">topo da estrutura</option>
                {people.filter(x => x.id !== people[i]?.id).map(x => <option key={x.id} value={x.id}>{x.name || '(sem nome)'}</option>)}
              </Select>
              <Button size="icon" variant="ghost" aria-label={`Remover nó ${i + 1}`} onClick={() => remove(i)}><Trash2 size={15} /></Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivitiesEditor({ control, register, errors, people }: EdProps & { people: FormValues['people'] }) {
  const { fields, append, remove, move } = useFieldArray({ control, name: 'activities' });
  return (
    <div className="mt-3 border-t border-soft pt-3">
      <div className="mb-2 flex items-center justify-between"><Eyebrow>Fluxo · atividades em ordem</Eyebrow><Button size="sm" onClick={() => append({ id: uid('ac'), label: 'Nova atividade', type: 'task', ownerId: '' })}><Plus size={14} /> Atividade</Button></div>
      {!fields.length && <Muted className="text-xs">Nenhuma atividade declarada.</Muted>}
      <ol className="m-0 list-none space-y-2 p-0">
        {fields.map((f, i) => (
          <li key={f.id} className="grid gap-2 rounded-xl border border-soft p-2.5 sm:grid-cols-[1fr_120px]" data-testid={`activity-${i}`}>
            <div><Input aria-label={`Atividade ${i + 1}`} className="h-9" aria-invalid={!!errors.activities?.[i]?.label} {...register(`activities.${i}.label`)} /><FieldError msg={errors.activities?.[i]?.label?.message} /></div>
            <Select aria-label={`Tipo da atividade ${i + 1}`} className="h-9" {...register(`activities.${i}.type`)}><option value="task">tarefa</option><option value="gateway">decisão</option></Select>
            <Select aria-label={`Responsável da atividade ${i + 1}`} className="h-9" {...register(`activities.${i}.ownerId`)}>
              <option value="">responsável a confirmar</option>{(people ?? []).map(x => <option key={x.id} value={x.id}>{x.name || '(sem nome)'}</option>)}
            </Select>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" aria-label={`Subir atividade ${i + 1}`} disabled={i === 0} onClick={() => move(i, i - 1)}><ArrowUp size={15} /></Button>
              <Button size="icon" variant="ghost" aria-label={`Descer atividade ${i + 1}`} disabled={i === fields.length - 1} onClick={() => move(i, i + 1)}><ArrowDown size={15} /></Button>
              <Button size="icon" variant="ghost" aria-label={`Remover atividade ${i + 1}`} onClick={() => remove(i)}><Trash2 size={15} /></Button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
