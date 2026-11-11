import { api, clearSessionCookie, json } from '@/server/http/handler';
import { logout } from '@/server/services/auth';

export const POST = api(async ({ req, ctx, token }) => {
  await logout(ctx, token);
  const res = json({ ok: true });
  clearSessionCookie(res, req);
  return res;
});
