'use client';
import { Link } from '@/lib/router';
import { useLoop } from '@/store/loop-store';

const ROLE_LABEL: Record<string, string> = { owner: 'responsável', consultant: 'consultor', client_admin: 'cliente (admin)', client_member: 'cliente', viewer: 'leitura' };

/** States plainly where the data lives: on the server (logged in) or only in this browser (demo). */
export function SessionBar() {
  const { mode, session, activeOrgId, setActiveOrg, logout, saveError, saveErrorMsg, savedAt, repo } = useLoop();
  if (mode === 'connected' && session) {
    const org = session.organizations.find(o => o.id === activeOrgId);
    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-ds-micro text-ds-muted">
        <span className="flex flex-wrap items-center gap-2">
          <span className="eyebrow text-ds-success">Conectado</span>
          <span>{session.user.name}{org ? ` · ${ROLE_LABEL[org.role] ?? org.role}` : ''}</span>
          {session.organizations.length > 1 && (
            <label className="flex items-center gap-1">
              <span className="sr-only">Organização ativa</span>
              <select id="org-select" className="rounded-ds-sm border border-ds-line bg-ds-surface px-2 py-0.5 text-ds-micro" value={activeOrgId ?? ''} onChange={e => void setActiveOrg(e.target.value)}>
                {session.organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </label>
          )}
          {session.organizations.length === 1 && org && <span>· {org.name}</span>}
          {(session.user.platformAdmin || session.organizations.some(o => o.role === 'owner' || o.role === 'consultant' || o.role === 'client_admin')) && <Link to="/admin">Administração</Link>}
          <button type="button" className="underline" onClick={() => void logout()}>Sair</button>
        </span>
        <span aria-live="polite">{saveError ? `Não salvo: ${saveErrorMsg}` : savedAt ? `Salvo no servidor às ${savedAt}` : 'Alterações são salvas no servidor.'}</span>
      </div>
    );
  }
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-ds-micro text-ds-muted">
      <span><span className="eyebrow text-ds-accent">Modo demonstração</span> · dados só neste navegador · <Link to="/entrar">Entrar</Link> para salvar no servidor. Agentes de IA, GitHub e envio de e-mail não estão em execução.</span>
      <span aria-live="polite">{saveError ? 'Falha ao salvar no armazenamento local.' : savedAt ? `Salvo localmente às ${savedAt}${repo?.kind === 'memory' ? ' (memória da aba)' : ''}` : 'Alterações são salvas automaticamente neste navegador.'}</span>
    </div>
  );
}
