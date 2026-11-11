import { getCloudflareContext } from '@opennextjs/cloudflare';
import { AppError } from '../domain/errors';
import type { Ctx, Db } from './db';

let override: Ctx | null = null;
/** Tests inject a context backed by node:sqlite instead of the Worker bindings. */
export function setCtxOverride(c: Ctx | null) { override = c; }

/** Builds the request context from the Worker bindings. Fails loudly when the D1 binding is missing. */
export async function getCtx(): Promise<Ctx> {
  if (override) return override;
  const { env } = await getCloudflareContext({ async: true });
  const e = env as unknown as { DB?: Db; BOOTSTRAP_TOKEN?: string };
  if (!e.DB) throw new AppError(503, 'db_unavailable', 'Banco de dados não configurado (binding D1 "DB" ausente).');
  return { db: e.DB, now: () => new Date(), bootstrapToken: e.BOOTSTRAP_TOKEN };
}
