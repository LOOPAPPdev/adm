import { api, body, json } from '@/server/http/handler';
import { createOrg, listOrgs } from '@/server/services/orgs';

export const GET = api(async ({ ctx, user }) => json({ organizations: await listOrgs(ctx, await user()) }));
export const POST = api(async ({ req, ctx, user }) => json({ organization: await createOrg(ctx, await user(), await body(req)) }, { status: 201 }));
