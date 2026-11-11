import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Download, Trash2 } from 'lucide-react';
import { useLoop } from '@/store/loop-store';
import { Button } from '@/components/ui/button';
import { Card, Eyebrow, Muted } from '@/components/ui/card';
import { FieldError, Input, Label, Textarea } from '@/components/ui/field';
import { Empty, Notice, PageHeader } from '@/components/ui/page';
import { downloadText } from '@/lib/download';
import { useState } from 'react';

const ContactSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome.'),
  email: z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Informe um e-mail válido.'),
  empresa: z.string().trim().default(''),
  msg: z.string().trim().min(10, 'Escreva pelo menos 10 caracteres.')
});
type Contact = z.input<typeof ContactSchema>;

export function Contato() {
  const { contacts, addContact, removeContact, notify } = useLoop();
  const [ok, setOk] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Contact>({ resolver: zodResolver(ContactSchema), defaultValues: { nome: '', email: '', empresa: '', msg: '' } });
  const submit = handleSubmit(v => { addContact({ nome: v.nome, email: v.email, empresa: v.empresa ?? '', msg: v.msg }); reset(); setOk(true); });
  return (
    <>
      <PageHeader eyebrow="Contato" title="Fale com a consultoria" lead="Nesta versão o formulário não envia mensagens. A mensagem fica salva como rascunho neste navegador e pode ser exportada." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <form noValidate onSubmit={submit} className="grid gap-3.5" aria-label="Formulário de contato">
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div><Label htmlFor="nome">Nome</Label><Input id="nome" autoComplete="name" aria-invalid={!!errors.nome} aria-describedby="e-nome" {...register('nome', { onChange: () => setOk(false) })} /><FieldError id="e-nome" msg={errors.nome?.message} /></div>
              <div><Label htmlFor="email">E-mail</Label><Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby="e-email" {...register('email')} /><FieldError id="e-email" msg={errors.email?.message} /></div>
            </div>
            <div><Label htmlFor="empresa">Empresa (opcional)</Label><Input id="empresa" autoComplete="organization" {...register('empresa')} /></div>
            <div><Label htmlFor="msg">Mensagem</Label><Textarea id="msg" rows={5} aria-invalid={!!errors.msg} aria-describedby="e-msg" {...register('msg')} /><FieldError id="e-msg" msg={errors.msg?.message} /></div>
            <div className="flex flex-wrap items-center gap-3"><Button type="submit" variant="primary">Salvar rascunho local</Button><Muted className="text-xs">Nenhuma mensagem é enviada.</Muted></div>
            {ok && <Notice tone="green">Rascunho salvo localmente. Não foi enviado.</Notice>}
          </form>
        </Card>
        <Card>
          <div className="mb-3 flex items-center justify-between gap-2"><Eyebrow>Rascunhos locais ({contacts.length})</Eyebrow>
            {contacts.length > 0 && <Button size="sm" onClick={() => { downloadText('loop-rascunhos-contato.json', JSON.stringify({ notice: 'Rascunhos locais. Nenhum foi enviado.', drafts: contacts }, null, 2)); notify('Arquivo loop-rascunhos-contato.json gerado.'); }}><Download size={14} /> Exportar</Button>}</div>
          {contacts.length === 0 ? <Empty>Nenhum rascunho salvo.</Empty> : (
            <ul className="m-0 list-none space-y-2 p-0">
              {contacts.map(c => (
                <li key={c.id} className="rounded-ds-lg border border-ds-line p-3">
                  <div className="flex items-start justify-between gap-2"><div className="min-w-0"><b className="text-[13px]">{c.nome}</b> <span className="text-xs text-ds-muted">{c.email}</span></div>
                    <Button size="icon" variant="ghost" aria-label={`Excluir rascunho de ${c.nome}`} onClick={() => removeContact(c.id)}><Trash2 size={15} /></Button></div>
                  <Muted className="mt-1 line-clamp-3 text-xs">{c.msg}</Muted>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
