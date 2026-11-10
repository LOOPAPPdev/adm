import { join } from "node:path";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { fetchSource } from "./fetch.mjs";
import { ADAPTERS } from "./adapters/index.mjs";
import { validateResource } from "./schema.mjs";
import { readJson, canonicalJson, sha256, slug, exists } from "./util.mjs";
import { renderReport } from "./report.mjs";

export function paths(root) {
  return {
    sources: join(root, "registry", "sources.json"),
    index: join(root, "storage", "indexes", "registry.json"),
    state: join(root, "storage", "indexes", "sync-state.json"),
    report: join(root, "storage", "reports", "import-report.md"),
    logs: join(root, "storage", "logs"),
    checkouts: join(root, "storage", "checkouts"),
    webCopy: join(root, "apps", "web", "src", "data", "registry.json"),
  };
}

/** NORMALIZE: aplica defaults e id canônico `${type}:${provider}/${slug}`. */
export function normalize(raw, source, now) {
  const { _slug, ...rest } = raw;
  const r = {
    tags: [], dependencies: [], compatibility: [], ...rest,
    provider: source.id,
    id: `${raw.type}:${source.id}/${_slug ?? slug(raw.name)}`,
    lastSynced: now,
  };
  return r;
}

/** DEDUPLICATE: mesma origem (repo+path) ou mesmo tipo+nome+hash viram um único registro canônico. */
export function dedupe(list) {
  const byKey = new Map();
  const dropped = [];
  for (const r of list) {
    const key = r.repositoryUrl && (r.provenance?.path || r.provenance?.sha)
      ? `${r.type}|${r.repositoryUrl}|${r.provenance.path ?? ""}|${r.provenance.sha ?? ""}`
      : `${r.type}|${r.name.toLowerCase()}|${r.contentHash ?? ""}`;
    const prev = byKey.get(key);
    if (!prev) { byKey.set(key, r); continue; }
    prev.aliases = [...new Set([...(prev.aliases ?? []), r.id])];
    dropped.push(r.id);
  }
  // ids ainda colidindo (mesmo nome, origens distintas): desambigua por sufixo do hash
  const seen = new Map();
  for (const r of byKey.values()) {
    const n = seen.get(r.id) ?? 0;
    seen.set(r.id, n + 1);
    if (n > 0) r.id = `${r.id}-${(r.contentHash ?? sha256(r.sourceUrl)).slice(0, 8)}`;
  }
  return { list: [...byKey.values()], dropped };
}

const stable = (idx) => canonicalJson({ ...idx, generatedAt: undefined });

export async function sync({ root, only, offline = {}, now = new Date().toISOString(), log: userLog = console.log, publish = true }) {
  const P = paths(root);
  const logLines = [];
  const log = (m) => { const l = `${new Date().toISOString()} ${m}`; logLines.push(l); userLog(m); };

  const cfg = await readJson(P.sources);
  const prev = (await readJson(P.index).catch(() => null)) ?? { resources: [] };
  const prevState = (await readJson(P.state).catch(() => null)) ?? { sources: {} };
  const state = { sources: { ...prevState.sources } };

  const sources = cfg.sources.filter((s) => s.enabled && s.adapter && (!only || only.includes(s.id)));
  const fresh = new Map(); // id -> resource (apenas fontes sincronizadas com sucesso)
  const syncedSources = new Set();

  for (const source of sources) {
    const t0 = Date.now();
    try {
      log(`[${source.id}] DISCOVER/FETCH`);
      const adapter = ADAPTERS[source.adapter];
      if (!adapter) throw new Error(`adapter desconhecido: ${source.adapter}`);
      const { checkout, commit } = await fetchSource(source, { checkoutsDir: P.checkouts, offlineDir: offline[source.id], log });
      const raws = await adapter.discover({ checkout, source, commit });
      log(`[${source.id}] ${raws.length} itens descobertos @ ${commit.slice(0, 10)}`);

      const valid = [];
      for (const raw of raws) {
        const r = normalize(raw, source, now);
        const errs = validateResource(r);
        if (errs.length) { log(`[${source.id}] REJEITADO ${r.name}: ${errs.join("; ")}`); continue; }
        valid.push(r);
      }
      const { list, dropped } = dedupe(valid);
      if (dropped.length) log(`[${source.id}] ${dropped.length} duplicado(s) mesclado(s)`);
      for (const r of list) fresh.set(r.id, r);
      syncedSources.add(source.id);
      state.sources[source.id] = { commit, lastSuccess: now, count: list.length, lastError: null, ms: undefined };
    } catch (err) {
      // isolamento de falha: mantém o que já estava indexado e registra o erro
      log(`[${source.id}] FALHOU: ${err.message}`);
      state.sources[source.id] = { ...(prevState.sources[source.id] ?? {}), lastError: { at: now, message: err.message } };
    }
  }

  // INDEX: merge incremental, sem apagar silenciosamente.
  const prevById = new Map(prev.resources.map((r) => [r.id, r]));
  const out = [];
  for (const [id, r] of fresh) {
    const old = prevById.get(id);
    if (old && old.contentHash === r.contentHash && !old.missingSince) r.lastSynced = old.lastSynced; // idempotência
    out.push(r);
  }
  const aliasIds = new Set([...fresh.values()].flatMap((r) => r.aliases ?? []));
  for (const old of prev.resources) {
    if (fresh.has(old.id) || aliasIds.has(old.id)) continue; // alias ≠ removido
    if (syncedSources.has(old.provider)) {
      out.push(old.missingSince ? old : { ...old, status: "error", statusReason: "Removido ou não listado mais pela fonte.", missingSince: now });
    } else out.push(old); // fonte não sincronizada nesta execução: preserva
  }
  out.sort((a, b) => a.type.localeCompare(b.type) || a.id.localeCompare(b.id));

  const index = { schemaVersion: 1, generatedAt: now, total: out.length, resources: out };
  const changed = stable(index) !== stable(prev);
  await mkdir(join(root, "storage", "indexes"), { recursive: true });
  await mkdir(P.logs, { recursive: true });
  if (changed || !(await exists(P.index))) {
    await writeFile(P.index, JSON.stringify(index, null, 2) + "\n");
    log(`INDEX atualizado: ${out.length} recursos`);
  } else log("INDEX sem mudanças (idempotente)");
  // estado: só reescreve se algo além de timestamps mudou
  const keepTs = (s) => ({ ...s, lastSuccess: undefined });
  const stateStable = (st) => canonicalJson(Object.fromEntries(Object.entries(st.sources).map(([k, v]) => [k, keepTs(v)])));
  if (stateStable(state) !== stateStable(prevState) || !(await exists(P.state))) {
    await writeFile(P.state, JSON.stringify(state, null, 2) + "\n");
  } else for (const k of Object.keys(state.sources)) state.sources[k] = prevState.sources[k] ?? state.sources[k];

  await mkdir(join(root, "storage", "reports"), { recursive: true });
  const finalIdx = changed ? index : prev;
  await writeFile(P.report, renderReport({ index: finalIdx, cfg, state }));
  if (publish && (await exists(join(root, "apps", "web")))) {
    await mkdir(join(root, "apps", "web", "src", "data"), { recursive: true });
    await copyFile(P.index, P.webCopy);
    await copyFile(P.sources, join(root, "apps", "web", "src", "data", "sources.json"));
    log("PUBLISH → apps/web/src/data/registry.json");
  }
  await writeFile(join(P.logs, "last-sync.log"), logLines.join("\n") + "\n");
  return { index: finalIdx, changed, state };
}
