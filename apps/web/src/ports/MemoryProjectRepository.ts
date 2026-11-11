import type { Project } from '@/domain/schema';
import type { ContactDraft, ProjectRepository } from './ProjectRepository';

export class MemoryProjectRepository implements ProjectRepository {
  readonly kind = 'memory' as const;
  private projects = new Map<string, Project>();
  private contacts = new Map<string, ContactDraft>();
  async list() { return [...this.projects.values()].map(p => structuredClone(p)); }
  async put(p: Project) { this.projects.set(p.id, structuredClone(p)); }
  async remove(id: string) { this.projects.delete(id); }
  async replaceAll(ps: Project[]) { this.projects.clear(); ps.forEach(p => this.projects.set(p.id, structuredClone(p))); }
  async listContacts() { return [...this.contacts.values()]; }
  async putContact(c: ContactDraft) { this.contacts.set(c.id, c); }
  async removeContact(id: string) { this.contacts.delete(id); }
}
