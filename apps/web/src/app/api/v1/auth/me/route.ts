import { api, json } from '@/server/http/handler';
import { me } from '@/server/services/auth';

export const GET = api(async ({ ctx, user }) => json(await me(ctx, await user())));
