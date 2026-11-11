import { api, body, json } from '@/server/http/handler';
import { submitContact } from '@/server/services/contact';

export const POST = api(async ({ req, ctx, ipHash }) => json(await submitContact(ctx, await body(req), ipHash), { status: 201 }));
