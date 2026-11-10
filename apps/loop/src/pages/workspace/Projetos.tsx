import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Archive, Copy, Download, Pencil, RotateCcw, Upload } from 'lucide-react';
import { newProject, parseImport, seedCleanSea, seedDemo, uid } from '@/domain/model';
import { useLoop } from '@/store/loop-store';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, Muted } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FieldError, Input, Label, Select } from '@/components/ui/field';
import { Empty, Notice, PageHeader } from '@/components/ui/page';
import { exportProject } from './Overview';

const NewSchema = z.object({ name: z.string().trim().min(2, 'Informe um nome com pelo menos 2 caracteres.').max(80), tpl: z.enum(['empty', 'demo', 'cleansea']) });
type NewForm = z.infer<typeof NewSchema>;

export function Projetos() {
  const { projects, add, update, upsert, duplicate, resetDemo, notify } = useLoop();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [arch, setArch] = useState(false);
  const [importErr, setImportErr] = useState<string[]>([]);
  const [renaming, setRenaming] = useState<{ id: string; v: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewForm>({ resolver: zodResolver(NewSchema), defaultValues: { name: '', tpl: 'empty' } });

  const create = handleSubmit(({ name, tpl }) => {
    const np = tpl === 'demo' ? Object.assign(seedDemo(), { id: uid('prj'), name }) : tpl === 'cleansea' ? Object.assign(seedCleanSea(), { name }) : newProject(name);
    add(np, 'Projeto criado e salvo localmente.');
    reset();
    nav(`/app/projetos/${np.id}/descoberta`);
  });

  const onImport = async (file?: File) => {
    if (!file) return;
    const res = parseImport(await file.text());
    if (fileRef.current) fileRef.current.value = '';
    if (!res.ok) { setImportErr(res.errors.slice(0, 8)); return; }
    const exists = projects.some(x => x.id === res.project.id);
    upsert(res.project, exists ? 'Projeto atualizado a partir do JSON.' : 'Projeto importado.');
    setImportErr([]);
  };

  const list = projects.filter(p => p.archived === arch && (!q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase())));
  return (
    <>
      <PageHeader eyebrow="Workspace · projetos" title="Projetos" lead="Cada projeto parte de um template e é salvo neste navegador (IndexedDB). Exporte em JSON para guardar ou transferir." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Input aria-label="Buscar projetos" placeholder="Buscar por nome…" value={q} onChange={e => setQ(e.target.value)} className="h-9 max-w-xs" />
            <Button size="sm" onClick={() => setArch(!arch)}>{arch ? 'Ver ativos' : 'Ver arquivados'}</Button>
            <Button size="sm" variant="ghost" onClick={resetDemo}><RotateCcw size={14} /> Restaurar exemplo</Button>
          </div>
          {!list.length ? <Empty>{arch ? 'Nenhum projeto arquivado.' : 'Nenhum projeto encontrado.'}</Empty> : (
            <ul className="m-0 list-none divide-y divide-soft p-0" aria-label="Lista de projetos">
              {list.map(p => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    {renaming?.id === p.id ? (
                      <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (renaming.v.trim()) update(p.id, c => { c.name = renaming.v.trim(); }, 'Projeto renomeado.'); setRenaming(null); }}>
                        <Input autoFocus aria-label="Novo nome" value={renaming.v} onChange={e => setRenaming({ id: p.id, v: e.target.value })} className="h-9" /><Button size="sm" type="submit" variant="primary">Salvar</Button>
                      </form>
                    ) : <Link to={`/app/projetos/${p.id}`} className="text-[14px] font-bold">{p.name}</Link>}
                    <Muted className="mt-0.5 text-xs">{p.isDemo && <Badge tone="purple" className="mr-1.5">Exemplo</Badge>}{p.activities.length} atividades · {p.people.length} nós · v{p.version} · atualizado {new Date(p.updatedAt).toLocaleString('pt-BR')}</Muted>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button size="icon" variant="ghost" aria-label={`Renomear ${p.name}`} onClick={() => setRenaming(renaming?.id === p.id ? null : { id: p.id, v: p.name })}><Pencil size={15} /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Duplicar ${p.name}`} onClick={() => duplicate(p.id)}><Copy size={15} /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Exportar ${p.name}`} onClick={() => exportProject(p, notify)}><Download size={15} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => update(p.id, c => { c.archived = !c.archived; }, p.archived ? 'Projeto restaurado.' : 'Projeto arquivado localmente.')}><Archive size={14} /> {p.archived ? 'Restaurar' : 'Arquivar'}</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div className="space-y-4">
          <Card>
            <Eyebrow className="mb-3">Novo projeto</Eyebrow>
            <form noValidate onSubmit={create} className="grid gap-3" aria-label="Criar projeto">
              <div><Label htmlFor="np-name">Nome</Label><Input id="np-name" placeholder="Ex.: Operação portuária" aria-invalid={!!errors.name} {...register('name')} /><FieldError msg={errors.name?.message} /></div>
              <div><Label htmlFor="np-tpl">Template</Label>
                <Select id="np-tpl" {...register('tpl')}><option value="empty">Vazio (9 blocos, sem respostas)</option><option value="demo">Operação de exemplo (fictícia)</option><option value="cleansea">Clean Sea · descoberta (material do cliente)</option></Select></div>
              <Button type="submit" variant="primary">Criar e abrir a descoberta</Button>
            </form>
          </Card>
          <Card>
            <Eyebrow className="mb-2">Importar JSON</Eyebrow>
            <Muted className="mb-3 text-xs">Aceita arquivos exportados pelo LOOP (schema loop.project v1), inclusive do protótipo do Claude Design.</Muted>
            <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" id="import" data-testid="import-input" onChange={e => onImport(e.target.files?.[0])} />
            <Button onClick={() => fileRef.current?.click()}><Upload size={14} /> Escolher arquivo</Button>
            {importErr.length > 0 && <Notice tone="red" className="mt-3"><b>Importação recusada.</b><ul className="mb-0 mt-1 pl-4" data-testid="import-errors">{importErr.map(e => <li key={e}>{e}</li>)}</ul></Notice>}
          </Card>
        </div>
      </div>
    </>
  );
}
