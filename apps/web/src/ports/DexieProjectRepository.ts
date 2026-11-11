import Dexie, { type EntityTable } from 'dexie';
import type { Project } from '@/domain/schema';
import { validateProject } from '@/domain/model';
import type { ContactDraft, ProjectRepository } from './ProjectRepository';

class LoopDB extends Dexie {
  projects!: EntityTable<Project, 'id'>;
  contacts!: EntityTable<ContactDraft, 'id'>;
  constructor(name: string) {
    super(name);
    this.version(1).stores({ projects: 'id, updatedAt, archived', contacts: 'id, savedAt' });
  }
}

/** IndexedDB adapter. Invalid records are skipped on read, never repaired silently. */
export class DexieProjectRepository implements ProjectRepository {
  readonly kind = 'indexeddb' as const;
  private db: LoopDB;
  constructor(name = 'loop-v1') { this.db = new LoopDB(name); }
  async list() { return (await this.db.projects.toArray()).filter(p => validateProject(p).length === 0); }
  async put(p: Project) { await this.db.projects.put(p); }
  async remove(id: string) { await this.db.projects.delete(id); }
  async replaceAll(ps: Project[]) { await this.db.transaction('rw', this.db.projects, async () => { await this.db.projects.clear(); await this.db.projects.bulkPut(ps); }); }
  async listContacts() { return (await this.db.contacts.orderBy('savedAt').reverse().toArray()); }
  async putContact(c: ContactDraft) { await this.db.contacts.put(c); }
  async removeContact(id: string) { await this.db.contacts.delete(id); }
  /** Probe: private windows or blocked site data make IndexedDB throw. */
  static async available(): Promise<boolean> {
    try { if (typeof indexedDB === 'undefined') return false; const db = new LoopDB('loop-probe'); await db.open(); db.close(); return true; } catch { return false; }
  }
}
