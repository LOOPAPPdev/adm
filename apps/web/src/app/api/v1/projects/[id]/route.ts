import { api, body, json } from '@/server/http/handler';
import { deleteProject, getProject, saveProject } from '@/server/services/projects';

const version = (h: string | null) => (h ? Number(h.replace(/"/g, '')) : null);

export const GET = api(async ({ ctx, user, params }) => {
  const dto = await getProject(ctx, await user(), params.id);
  const res = json(dto);
  res.headers.set('ETag', `"${dto.version}"`);
  return res;
});
export const PUT = api(async ({ req, ctx, user, params }) => {
  const dto = await saveProject(ctx, await user(), params.id, version(req.headers.get('if-match')), await body(req));
  const res = json(dto);
  res.headers.set('ETag', `"${dto.version}"`);
  return res;
});
export const DELETE = api(async ({ ctx, user, params }) => {
  await deleteProject(ctx, await user(), params.id);
  return json({ ok: true });
});
