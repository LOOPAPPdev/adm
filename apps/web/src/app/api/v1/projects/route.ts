import { api, body, json } from '@/server/http/handler';
import { createProject, listProjects } from '@/server/services/projects';

export const GET = api(async ({ req, ctx, user }) => {
  const org = req.nextUrl.searchParams.get('organizationId') ?? undefined;
  return json({ projects: await listProjects(ctx, await user(), org) });
});
export const POST = api(async ({ req, ctx, user }) => json(await createProject(ctx, await user(), await body(req)), { status: 201 }));
