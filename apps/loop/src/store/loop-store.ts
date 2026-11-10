import { create } from 'zustand';
import { clone, seedDemo, uid } from '@/domain/model';
import type { Project } from '@/domain/schema';
import { DexieProjectRepository } from '@/ports/DexieProjectRepository';
import { MemoryProjectRepository } from '@/ports/MemoryProjectRepository';
import type { ContactDraft, ProjectRepository } from '@/ports/ProjectRepository';

export type Role = 'cliente' | 'consultor';

interface LoopState {
  ready: boolean;
  repo: ProjectRepository | null;
  projects: Project[];
  contacts: ContactDraft[];
  savedAt: string;
  saveError: boolean;
  toast: string;
  portalRole: Role;
  init: (repo?: ProjectRepository) => Promise<void>;
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
const now = () => new Date().toLocaleTimeString('pt-BR');

export const useLoop = create<LoopState>((set, get) => {
  const persist = (p: Project) => {
    const repo = get().repo;
    if (!repo) return;
    repo.put(p).then(() => set({ savedAt: now(), saveError: false })).catch(() => set({ saveError: true }));
  };
  return {
    ready: false, repo: null, projects: [], contacts: [], savedAt: '', saveError: false, toast: '', portalRole: 'cliente',

    async init(injected) {
      let repo: ProjectRepository = injected ?? new MemoryProjectRepository();
      if (!injected && (await DexieProjectRepository.available())) repo = new DexieProjectRepository();
      let projects: Project[] = [];
      let contacts: ContactDraft[] = [];
      try { projects = await repo.list(); contacts = await repo.listContacts(); } catch { repo = new MemoryProjectRepository(); }
      if (!projects.length) { projects = [seedDemo()]; await repo.put(projects[0]).catch(() => undefined); }
      projects.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      set({ ready: true, repo, projects, contacts });
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

    resetDemo() { get().upsert(seedDemo(), 'Projeto de exemplo restaurado.'); },

    async resetAll() {
      const repo = get().repo, demo = seedDemo();
      await repo?.replaceAll([demo]).catch(() => undefined);
      for (const c of get().contacts) await repo?.removeContact(c.id).catch(() => undefined);
      set({ projects: [demo], contacts: [] });
      get().notify('Dados locais apagados. Projeto de exemplo recriado.');
    },

    addContact(c) {
      const d: ContactDraft = { ...c, id: uid('ct'), savedAt: new Date().toISOString(), status: 'rascunho local — não enviado' };
      set(s => ({ contacts: [d, ...s.contacts] }));
      get().repo?.putContact(d).catch(() => set({ saveError: true }));
    },

    removeContact(id) { set(s => ({ contacts: s.contacts.filter(c => c.id !== id) })); get().repo?.removeContact(id).catch(() => undefined); },

    setPortalRole(r) { set({ portalRole: r }); }
  };
});

export const useProject = (id: string | undefined) => useLoop(s => s.projects.find(p => p.id === id));
