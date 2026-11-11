/**
 * Backend adapter: talks to /api/v1 with the session cookie. Used after login (see store init).
 * - Keeps the server version of each project and sends it in If-Match; the server answers 409 on conflicts.
 * - Saves per project are serialized and coalesced: rapid edits become one PUT with the latest document.
 * - New projects (unknown to the server) are created with POST in the active organization.
 */
import type { Project } from '@/domain/schema';
import type { ContactDraft, ProjectRepository } from './ProjectRepository';

export const API_CONTRACT = {
  me: 'GET /api/v1/auth/me',
  login: 'POST /api/v1/auth/login',
  logout: 'POST /api/v1/auth/logout',
  listProjects: 'GET /api/v1/projects[?organizationId=]',
  createProject: 'POST /api/v1/projects { organizationId, project }',
  getProject: 'GET /api/v1/projects/:id',
  putProject: 'PUT /api/v1/projects/:id (If-Match: "version")',
  deleteProject: 'DELETE /api/v1/projects/:id',
  history: 'GET /api/v1/projects/:id/history',
  contact: 'POST /api/v1/contact'
} as const;

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) { super(message); }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, { credentials: 'same-origin', ...init, headers: { 'content-type': 'application/json', ...(init.headers ?? {}) } });
  const data = (await res.json().catch(() => ({}))) as { error?: { code?: string; message?: string } };
  if (!res.ok) throw new ApiError(res.status, data?.error?.code ?? 'http_error', data?.error?.message ?? `Erro ${res.status}`);
  return data as T;
}

interface Dto { project: Project; organizationId: string; version: number }

export class HttpProjectRepository implements ProjectRepository {
  readonly kind = 'http' as const;
  private versions = new Map<string, number>();
  private queue = new Map<string, { running: Promise<void>; next?: Project; waiters: { resolve: () => void; reject: (e: unknown) => void }[] }>();

  constructor(private organizationId: string | null, private base = '/api/v1') {}

  setOrganization(id: string | null) { this.organizationId = id; }
  versionOf(id: string) { return this.versions.get(id); }
  /** After a server-side change made outside put() (e.g. restore), keep the version in sync. */
  setVersion(id: string, v: number) { this.versions.set(id, v); }

  async list(): Promise<Project[]> {
    const q = this.organizationId ? `?organizationId=${encodeURIComponent(this.organizationId)}` : '';
    const { projects } = await apiFetch<{ projects: Dto[] }>(`${this.base}/projects${q}`);
    for (const d of projects) this.versions.set(d.project.id, d.version);
    return projects.map(d => d.project);
  }

  put(p: Project): Promise<void> {
    const slot = this.queue.get(p.id);
    if (slot) {
      // A save is in flight: remember only the latest document and settle together.
      slot.next = p;
      return new Promise((resolve, reject) => slot.waiters.push({ resolve, reject }));
    }
    const entry = { running: Promise.resolve(), waiters: [] as { resolve: () => void; reject: (e: unknown) => void }[], next: undefined as Project | undefined };
    this.queue.set(p.id, entry);
    entry.running = (async () => {
      let doc: Project | undefined = p;
      try {
        while (doc) {
          await this.send(doc);
          doc = entry.next;
          entry.next = undefined;
        }
        entry.waiters.forEach(w => w.resolve());
      } catch (e) {
        entry.waiters.forEach(w => w.reject(e));
        throw e;
      } finally {
        this.queue.delete(p.id);
      }
    })();
    return entry.running;
  }

  private async send(p: Project) {
    const v = this.versions.get(p.id);
    if (v === undefined) {
      if (!this.organizationId) throw new ApiError(400, 'no_org', 'Escolha a organização do projeto antes de criar.');
      const d = await apiFetch<Dto>(`${this.base}/projects`, { method: 'POST', body: JSON.stringify({ organizationId: this.organizationId, project: p }) });
      this.versions.set(d.project.id, d.version);
      return;
    }
    const d = await apiFetch<Dto>(`${this.base}/projects/${encodeURIComponent(p.id)}`, { method: 'PUT', headers: { 'if-match': `"${v}"` }, body: JSON.stringify(p) });
    this.versions.set(p.id, d.version);
  }

  async remove(id: string): Promise<void> {
    await apiFetch(`${this.base}/projects/${encodeURIComponent(id)}`, { method: 'DELETE' });
    this.versions.delete(id);
  }

  replaceAll(): Promise<void> {
    return Promise.reject(new ApiError(400, 'not_supported', 'Apagar tudo não existe no modo conectado. Arquive ou exclua projetos um a um.'));
  }

  /** Messages sent through the site are stored on the server; this browser keeps no copy. */
  async listContacts(): Promise<ContactDraft[]> { return []; }
  async putContact(c: ContactDraft): Promise<void> {
    await apiFetch(`${this.base}/contact`, { method: 'POST', body: JSON.stringify({ nome: c.nome, email: c.email, empresa: c.empresa, msg: c.msg }) });
  }
  async removeContact(): Promise<void> { /* nothing stored locally */ }
}
