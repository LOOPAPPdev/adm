import { api, json } from '@/server/http/handler';
import { projectHistory } from '@/server/services/projects';

export const GET = api(async ({ ctx, user, params }) => json({ revisions: await projectHistory(ctx, await user(), params.id) }));
