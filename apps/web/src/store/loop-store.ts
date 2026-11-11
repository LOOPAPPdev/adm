import { create } from 'zustand';
import { clone, seedDemo, uid } from '@/domain/model';
import type { Project } from '@/domain/schema';
import { DexieProjectRepository } from '@/ports/DexieProjectRepository';
import { MemoryProjectRepository } from '@/ports/MemoryProjectRepository';
import type { ContactDraft, ProjectRepository } from '@/ports/ProjectRepository';
import { apiFetch, ApiError, HttpProjectRepository } from '@/ports/HttpProjectRepository';

export type Role = 'cliente' | 'consultor';
export type ServerRole = 'owner' | 'consultant' | 'client_admin' | 'client_member' | 'viewer';
export interface SessionInfo {
  user: { id: string; email: string; name: string; platformAdmin: boolean };
  organizations: { id: string; slug: string; name: string; kind: 'consultancy' | 'client'; role: ServerRole }[];
}
/** 'connected' = logged in, data on the server; 'demo' = no session, data only in this browser. */
export type Mode = 'connected' | 'demo';

interface LoopState {
  ready: boolean;
  repo: ProjectRepository | null;
  projects: Project[];
  contacts: ContactDraft[];
  savedAt: string;
  saveError: boolean;
  toast: string;
  portalRole: Role;
  mode: Mode;
  session: SessionInfo | null;
  activeOrgId: string | null;
  saveErrorMsg: string;
  init: (repo?: ProjectRepository) => Promise<void>;
  reload: () => Promise<void>;
  setActiveOrg: (id: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Replaces a project with the server's copy without saving it again. */
  applyServer: (p: Project) => void;
  /** Re-reads the session (e.g. after joining an organization) without reloading screens. */
  refreshSession: () => Promise<void>;
  notify: (msg: string) => void;
  update: (id: string, fn: (p: Project) => void, msg?: string) => void;
  add: (p: Project, msg?: string) => void;
  upsert: (p: Project, msg?: string) => void;
  duplicate: (id: string) => void;
  resetDemo: () => void;
  resetAll: () => Promise<void>;
  addContact: (c: Omit<ContactDraft, 'id' | 'savedAt' | 'status'>) => void;
  removeContact: (id: string) => void;
  setPortalRole: (r: Role) => void;
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
let initializing: Promise<void> | null = null;
const now = () => new Date().toLocaleTimeString('pt-BR');

export const useLoop = create<LoopState>((set, get) => {
  const persist = (p: Project) => {
    const repo = get().repo;
    if (!repo) return;
    repo.put(p).then(() => set({ savedAt: now(), saveError: false, saveErrorMsg: '' })).catch((e: unknown) => {
      const msg = e instanceof ApiError ? e.message : 'Falha ao salvar.';
      set({ saveError: true, saveErrorMsg: msg });
      get().notify(msg);
    });
  };
  return {
    ready: false, repo: null, projects: [], contacts: [], savedAt: '', saveError: false, toast: '', portalRole: 'cliente', mode: 'demo', session: null, activeOrgId: null, saveErrorMsg: '',

    init(injected) {
      if (!injected && (get().ready || initializing)) return initializing ?? Promise.resolve();
      const run = async () => {
      // Connected mode: a valid session means the server is the source of truth (no demo seeding there).
      if (!injected) {
        const session = await apiFetch<SessionInfo>('/api/v1/auth/me').catch(() => null);
        if (session) {
          const preferred = session.organizations.find(o => o.kind === 'client') ?? session.organizations[0] ?? null;
          const activeOrgId = get().activeOrgId && session.organizations.some(o => o.id === get().activeOrgId) ? get().activeOrgId : preferred?.id ?? null;
          const repo = new HttpProjectRepository(activeOrgId);
          const role = session.organizations.find(o => o.id === activeOrgId)?.role;
          const projects = await repo.list().catch(() => [] as Project[]);
          set({ ready: true, repo, projects, contacts: [], mode: 'connected', session, activeOrgId, portalRole: role && role.startsWith('client') ? 'cliente' : get().portalRole });
          return;
        }
      }
      let repo: ProjectRepository = injected ?? new MemoryProjectRepository();
      if (!injected && (await DexieProjectRepository.available())) repo = new DexieProjectRepository();
      let projects: Project[] = [];
      let contacts: ContactDraft[] = [];
      try { projects = await repo.list(); contacts = await repo.listContacts(); } catch { repo = new MemoryProjectRepository(); }
      if (!projects.length) { projects = [seedDemo()]; await repo.put(projects[0]).catch(() => undefined); }
      projects.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      set({ ready: true, repo, projects, contacts, mode: 'demo', session: null, activeOrgId: null });
      };
      initializing = run().finally(() => { initializing = null; });
      return initializing;
    },

    async reload() {
      set({ ready: false });
      initializing = null;
      await get().init();
    },

    async setActiveOrg(id) {
      set({ activeOrgId: id });
      await get().reload();
    },

    async refreshSession() {
      const session = await apiFetch<SessionInfo>('/api/v1/auth/me').catch(() => null);
      if (session) set({ session });
    },

    applyServer(p) { set(s => ({ projects: s.projects.map(x => (x.id === p.id ? p : x)) })); },

    async logout() {
      await apiFetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => undefined);
      set({ session: null, activeOrgId: null, mode: 'demo' });
      await get().reload();
    },

    notify(msg) {
      set({ toast: msg });
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => set({ toast: '' }), 3200);
    },

    update(id, fn, msg) {
      let changed: Project | undefined;
      set(s => ({
        projects: s.projects.map(p => {
          if (p.id !== id) return p;
          const c = clone(p); fn(c); c.updatedAt = new Date().toISOString(); changed = c; return c;
        })
      }));
      if (changed) persist(changed);
      if (msg) get().notify(msg);
    },

    add(p, msg) { set(s => ({ projects: [p, ...s.projects] })); persist(p); if (msg) get().notify(msg); },

    upsert(p, msg) {
      const exists = get().projects.some(x => x.id === p.id);
      set(s => ({ projects: exists ? s.projects.map(x => (x.id === p.id ? p : x)) : [p, ...s.projects] }));
      persist(p);
      if (msg) get().notify(msg);
    },

    duplicate(id) {
      const src = get().projects.find(p => p.id === id);
      if (!src) return;
      const c = clone(src), t = new Date().toISOString();
      Object.assign(c, { id: uid('prj'), name: src.name + ' (cópia)', archived: false, createdAt: t, updatedAt: t });
      get().add(c, 'Projeto duplicado.');
    },

    resetDemo() {
      if (get().mode === 'connected') { get().notify('Dados de exemplo ficam no modo demonstração (sem login).'); return; }
      get().upsert(seedDemo(), 'Projeto de exemplo restaurado.');
    },

    async resetAll() {
      if (get().mode === 'connected') { get().notify('No modo conectado não existe "apagar tudo". Arquive ou exclua projetos um a um.'); return; }
      const repo = get().repo, demo = seedDemo();
      await repo?.replaceAll([demo]).catch(() => undefined);
      for (const c of get().contacts) await repo?.removeContact(c.id).catch(() => undefined);
      set({ projects: [demo], contacts: [] });
      get().notify('Dados locais apagados. Projeto de exemplo recriado.');
    },

    addContact(c) {
      const connected = get().mode === 'connected';
      const d: ContactDraft = { ...c, id: uid('ct'), savedAt: new Date().toISOString(), status: connected ? 'enviada ao servidor' : 'rascunho local — não enviado' };
      if (connected) {
        get().repo?.putContact(d).then(() => get().notify('Mensagem enviada.')).catch((e: unknown) => get().notify(e instanceof ApiError ? e.message : 'Falha ao enviar.'));
        return;
      }
      set(s => ({ contacts: [d, ...s.contacts] }));
      get().repo?.putContact(d).catch(() => set({ saveError: true }));
    },

    removeContact(id) { set(s => ({ contacts: s.contacts.filter(c => c.id !== id) })); get().repo?.removeContact(id).catch(() => undefined); },

    setPortalRole(r) { set({ portalRole: r }); }
  };
});

export const useProject = (id: string | undefined) => useLoop(s => s.projects.find(p => p.id === id));
