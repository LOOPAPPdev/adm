/** Organizations (tenants) and their members. A client organization owns its projects. */
import { z } from 'zod';
import type { Ctx } from '../infra/db';
import { hashPassword, newId } from '../infra/crypto';
import { AppError, forbidden, invalid, notFound } from '../domain/errors';
import { can, grantable, ROLES, type Role } from '../domain/roles';
import { audit, memberships, orgs, users } from '../data/repos';
import { NewPassword, type SessionUser } from './auth';

const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);

export const NewOrg = z.object({ name: z.string().trim().min(2).max(120), slug: z.string().trim().max(48).optional() });
export const NewMember = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido.'),
  name: z.string().trim().min(1).max(120),
  role: z.enum(ROLES),
  /** Initial password, required only when the person has no account yet (no email delivery exists). */
  password: NewPassword.optional()
});

export async function roleIn(ctx: Ctx, u: SessionUser, orgId: string): Promise<Role | null> {
  return memberships.role(ctx.db, orgId, u.id);
}

export async function listOrgs(ctx: Ctx, u: SessionUser) {
  if (u.platformAdmin) return (await orgs.all(ctx.db)).map(o => ({ ...o, role: null as Role | null }));
  return orgs.forUser(ctx.db, u.id);
}

/** Only the platform admin creates client organizations; the creator becomes owner of it. */
export async function createOrg(ctx: Ctx, u: SessionUser, input: unknown) {
  if (!u.platformAdmin) throw forbidden('Só o administrador da plataforma cria organizações.');
  const p = NewOrg.safeParse(input);
  if (!p.success) throw invalid(p.error.issues[0]?.message ?? 'Dados inválidos.');
  const slug = slugify(p.data.slug || p.data.name);
  if (!slug) throw invalid('Nome sem caracteres válidos para o endereço.');
  if (await orgs.bySlug(ctx.db, slug)) throw new AppError(409, 'slug_taken', `Já existe uma organização com o endereço "${slug}".`);
  const now = ctx.now().toISOString();
  const org = { id: newId('org'), slug, name: p.data.name, kind: 'client' as const, created_at: now };
  await ctx.db.batch([
    orgs.insert(ctx.db, org),
    memberships.insert(ctx.db, { organization_id: org.id, user_id: u.id, role: 'owner', created_at: now }),
    audit.insert(ctx.db, { id: newId('aud'), organization_id: org.id, user_id: u.id, action: 'org.create', target: `org:${org.id}`, meta: { slug }, created_at: now })
  ]);
  return org;
}

export async function listMembers(ctx: Ctx, u: SessionUser, orgId: string) {
  const role = await roleIn(ctx, u, orgId);
  if (!can(role, 'org.read', u.platformAdmin)) throw notFound('Organização');
  return memberships.list(ctx.db, orgId);
}

/** Adds (or changes the role of) a member. New accounts need an initial password set by the inviter. */
export async function addMember(ctx: Ctx, u: SessionUser, orgId: string, input: unknown) {
  const org = await orgs.byId(ctx.db, orgId);
  const role = org ? await roleIn(ctx, u, orgId) : null;
  if (!org || !can(role, 'org.read', u.platformAdmin)) throw notFound('Organização');
  if (!can(role, 'member.add', u.platformAdmin)) throw forbidden();
  const p = NewMember.safeParse(input);
  if (!p.success) throw invalid(p.error.issues[0]?.message ?? 'Dados inválidos.');
  const d = p.data;
  if (!grantable(role, u.platformAdmin).includes(d.role)) throw forbidden(`Seu papel não permite conceder "${d.role}".`);
  const now = ctx.now().toISOString();
  let target = await users.byEmail(ctx.db, d.email);
  const stmts = [];
  if (!target) {
    if (!d.password) throw invalid('Conta nova: defina uma senha inicial (12+ caracteres) e entregue-a à pessoa por um canal seguro.');
    const id = newId('usr');
    stmts.push(users.insert(ctx.db, { id, email: d.email, name: d.name, password_hash: await hashPassword(d.password), platform_role: null, created_at: now }));
    target = { id, email: d.email, name: d.name, password_hash: '', platform_role: null, disabled: 0, created_at: now };
  }
  stmts.push(memberships.insert(ctx.db, { organization_id: orgId, user_id: target.id, role: d.role, created_at: now }));
  stmts.push(audit.insert(ctx.db, { id: newId('aud'), organization_id: orgId, user_id: u.id, action: 'member.set', target: `user:${target.id}`, meta: { role: d.role }, created_at: now }));
  await ctx.db.batch(stmts);
  return { id: target.id, email: target.email, name: target.name, role: d.role };
}
