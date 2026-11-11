/**
 * Future adapter. Contract only — no backend exists in v1.0.
 * Endpoints mirror docs/loop-app/BACKEND_ARQUITETURA.md; every call requires an authenticated session.
 */
import type { Project } from '@/domain/schema';
import type { ContactDraft, ProjectRepository } from './ProjectRepository';

export const API_CONTRACT = {
  listProjects: 'GET /api/v1/projects',
  getProject: 'GET /api/v1/projects/:id',
  putProject: 'PUT /api/v1/projects/:id (If-Match: version)',
  deleteProject: 'DELETE /api/v1/projects/:id',
  setGate: 'POST /api/v1/projects/:id/gates/:gateId (audited)',
  portalReview: 'POST /api/v1/portal/:id/review (client role)',
  contact: 'POST /api/v1/contact'
} as const;

const notReady = () => Promise.reject(new Error('HttpProjectRepository: backend não implementado na v1.0.'));

export class HttpProjectRepository implements ProjectRepository {
  readonly kind = 'http' as const;
  constructor(readonly baseUrl: string) {}
  list(): Promise<Project[]> { return notReady(); }
  put(_p: Project): Promise<void> { return notReady(); }
  remove(_id: string): Promise<void> { return notReady(); }
  replaceAll(_ps: Project[]): Promise<void> { return notReady(); }
  listContacts(): Promise<ContactDraft[]> { return notReady(); }
  putContact(_c: ContactDraft): Promise<void> { return notReady(); }
  removeContact(_id: string): Promise<void> { return notReady(); }
}
