import { api, json } from '@/server/http/handler';
import { restoreRevision } from '@/server/services/projects';

export const POST = api(async ({ req, ctx, user, params }) => {
  const ifMatch = req.headers.get('if-match');
  const dto = await restoreRevision(ctx, await user(), params.id, Number(params.version), ifMatch ? Number(ifMatch.replace(/"/g, '')) : null);
  const res = json(dto);
  res.headers.set('ETag', `"${dto.version}"`);
  return res;
});
