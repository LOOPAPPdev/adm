import { useState, type FormEvent } from 'react';
import { useNavigate } from '@/lib/router';
import { apiFetch, ApiError } from '@/ports/HttpProjectRepository';
import { useLoop } from '@/store/loop-store';
import { Button } from '@/components/ui/button';

/** Login. Accounts are created by an administrator (there is no self sign-up and no email delivery yet). */
export function Entrar() {
  const nav = useNavigate();
  const { reload, mode, session } = useLoop();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await apiFetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      await reload();
      nav('/app/projetos', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível entrar. Verifique a conexão.');
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'connected' && session) {
    return <section className="mx-auto max-w-md py-10"><h1 className="text-ds-title font-semibold">Você já entrou</h1><p className="mt-2 text-ds-muted">Conectado como {session.user.email}.</p></section>;
  }

  return (
    <section className="mx-auto max-w-md py-10">
      <p className="eyebrow">Acesso</p>
      <h1 className="mt-1 text-ds-title font-semibold">Entrar no LOOP</h1>
      <p className="mt-2 text-ds-caption text-ds-muted">Use a conta criada pela equipe LOOP. Sem conta, o site funciona em modo demonstração, com dados só neste navegador.</p>
      <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
        <label className="flex flex-col gap-1 text-ds-caption" htmlFor="login-email">E-mail
          <input id="login-email" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} className="rounded-ds-md border border-ds-line bg-ds-surface px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-ds-caption" htmlFor="login-password">Senha
          <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="rounded-ds-md border border-ds-line bg-ds-surface px-3 py-2" />
        </label>
        {error && <p role="alert" className="text-ds-caption text-ds-danger">{error}</p>}
        <Button type="submit" variant="primary" disabled={busy || !email || !password}>{busy ? 'Entrando…' : 'Entrar'}</Button>
      </form>
    </section>
  );
}
