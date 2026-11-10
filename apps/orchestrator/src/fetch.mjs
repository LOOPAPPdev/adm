import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { git, withRetry, exists } from "./util.mjs";

function classify(err) {
  const msg = `${err.message} ${err.stderr ?? ""}`;
  if (/429|rate limit|secondary rate/i.test(msg)) err.retryAfterMs = 30_000;
  return err;
}

/**
 * FETCH: clone raso (depth 1) em storage/checkouts/<id>; reexecuções fazem fetch incremental.
 * Somente leitura de arquivos; nenhum conteúdo clonado é executado.
 */
export async function fetchSource(source, { checkoutsDir, offlineDir, log }) {
  if (offlineDir) {
    const sha = await git(["rev-parse", "HEAD"], { cwd: offlineDir }).catch(() => "local");
    return { checkout: offlineDir, commit: sha };
  }
  const dir = join(checkoutsDir, source.id);
  await mkdir(checkoutsDir, { recursive: true });
  await withRetry(async () => {
    try {
      if (await exists(join(dir, ".git"))) {
        await git(["fetch", "--depth", "1", "origin", "HEAD"], { cwd: dir });
        await git(["reset", "--hard", "FETCH_HEAD"], { cwd: dir });
      } else {
        await git(["clone", "--depth", "1", "--no-tags", source.url + ".git", dir]);
      }
    } catch (e) { throw classify(e); }
  }, { retries: 3, baseMs: 2000, label: `git ${source.id}`, log });
  return { checkout: dir, commit: await git(["rev-parse", "HEAD"], { cwd: dir }) };
}
