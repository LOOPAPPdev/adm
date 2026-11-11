/**
 * Port: ProjectRepository. The UI depends only on this interface.
 * Adapters: DexieProjectRepository (IndexedDB, now), MemoryProjectRepository (tests / blocked storage),
 * HttpProjectRepository (future backend, see docs/loop-app/BACKEND_ARQUITETURA.md).
 */
import type { Project } from '@/domain/schema';

export interface ContactDraft { id: string; nome: string; email: string; empresa: string; msg: string; savedAt: string; status: string }

export interface ProjectRepository {
  readonly kind: 'indexeddb' | 'memory' | 'http';
  list(): Promise<Project[]>;
  put(p: Project): Promise<void>;
  remove(id: string): Promise<void>;
  replaceAll(ps: Project[]): Promise<void>;
  listContacts(): Promise<ContactDraft[]>;
  putContact(c: ContactDraft): Promise<void>;
  removeContact(id: string): Promise<void>;
}
