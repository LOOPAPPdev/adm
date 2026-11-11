/**
 * Authentication: email + password (PBKDF2-SHA256) and server-side sessions stored in D1.
 * The browser holds only an opaque random token in an HttpOnly cookie; the database stores its SHA-256.
 * Email delivery (magic links, password reset by email) is not implemented: there is no email provider yet.
 */
import { z } from 'zod';
import type { Ctx } from '../infra/db';
import { hashPassword, newId, randomToken, sha256, timingSafeEqual, verifyPassword } from '../infra/crypto';
import { AppError, forbidden, invalid, unauthorized } from '../domain/errors';
import type { Role } from '../domain/roles';
import { audit, memberships, orgs, rateLimits, sessions, users } from '../data/repos';

export const SESSION_DAYS = 14;
const LOGIN_LIMIT = 5; // failed attempts per email per 15 minutes

export interface SessionUser { id: string; email: string; name: string; platformAdmin: boolean; sessionId: string }

export const Credentials = z.object({ email: z.string().trim().toLowerCase().email('E-mail inválido.'), password: z.string().min(1, 'Informe a senha.') });
export const NewPassword = z.string().min(12, 'A senha precisa de pelo menos 12 caracteres.').max(200);
export const Bootstrap = z.object({ email: z.string().trim().toLowerCase().email(), name: z.string().trim().min(1).max(120), password: NewPassword, token: z.string().min(1), organization: z.string().trim().min(1).max(120).default('LOOP Consulting') });

const iso = (d: Date) => d.toISOString();
const window15 = (d: Date) => iso(new Date(Math.floor(d.getTime() / 900_000) * 900_000));

export async function createSession(ctx: Ctx, userId: string, ipHash: string | null): Promise<{ token: string; expiresAt: Date }> {
  const token = randomToken(32);
  const now = ctx.now();
  const expiresAt = new Date(now.getTime() + SESSION_DAYS * 86_400_000);
  await sessions.insert(ctx.db, { id: newId('ses'), token_hash: await sha256(token), user_id: userId, created_at: iso(now), expires_at: iso(expiresAt), ip_hash: ipHash });
  return { token, expiresAt };
}

export async function login(ctx: Ctx, input: unknown, ipHash: string | null) {
  const parsed = Credentials.safeParse(input);
  if (!parsed.success) throw invalid(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
  const { email, password } = parsed.data;
  const key = `login:${await sha256(email)}`;
  const attempts = await rateLimits.hit(ctx.db, key, window15(ctx.now()));
  if (attempts > LOGIN_LIMIT) throw new AppError(429, 'too_many_attempts', 'Muitas tentativas. Aguarde 15 minutos e tente de novo.');
  const u = await users.byEmail(ctx.db, email);
  // Always run the hash so response time does not reveal whether the email exists.
  const ok = await verifyPassword(password, u?.password_hash ?? 'pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
  if (!u || !ok || u.disabled) throw new AppError(401, 'invalid_credentials', 'E-mail ou senha incorretos.');
  await rateLimits.reset(ctx.db, key);
  const s = await createSession(ctx, u.id, ipHash);
  await audit.insert(ctx.db, { id: newId('aud'), organization_id: null, user_id: u.id, action: 'auth.login', target: `user:${u.id}`, meta: {}, created_at: iso(ctx.now()) }).run();
  return { ...s, user: { id: u.id, email: u.email, name: u.name } };
}

export async function logout(ctx: Ctx, token: string | undefined) {
  if (token) await sessions.remove(ctx.db, await sha256(token));
}

export async function currentUser(ctx: Ctx, token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const row = await sessions.find(ctx.db, await sha256(token), iso(ctx.now()));
  if (!row) return null;
  await sessions.touch(ctx.db, row.session_id, iso(ctx.now()));
  return { id: row.id, email: row.email, name: row.name, platformAdmin: row.platform_role === 'admin', sessionId: row.session_id };
}

export async function requireUser(ctx: Ctx, token: string | undefined): Promise<SessionUser> {
  const u = await currentUser(ctx, token);
  if (!u) throw unauthorized();
  return u;
}

export async function me(ctx: Ctx, u: SessionUser) {
  const list = await orgs.forUser(ctx.db, u.id);
  return { user: { id: u.id, email: u.email, name: u.name, platformAdmin: u.platformAdmin }, organizations: list.map(o => ({ id: o.id, slug: o.slug, name: o.name, kind: o.kind, role: o.role as Role })) };
}

/**
 * First administrator. Works only while the users table is empty AND the request carries the BOOTSTRAP_TOKEN
 * secret configured on the Worker. Creates the LOOP consultancy organization with the admin as owner.
 */
export async function bootstrap(ctx: Ctx, input: unknown, ipHash: string | null) {
  if (!ctx.bootstrapToken) throw forbidden('Bootstrap desativado: configure o segredo BOOTSTRAP_TOKEN no Worker.');
  const parsed = Bootstrap.safeParse(input);
  if (!parsed.success) throw invalid(parsed.error.issues[0]?.message ?? 'Dados inválidos.');
  const d = parsed.data;
  if (!timingSafeEqual(d.token, ctx.bootstrapToken)) throw forbidden('Token de bootstrap incorreto.');
  if ((await users.count(ctx.db)) > 0) throw new AppError(409, 'already_bootstrapped', 'Já existe um usuário. Use o login.');
  const now = iso(ctx.now());
  const userId = newId('usr');
  const orgId = newId('org');
  await ctx.db.batch([
    users.insert(ctx.db, { id: userId, email: d.email, name: d.name, password_hash: await hashPassword(d.password), platform_role: 'admin', created_at: now }),
    orgs.insert(ctx.db, { id: orgId, slug: 'loop', name: d.organization, kind: 'consultancy', created_at: now }),
    memberships.insert(ctx.db, { organization_id: orgId, user_id: userId, role: 'owner', created_at: now }),
    audit.insert(ctx.db, { id: newId('aud'), organization_id: orgId, user_id: userId, action: 'auth.bootstrap', target: `user:${userId}`, meta: {}, created_at: now })
  ]);
  const s = await createSession(ctx, userId, ipHash);
  return { ...s, user: { id: userId, email: d.email, name: d.name } };
}
