import { api, body, json, setSessionCookie } from '@/server/http/handler';
import { login } from '@/server/services/auth';

export const POST = api(async ({ req, ctx, ipHash }) => {
  const r = await login(ctx, await body(req), ipHash);
  const res = json({ user: r.user });
  setSessionCookie(res, req, r.token, r.expiresAt);
  return res;
});
