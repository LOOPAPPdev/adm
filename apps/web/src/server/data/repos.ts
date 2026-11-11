/**
 * Data layer: every SQL statement of the backend lives here. Services never write SQL.
 * Tenant scope: project and membership queries always carry organization_id or a membership join.
 */
import type { Db } from '../infra/db';
import type { Role } from '../domain/roles';

export interface UserRow { id: string; email: string; name: string; password_hash: string; platform_role: 'admin' | null; disabled: number; created_at: string }
export interface OrgRow { id: string; slug: string; name: string; kind: 'consultancy' | 'client'; created_at: string }
export interface MembershipRow { organization_id: string; user_id: string; role: Role }
export interface ProjectRow { id: string; organization_id: string; name: string; version: number; archived: number; data_json: string; created_by: string; created_at: string; updated_by: string; updated_at: string; deleted_at: string | null }
export interface RevisionRow { project_id: string; version: number; user_id: string; user_name: string | null; summary: string; created_at: string }

export const users = {
  count: async (db: Db) => (await db.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>())?.n ?? 0,
  byEmail: (db: Db, email: string) => db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<UserRow>(),
  byId: (db: Db, id: string) => db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<UserRow>(),
  insert: (db: Db, u: Omit<UserRow, 'disabled'>) =>
    db.prepare('INSERT INTO users (id, email, name, password_hash, platform_role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(u.id, u.email, u.name, u.password_hash, u.platform_role, u.created_at, u.created_at)
};

export const sessions = {
  insert: (db: Db, s: { id: string; token_hash: string; user_id: string; created_at: string; expires_at: string; ip_hash: string | null }) =>
    db.prepare('INSERT INTO sessions (id, token_hash, user_id, created_at, expires_at, last_seen_at, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(s.id, s.token_hash, s.user_id, s.created_at, s.expires_at, s.created_at, s.ip_hash).run(),
  /** Valid session + its user, or null. Expired and disabled users are excluded in SQL. */
  find: (db: Db, tokenHash: string, nowIso: string) =>
    db.prepare(`SELECT s.id AS session_id, u.id, u.email, u.name, u.platform_role FROM sessions s JOIN users u ON u.id = s.user_id
                WHERE s.token_hash = ? AND s.expires_at > ? AND u.disabled = 0`).bind(tokenHash, nowIso)
      .first<{ session_id: string; id: string; email: string; name: string; platform_role: 'admin' | null }>(),
  touch: (db: Db, id: string, nowIso: string) => db.prepare('UPDATE sessions SET last_seen_at = ? WHERE id = ?').bind(nowIso, id).run(),
  remove: (db: Db, tokenHash: string) => db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run(),
  purgeExpired: (db: Db, nowIso: string) => db.prepare('DELETE FROM sessions WHERE expires_at <= ?').bind(nowIso).run()
};

export const orgs = {
  insert: (db: Db, o: OrgRow) => db.prepare('INSERT INTO organizations (id, slug, name, kind, created_at) VALUES (?, ?, ?, ?, ?)').bind(o.id, o.slug, o.name, o.kind, o.created_at),
  byId: (db: Db, id: string) => db.prepare('SELECT * FROM organizations WHERE id = ?').bind(id).first<OrgRow>(),
  bySlug: (db: Db, slug: string) => db.prepare('SELECT * FROM organizations WHERE slug = ?').bind(slug).first<OrgRow>(),
  all: async (db: Db) => (await db.prepare('SELECT * FROM organizations ORDER BY name').all<OrgRow>()).results,
  forUser: async (db: Db, userId: string) =>
    (await db.prepare(`SELECT o.*, m.role FROM organizations o JOIN memberships m ON m.organization_id = o.id WHERE m.user_id = ? ORDER BY o.name`)
      .bind(userId).all<OrgRow & { role: Role }>()).results
};

export const memberships = {
  insert: (db: Db, m: MembershipRow & { created_at: string }) =>
    db.prepare('INSERT INTO memberships (organization_id, user_id, role, created_at) VALUES (?, ?, ?, ?) ON CONFLICT (organization_id, user_id) DO UPDATE SET role = excluded.role')
      .bind(m.organization_id, m.user_id, m.role, m.created_at),
  role: async (db: Db, orgId: string, userId: string) =>
    (await db.prepare('SELECT role FROM memberships WHERE organization_id = ? AND user_id = ?').bind(orgId, userId).first<{ role: Role }>())?.role ?? null,
  list: async (db: Db, orgId: string) =>
    (await db.prepare(`SELECT u.id, u.email, u.name, m.role FROM memberships m JOIN users u ON u.id = m.user_id WHERE m.organization_id = ? ORDER BY u.name`)
      .bind(orgId).all<{ id: string; email: string; name: string; role: Role }>()).results
};

export const projects = {
  /** Projects the user can see: by membership, or all for a platform admin. Deleted rows never return. */
  listForUser: async (db: Db, userId: string, admin: boolean, orgId?: string) => {
    const where = ['p.deleted_at IS NULL'];
    const args: unknown[] = [];
    if (!admin) { where.push('p.organization_id IN (SELECT organization_id FROM memberships WHERE user_id = ?)'); args.push(userId); }
    if (orgId) { where.push('p.organization_id = ?'); args.push(orgId); }
    return (await db.prepare(`SELECT p.* FROM projects p WHERE ${where.join(' AND ')} ORDER BY p.updated_at DESC`).bind(...args).all<ProjectRow>()).results;
  },
  byId: (db: Db, id: string) => db.prepare('SELECT * FROM projects WHERE id = ? AND deleted_at IS NULL').bind(id).first<ProjectRow>(),
  insert: (db: Db, p: ProjectRow) =>
    db.prepare(`INSERT INTO projects (id, organization_id, name, version, archived, data_json, created_by, created_at, updated_by, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(p.id, p.organization_id, p.name, p.version, p.archived, p.data_json, p.created_by, p.created_at, p.updated_by, p.updated_at),
  /** Optimistic update: only applies when the stored version is still `expected`. */
  update: (db: Db, p: { id: string; name: string; archived: number; data_json: string; updated_by: string; updated_at: string; expected: number }) =>
    db.prepare(`UPDATE projects SET name = ?, archived = ?, data_json = ?, version = version + 1, updated_by = ?, updated_at = ?
                WHERE id = ? AND version = ? AND deleted_at IS NULL`)
      .bind(p.name, p.archived, p.data_json, p.updated_by, p.updated_at, p.id, p.expected),
  softDelete: (db: Db, id: string, nowIso: string) => db.prepare('UPDATE projects SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL').bind(nowIso, id)
};

export const revisions = {
  insert: (db: Db, r: { project_id: string; version: number; data_json: string; user_id: string; summary: string; created_at: string }) =>
    db.prepare('INSERT INTO project_revisions (project_id, version, data_json, user_id, summary, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(r.project_id, r.version, r.data_json, r.user_id, r.summary, r.created_at),
  list: async (db: Db, projectId: string) =>
    (await db.prepare(`SELECT r.project_id, r.version, r.user_id, u.name AS user_name, r.summary, r.created_at FROM project_revisions r
                       LEFT JOIN users u ON u.id = r.user_id WHERE r.project_id = ? ORDER BY r.version DESC LIMIT 200`)
      .bind(projectId).all<RevisionRow>()).results
};

export const audit = {
  insert: (db: Db, a: { id: string; organization_id: string | null; user_id: string | null; action: string; target: string; meta: unknown; created_at: string }) =>
    db.prepare('INSERT INTO audit_log (id, organization_id, user_id, action, target, meta_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(a.id, a.organization_id, a.user_id, a.action, a.target, JSON.stringify(a.meta ?? {}), a.created_at)
};

export const contacts = {
  insert: (db: Db, c: { id: string; name: string; email: string; company: string; message: string; ip_hash: string | null; created_at: string }) =>
    db.prepare('INSERT INTO contact_messages (id, name, email, company, message, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(c.id, c.name, c.email, c.company, c.message, c.ip_hash, c.created_at).run()
};

export const rateLimits = {
  /** Fixed window counter. Returns the count after this hit. */
  hit: async (db: Db, key: string, windowStartIso: string) => {
    await db.prepare(`INSERT INTO rate_limits (key, window_start, count) VALUES (?, ?, 1)
                      ON CONFLICT (key) DO UPDATE SET count = CASE WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.count + 1 ELSE 1 END,
                                                      window_start = excluded.window_start`).bind(key, windowStartIso).run();
    return (await db.prepare('SELECT count FROM rate_limits WHERE key = ?').bind(key).first<{ count: number }>())?.count ?? 1;
  },
  reset: (db: Db, key: string) => db.prepare('DELETE FROM rate_limits WHERE key = ?').bind(key).run()
};
