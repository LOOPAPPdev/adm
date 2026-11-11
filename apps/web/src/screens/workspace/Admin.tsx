import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { apiFetch, ApiError } from '@/ports/HttpProjectRepository';
import { useLoop } from '@/store/loop-store';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/router';

interface Org { id: string; slug: string; name: string; kind: string; role: string | null }
interface Member { id: string; email: string; name: string; role: string }

const ROLES: [string, string][] = [['client_admin', 'Cliente (admin)'], ['client_member', 'Cliente'], ['viewer', 'Leitura'], ['consultant', 'Consultor'], ['owner', 'Responsável']];
const field = 'rounded-ds-md border border-ds-line bg-ds-surface px-3 py-2';

/** Organizations (clients) and their members. The server decides who may grant which role. */
export function Admin() {
  const { mode, session, refreshSession, notify } = useLoop();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [sel, setSel] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState('');
  const [orgName, setOrgName] = useState('');
  const [m, setM] = useState({ email: '', name: '', role: 'client_member', password: '' });

  const loadOrgs = useCallback(async () => {
    try {
      const list = (await apiFetch<{ organizations: Org[] }>('/api/v1/orgs')).organizations;
      setOrgs(list);
      setSel(s => s || list.find(o => o.kind === 'client')?.id || list[0]?.id || '');
    } catch (e) { setError(e instanceof ApiError ? e.message : 'Falha ao carregar organizações.'); }
  }, []);
  const loadMembers = useCallback(async (id: string) => {
    if (!id) return;
    try { setMembers((await apiFetch<{ members: Member[] }>(`/api/v1/orgs/${id}/members`)).members); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Falha ao carregar membros.'); }
  }, []);

  useEffect(() => { if (mode === 'connected') void loadOrgs(); }, [mode, loadOrgs]);
  useEffect(() => { void loadMembers(sel); }, [sel, loadMembers]);

  if (mode !== 'connected' || !session) return <p className="text-ds-muted">A administração exige login. <Link to="/entrar">Entrar</Link></p>;

  const createOrg = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    try {
      const { organization } = await apiFetch<{ organization: Org }>('/api/v1/orgs', { method: 'POST', body: JSON.stringify({ name: orgName }) });
      setOrgName(''); notify(`Organização ${organization.name} criada.`);
      await loadOrgs(); setSel(organization.id); await refreshSession();
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Falha ao criar.'); }
  };
  const addMember = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    try {
      const body = { email: m.email, name: m.name, role: m.role, ...(m.password ? { password: m.password } : {}) };
      await apiFetch(`/api/v1/orgs/${sel}/members`, { method: 'POST', body: JSON.stringify(body) });
      notify(`${m.name} adicionado.`);
      setM({ email: '', name: '', role: m.role, password: '' });
      await loadMembers(sel);
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Falha ao adicionar.'); }
  };

  return (
    <section className="flex flex-col gap-8">
      <header>
        <p className="eyebrow">Administração</p>
        <h1 className="mt-1 text-ds-title font-semibold">Organizações e membros</h1>
        <p className="mt-1 text-ds-caption text-ds-muted">Cada cliente é uma organização; seus projetos só são visíveis para os membros dela. Não há envio de e-mail: para uma conta nova, defina a senha inicial e entregue-a por um canal seguro.</p>
      </header>
      {error && <p role="alert" className="text-ds-danger">{error}</p>}

      {session.user.platformAdmin && (
        <form onSubmit={createOrg} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-ds-caption" htmlFor="org-name">Nova organização (cliente)
            <input id="org-name" className={field} value={orgName} onChange={e => setOrgName(e.target.value)} minLength={2} required />
          </label>
          <Button type="submit" variant="primary" disabled={orgName.trim().length < 2}>Criar organização</Button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        <label className="flex max-w-sm flex-col gap-1 text-ds-caption" htmlFor="admin-org">Organização
          <select id="admin-org" className={field} value={sel} onChange={e => setSel(e.target.value)}>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}{o.kind === 'consultancy' ? ' (consultoria)' : ''}</option>)}
          </select>
        </label>
        <div className="overflow-x-auto rounded-ds-lg border border-ds-line">
          <table className="w-full text-left text-ds-caption">
            <thead><tr className="text-ds-muted"><th className="p-2.5">Nome</th><th className="p-2.5">E-mail</th><th className="p-2.5">Papel</th></tr></thead>
            <tbody>
              {members.length === 0 ? <tr><td className="p-2.5 text-ds-muted" colSpan={3}>Sem membros.</td></tr> : members.map(x => (
                <tr key={x.id} className="border-t border-ds-line"><td className="p-2.5">{x.name}</td><td className="p-2.5">{x.email}</td><td className="p-2.5">{ROLES.find(r => r[0] === x.role)?.[1] ?? x.role}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sel && (
        <form onSubmit={addMember} className="grid gap-3 sm:grid-cols-2">
          <h2 className="text-ds-card font-semibold sm:col-span-2">Adicionar ou mudar papel</h2>
          <label className="flex flex-col gap-1 text-ds-caption" htmlFor="m-name">Nome<input id="m-name" className={field} value={m.name} onChange={e => setM({ ...m, name: e.target.value })} required /></label>
          <label className="flex flex-col gap-1 text-ds-caption" htmlFor="m-email">E-mail<input id="m-email" type="email" className={field} value={m.email} onChange={e => setM({ ...m, email: e.target.value })} required /></label>
          <label className="flex flex-col gap-1 text-ds-caption" htmlFor="m-role">Papel
            <select id="m-role" className={field} value={m.role} onChange={e => setM({ ...m, role: e.target.value })}>{ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </label>
          <label className="flex flex-col gap-1 text-ds-caption" htmlFor="m-pass">Senha inicial (só para conta nova, 12+ caracteres)
            <input id="m-pass" type="password" autoComplete="new-password" className={field} value={m.password} onChange={e => setM({ ...m, password: e.target.value })} />
          </label>
          <div className="sm:col-span-2"><Button type="submit" variant="primary" disabled={!m.name || !m.email}>Salvar membro</Button></div>
        </form>
      )}
    </section>
  );
}
