import { api, json } from '@/server/http/handler';

export const GET = api(async ({ ctx }) => {
  await ctx.db.prepare('SELECT 1').first();
  return json({ status: 'ok', db: 'ok' });
});
