import { api, body, json } from '@/server/http/handler';
import { addMember, listMembers } from '@/server/services/orgs';

export const GET = api(async ({ ctx, user, params }) => json({ members: await listMembers(ctx, await user(), params.orgId) }));
export const POST = api(async ({ req, ctx, user, params }) => json({ member: await addMember(ctx, await user(), params.orgId, await body(req)) }, { status: 201 }));
