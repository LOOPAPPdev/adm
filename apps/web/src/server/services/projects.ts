/**
 * Projects: the LOOP project document (validated by the shared Zod schema) stored per client organization.
 * Rules enforced here, never in the UI:
 *  - a user sees only projects of organizations they belong to (platform admin sees all);
 *  - saving requires the version the client last read (optimistic concurrency → 409 on conflict);
 *  - client roles may change only the portal review; viewers change nothing;
 *  - every saved version is kept in project_revisions with who saved it and what changed.
 */
import { z } from 'zod';
import type { Ctx } from '../infra/db';
import { newId } from '../infra/crypto';
import { AppError, forbidden, invalid, notFound } from '../domain/errors';
import { can, type Role } from '../domain/roles';
import { Project as ProjectSchema, describeIssues, type Project } from '@/domain/schema';
import { audit, memberships, orgs, projects, revisions, type ProjectRow } from '../data/repos';
import type { SessionUser } from './auth';

export interface ProjectDto { project: Project; organizationId: string; version: number; role: Role | null; updatedAt: string }

const iso = (c: Ctx) => c.now().toISOString();
/** Largest stored document (bytes of JSON). LOOP projects are a few kB; this stops abuse, not real use. */
export const MAX_DOC_BYTES = 1_000_000;
function sized(json: string): string {
  if (new TextEncoder().encode(json).length > MAX_DOC_BYTES) throw new AppError(413, 'too_large', 'Projeto grande demais para salvar (limite de 1 MB).');
  return json;
}

function parseDoc(input: unknown): Project {
  const r = ProjectSchema.safeParse(input);
  if (!r.success) throw invalid('Projeto inválido.', describeIssues(r.error));
  return r.data as Project;
}

function toDto(row: ProjectRow, role: Role | null): ProjectDto {
  const doc = JSON.parse(row.data_json) as Project;
  // Columns are authoritative for identity, version and timestamps.
  const project = { ...doc, id: row.id, name: row.name, version: row.version, archived: !!row.archived, updatedAt: row.updated_at, createdAt: row.created_at };
  return { project, organizationId: row.organization_id, version: row.version, role, updatedAt: row.updated_at };
}

/** Loads a project the user may read. Unknown and forbidden look the same (404) so ids do not leak. */
async function load(ctx: Ctx, u: SessionUser, id: string): Promise<{ row: ProjectRow; role: Role | null }> {
  const row = await projects.byId(ctx.db, id);
  const role = row ? await memberships.role(ctx.db, row.organization_id, u.id) : null;
  if (!row || !can(role, 'project.read', u.platformAdmin)) throw notFound('Projeto');
  return { row, role };
}

/** What changed between two versions, in words, for the history list. */
function summarize(before: Project | null, after: Project): string {
  if (!before) return 'Projeto criado';
  const parts: string[] = [];
  const keys: (keyof Project)[] = ['name', 'discovery', 'facts', 'people', 'activities', 'scenarios', 'consulting', 'portalReview', 'causal', 'archived', 'status'];
  const label: Record<string, string> = { name: 'nome', discovery: 'descoberta', facts: 'fatos', people: 'organograma', activities: 'processos', scenarios: 'cenários', consulting: 'consultoria/gates', portalReview: 'validação do cliente', causal: 'mapa causal', archived: 'arquivamento', status: 'status' };
  for (const k of keys) if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) parts.push(label[k] ?? String(k));
  return parts.length ? `Alterado: ${parts.join(', ')}` : 'Salvo sem mudanças de conteúdo';
}

export async function listProjects(ctx: Ctx, u: SessionUser, orgId?: string): Promise<ProjectDto[]> {
  const rows = await projects.listForUser(ctx.db, u.id, u.platformAdmin, orgId);
  const roles = new Map<string, Role | null>();
  for (const r of rows) if (!roles.has(r.organization_id)) roles.set(r.organization_id, await memberships.role(ctx.db, r.organization_id, u.id));
  return rows.map(r => toDto(r, roles.get(r.organization_id) ?? null));
}

export async function getProject(ctx: Ctx, u: SessionUser, id: string): Promise<ProjectDto> {
  const { row, role } = await load(ctx, u, id);
  return toDto(row, role);
}

export const CreateInput = z.object({ organizationId: z.string().min(1), project: z.unknown() });

export async function createProject(ctx: Ctx, u: SessionUser, input: unknown): Promise<ProjectDto> {
  const p = CreateInput.safeParse(input);
  if (!p.success) throw invalid('Informe organizationId e project.');
  const org = await orgs.byId(ctx.db, p.data.organizationId);
  const role = org ? await memberships.role(ctx.db, org.id, u.id) : null;
  if (!org || !can(role, 'org.read', u.platformAdmin)) throw notFound('Organização');
  if (!can(role, 'project.create', u.platformAdmin)) throw forbidden('Seu papel não permite criar projetos.');
  const doc = parseDoc(p.data.project);
  const id = doc.id && /^[\w-]{3,64}$/.test(doc.id) && !(await projects.idTaken(ctx.db, doc.id)) ? doc.id : newId('prj');
  const now = iso(ctx);
  const stored = { ...doc, id, version: 1, isDemo: false, createdAt: now, updatedAt: now };
  const json = sized(JSON.stringify(stored));
  await ctx.db.batch([
    projects.insert(ctx.db, { id, organization_id: org.id, name: stored.name, version: 1, archived: stored.archived ? 1 : 0, data_json: json, created_by: u.id, created_at: now, updated_by: u.id, updated_at: now, deleted_at: null }),
    revisions.insert(ctx.db, { project_id: id, version: 1, data_json: json, user_id: u.id, summary: summarize(null, stored), created_at: now }),
    audit.insert(ctx.db, { id: newId('aud'), organization_id: org.id, user_id: u.id, action: 'project.create', target: `project:${id}`, meta: {}, created_at: now })
  ]);
  return getProject(ctx, u, id);
}

/** Fields a client role may change. Everything else must stay identical. */
const CLIENT_FIELDS: (keyof Project)[] = ['portalReview'];

export async function saveProject(ctx: Ctx, u: SessionUser, id: string, expectedVersion: number | null, input: unknown): Promise<ProjectDto> {
  if (!expectedVersion || !Number.isInteger(expectedVersion)) throw new AppError(428, 'version_required', 'Envie o cabeçalho If-Match com a versão lida.');
  const { row, role } = await load(ctx, u, id);
  const before = JSON.parse(row.data_json) as Project;
  const next = parseDoc(input);
  const canEdit = can(role, 'project.edit', u.platformAdmin);
  if (!canEdit) {
    if (!can(role, 'project.portal_review', u.platformAdmin)) throw forbidden('Seu papel permite apenas leitura.');
    const strip = (p: Project) => {
      const c: Record<string, unknown> = { ...p };
      for (const k of [...CLIENT_FIELDS, 'version', 'updatedAt', 'createdAt', 'id', 'isDemo']) delete c[k];
      return JSON.stringify(c);
    };
    if (strip(before) !== strip(next)) throw forbidden('Clientes só podem registrar a validação do portal.');
  }
  if (row.version !== expectedVersion) throw new AppError(409, 'version_conflict', 'Outra pessoa salvou este projeto. Recarregue para ver a versão atual.', { currentVersion: row.version });
  const now = iso(ctx);
  const version = row.version + 1;
  const stored = { ...next, id, version, isDemo: false, createdAt: row.created_at, updatedAt: now };
  const json = sized(JSON.stringify(stored));
  const res = await projects.update(ctx.db, { id, name: stored.name, archived: stored.archived ? 1 : 0, data_json: json, updated_by: u.id, updated_at: now, expected: expectedVersion }).run();
  if (!res.meta.changes) throw new AppError(409, 'version_conflict', 'Outra pessoa salvou este projeto. Recarregue para ver a versão atual.');
  const summary = summarize(before, stored);
  await ctx.db.batch([
    revisions.insert(ctx.db, { project_id: id, version, data_json: json, user_id: u.id, summary, created_at: now }),
    audit.insert(ctx.db, { id: newId('aud'), organization_id: row.organization_id, user_id: u.id, action: canEdit ? 'project.save' : 'project.portal_review', target: `project:${id}`, meta: { version, summary }, created_at: now })
  ]);
  return getProject(ctx, u, id);
}

export async function deleteProject(ctx: Ctx, u: SessionUser, id: string): Promise<void> {
  const { row, role } = await load(ctx, u, id);
  if (!can(role, 'project.delete', u.platformAdmin)) throw forbidden('Só o responsável da organização pode excluir projetos.');
  const now = iso(ctx);
  await ctx.db.batch([
    projects.softDelete(ctx.db, id, now),
    audit.insert(ctx.db, { id: newId('aud'), organization_id: row.organization_id, user_id: u.id, action: 'project.delete', target: `project:${id}`, meta: { version: row.version }, created_at: now })
  ]);
}

export async function projectHistory(ctx: Ctx, u: SessionUser, id: string) {
  const { role } = await load(ctx, u, id);
  if (!can(role, 'project.history', u.platformAdmin)) throw forbidden();
  return revisions.list(ctx.db, id);
}
