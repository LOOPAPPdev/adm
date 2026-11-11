import { useCallback, useEffect, useState } from 'react';
import { apiFetch, ApiError, HttpProjectRepository } from '@/ports/HttpProjectRepository';
import type { Project } from '@/domain/schema';
import { useLoop } from '@/store/loop-store';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/router';
import { useCurrentProject } from './ProjectLayout';

interface Revision { version: number; user_name: string | null; summary: string; created_at: string }

/** Version history kept by the server. Restoring saves the old content as a new version; nothing is erased. */
export function Historico() {
  const p = useCurrentProject();
  const { mode, repo, applyServer, notify } = useLoop();
  const [rows, setRows] = useState<Revision[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError('');
    try { setRows((await apiFetch<{ revisions: Revision[] }>(`/api/v1/projects/${encodeURIComponent(p.id)}/history`)).revisions); }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Não foi possível carregar o histórico.'); }
  }, [p.id]);

  useEffect(() => { if (mode === 'connected') void load(); }, [mode, load]);

  if (mode !== 'connected') return <p className="text-ds-muted">O histórico de versões existe só no modo conectado. <Link to="/entrar">Entre</Link> para ver.</p>;

  const current = repo instanceof HttpProjectRepository ? repo.versionOf(p.id) : undefined;
  const restore = async (version: number) => {
    if (!(repo instanceof HttpProjectRepository) || current === undefined) return;
    setBusy(version);
    try {
      const d = await apiFetch<{ project: Project; version: number }>(`/api/v1/projects/${encodeURIComponent(p.id)}/revisions/${version}/restore`, { method: 'POST', headers: { 'if-match': `"${current}"` } });
      repo.setVersion(p.id, d.version);
      applyServer(d.project);
      notify(`Versão ${version} restaurada como versão ${d.version}.`);
      await load();
    } catch (e) {
      notify(e instanceof ApiError ? e.message : 'Falha ao restaurar.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section>
      <p className="eyebrow">Histórico</p>
      <h2 className="mt-1 text-ds-subtitle font-semibold">Versões salvas no servidor</h2>
      <p className="mt-1 text-ds-caption text-ds-muted">Cada gravação vira uma versão. Restaurar copia o conteúdo antigo para uma versão nova; nenhuma versão é apagada.</p>
      {error && <p role="alert" className="mt-4 text-ds-danger">{error}</p>}
      {!rows && !error && <p role="status" className="mt-4 text-ds-muted">Carregando…</p>}
      {rows && rows.length === 0 && <p className="mt-4 text-ds-muted">Nenhuma versão registrada.</p>}
      {rows && rows.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-ds-lg border border-ds-line">
          <table className="w-full text-left text-ds-caption">
            <thead><tr className="text-ds-muted"><th className="p-2.5">Versão</th><th className="p-2.5">Quando</th><th className="p-2.5">Quem</th><th className="p-2.5">O que mudou</th><th className="p-2.5"><span className="sr-only">Ação</span></th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.version} className="border-t border-ds-line">
                  <td className="p-2.5 font-mono tabular-nums">{r.version}{r.version === current && <span className="ml-2 text-ds-success">atual</span>}</td>
                  <td className="p-2.5 tabular-nums">{new Date(r.created_at).toLocaleString('pt-BR')}</td>
                  <td className="p-2.5">{r.user_name ?? '—'}</td>
                  <td className="p-2.5">{r.summary}</td>
                  <td className="p-2.5 text-right">{r.version !== current && <Button size="sm" onClick={() => void restore(r.version)} disabled={busy !== null}>{busy === r.version ? 'Restaurando…' : 'Restaurar'}</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
