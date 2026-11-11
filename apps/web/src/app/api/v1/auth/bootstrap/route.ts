import { api, body, json, setSessionCookie } from '@/server/http/handler';
import { bootstrap, bootstrapStatus } from '@/server/services/auth';

export const POST = api(async ({ req, ctx, ipHash }) => {
  const r = await bootstrap(ctx, await body(req), ipHash);
  const res = json({ user: r.user }, { status: 201 });
  setSessionCookie(res, req, r.token, r.expiresAt);
  return res;
});

/** Lets the setup page know whether it should show the form. Reveals only open/closed. */
export const GET = api(async ({ ctx }) => json(await bootstrapStatus(ctx)));
