/**
 * Shared Route Handler plumbing for /api/v1: context, session cookie, same-origin check on writes,
 * JSON errors, no caching. Every handler goes through `api()`.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { AppError } from '../domain/errors';
import { getCtx } from '../infra/env';
import { sha256 } from '../infra/crypto';
import type { Ctx } from '../infra/db';
import { requireUser, SESSION_DAYS, type SessionUser } from '../services/auth';

export const COOKIE = 'loop_session';
const WRITE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export interface Call { req: NextRequest; params: Record<string, string>; ctx: Ctx; token: string | undefined; ipHash: string | null; user: () => Promise<SessionUser> }

export function json(data: unknown, init: ResponseInit = {}) {
  const res = NextResponse.json(data, init);
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

export function setSessionCookie(res: NextResponse, req: NextRequest, token: string, expires: Date) {
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: req.nextUrl.protocol === 'https:', path: '/', expires, maxAge: SESSION_DAYS * 86_400 });
}
export function clearSessionCookie(res: NextResponse, req: NextRequest) {
  res.cookies.set(COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: req.nextUrl.protocol === 'https:', path: '/', maxAge: 0 });
}

/** Writes must come from this site (CSRF defence on top of SameSite=Lax). */
function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  try { return new URL(origin).host === (req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? req.nextUrl.host); } catch { return false; }
}

export function api(fn: (c: Call) => Promise<Response>) {
  return async (req: NextRequest, route?: { params: Promise<Record<string, string>> }): Promise<Response> => {
    try {
      if (WRITE.has(req.method) && !sameOrigin(req)) throw new AppError(403, 'bad_origin', 'Requisição recusada: origem diferente do site.');
      const ctx = await getCtx();
      const token = req.cookies.get(COOKIE)?.value;
      const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
      const ipHash = ip ? await sha256(`ip:${ip}`) : null;
      let cached: SessionUser | undefined;
      const params = (await route?.params) ?? {};
      return await fn({ req, params, ctx, token, ipHash, user: async () => (cached ??= await requireUser(ctx, token)) });
    } catch (e) {
      if (e instanceof AppError) return json({ error: { code: e.code, message: e.message, details: e.details } }, { status: e.status });
      console.error(JSON.stringify({ level: 'error', path: req.nextUrl.pathname, method: req.method, message: e instanceof Error ? e.message : String(e) }));
      return json({ error: { code: 'internal', message: 'Erro interno. Tente de novo em instantes.' } }, { status: 500 });
    }
  };
}

export async function body(req: NextRequest): Promise<unknown> {
  try { return await req.json(); } catch { throw new AppError(400, 'bad_json', 'Corpo da requisição não é JSON válido.'); }
}
