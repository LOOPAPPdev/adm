import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from '@/lib/router';
import { apiFetch, ApiError } from '@/ports/HttpProjectRepository';
import { useLoop } from '@/store/loop-store';
import { Button } from '@/components/ui/button';

const field = 'rounded-ds-md border border-ds-line bg-ds-surface px-3 py-2';

/** One-time setup of the first administrator. Open only while no user exists and the server holds BOOTSTRAP_TOKEN. */
export function Configurar() {
  const nav = useNavigate();
  const reload = useLoop(s => s.reload);
  const [open, setOpen] = useState<boolean | null>(null);
  const [f, setF] = useState({ name: '', email: '', password: '', token: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiFetch<{ open: boolean }>('/api/v1/auth/bootstrap').then(r => setOpen(r.open)).catch(() => setOpen(false));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await apiFetch('/api/v1/auth/bootstrap', { method: 'POST', body: JSON.stringify(f) });
      await reload();
      nav('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível criar a conta. Verifique a conexão.');
    } finally {
      setBusy(false);
    }
  };

  if (open === null) return <p role="status" className="py-16 text-center text-ds-muted">Verificando…</p>;
  if (!open) {
    return (
      <section className="mx-auto max-w-md py-10">
        <h1 className="text-ds-title font-semibold">Configuração já concluída</h1>
        <p className="mt-2 text-ds-muted">Já existe um administrador (ou o token de configuração não está ativo). Use a página de entrada.</p>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-md py-10">
      <p className="eyebrow">Configuração inicial</p>
      <h1 className="mt-1 text-ds-title font-semibold">Criar o primeiro administrador</h1>
      <p className="mt-2 text-ds-caption text-ds-muted">Funciona uma única vez. Use o token de configuração que a equipe técnica colocou no servidor.</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
        <label className="flex flex-col gap-1 text-ds-caption" htmlFor="cfg-name">Nome
          <input id="cfg-name" className={field} autoComplete="name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
        </label>
        <label className="flex flex-col gap-1 text-ds-caption" htmlFor="cfg-email">E-mail
          <input id="cfg-email" type="email" className={field} autoComplete="username" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required />
        </label>
        <label className="flex flex-col gap-1 text-ds-caption" htmlFor="cfg-password">Senha (12 ou mais caracteres)
          <input id="cfg-password" type="password" className={field} autoComplete="new-password" minLength={12} value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required />
        </label>
        <label className="flex flex-col gap-1 text-ds-caption" htmlFor="cfg-token">Token de configuração
          <input id="cfg-token" type="password" className={field} autoComplete="off" value={f.token} onChange={e => setF({ ...f, token: e.target.value })} required />
        </label>
        {error && <p role="alert" className="text-ds-danger">{error}</p>}
        <Button type="submit" variant="primary" disabled={busy || !f.name || !f.email || f.password.length < 12 || !f.token}>{busy ? 'Criando…' : 'Criar administrador'}</Button>
      </form>
    </section>
  );
}
