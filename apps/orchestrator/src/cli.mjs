#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { cp, mkdir, writeFile } from "node:fs/promises";
import { sync, paths } from "./pipeline.mjs";
import { readJson } from "./util.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const [cmd = "help", ...args] = process.argv.slice(2);

const flag = (name) => { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; };
const flags = (name) => args.flatMap((a, i) => (a === name ? [args[i + 1]] : []));

async function main() {
  if (cmd === "sync") {
    const only = flag("--source")?.split(",");
    const offline = Object.fromEntries(flags("--offline").map((kv) => { const [id, ...p] = kv.split("="); return [id, resolve(p.join("="))]; }));
    const { index } = await sync({ root, only, offline, publish: !args.includes("--no-publish") });
    console.log(`OK: ${index.total} recursos no índice.`);
  } else if (cmd === "list") {
    const idx = await readJson(paths(root).index);
    const type = flag("--type");
    for (const r of idx.resources.filter((r) => !type || r.type === type)) console.log(`${r.type.padEnd(10)} ${r.status.padEnd(9)} ${r.id}`);
  } else if (cmd === "mirror") {
    // Espelho SOB DEMANDA (storage/mirrors, fora do Git). Só copia arquivos; nunca executa.
    const id = args[0];
    const P = paths(root);
    const idx = await readJson(P.index);
    const r = idx.resources.find((x) => x.id === id);
    if (!r) throw new Error(`recurso não encontrado: ${id}`);
    if (!r.licensing?.mirrorable) throw new Error(`espelho recusado (${r.status}, licença ${r.license ?? "n/d"}): use ${r.sourceUrl}`);
    const src = join(P.checkouts, r.provider, r.provenance.path);
    const dst = join(root, "storage", "mirrors", r.id.replace(/[:/]/g, "__"));
    await mkdir(dst, { recursive: true });
    await cp(src, dst, { recursive: true });
    await writeFile(join(dst, "SOURCE.json"), JSON.stringify({ id: r.id, sourceUrl: r.sourceUrl, license: r.license, sha: r.provenance.sha, contentHash: r.contentHash }, null, 2));
    console.log(`Espelhado em ${dst}. Revise antes de instalar: ${r.security.notes.join(" ")}`);
  } else {
    console.log(`adm-orchestrator
  sync [--source id[,id]] [--offline id=/caminho] [--no-publish]
  list [--type skill|plugin|mcp-server]
  mirror <resource-id>     copia o código (somente se a licença permitir) para storage/mirrors`);
  }
}
main().catch((e) => { console.error(`ERRO: ${e.message}`); process.exit(1); });
