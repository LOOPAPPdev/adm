import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const run = promisify(execFile);

export const sha256 = (data) => createHash("sha256").update(data).digest("hex");

/** JSON com chaves ordenadas: hash estável independente da ordem. */
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).filter((k) => value[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Retry com backoff exponencial (+ jitter). Respeita `err.retryAfterMs` (rate limit). */
export async function withRetry(fn, { retries = 3, baseMs = 1000, label = "op", log = () => {} } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      if (attempt >= retries) throw err;
      const wait = err.retryAfterMs ?? baseMs * 2 ** attempt + Math.floor(Math.random() * 250);
      log(`retry ${attempt + 1}/${retries} em ${wait}ms (${label}): ${err.message}`);
      await sleep(wait);
    }
  }
}

/** git é invocado sem shell e nunca executa conteúdo clonado (hooks desativados). */
export async function git(args, opts = {}) {
  const safe = ["-c", "core.hooksPath=/dev/null", "-c", "protocol.file.allow=never", ...args];
  const { stdout } = await run("git", safe, { maxBuffer: 64 * 1024 * 1024, ...opts });
  return stdout.trim();
}

/** Parser mínimo de frontmatter YAML (chave: valor, aspas, blocos | e >). */
export function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return {};
  const lines = m[1].split(/\r?\n/);
  const out = {};
  for (let i = 0; i < lines.length; i++) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[i]);
    if (!kv) continue;
    let [, key, val] = kv;
    if (/^[|>][+-]?$/.test(val)) {
      const block = [];
      while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) block.push(lines[++i].trim());
      val = block.join(val.startsWith("|") ? "\n" : " ");
    } else if (val === "" ) {
      const items = [];
      while (i + 1 < lines.length && /^\s+(-\s|\S)/.test(lines[i + 1])) items.push(lines[++i].trim().replace(/^-\s*/, ""));
      val = items.length ? items.join(", ") : "";
    } else if (/^(".*"|'.*')$/.test(val)) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

export async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

export async function readText(p) {
  try { return await readFile(p, "utf8"); } catch { return null; }
}

export async function readJson(p) {
  const t = await readText(p);
  if (t == null) return null;
  return JSON.parse(t);
}

export async function listDir(p) {
  try { return (await readdir(p, { withFileTypes: true })); } catch { return []; }
}

/** Lista arquivos (relativos) recursivamente, ignorando .git. */
export async function walk(root, rel = "") {
  const out = [];
  for (const e of await listDir(join(root, rel))) {
    if (e.name === ".git" || e.name === "node_modules") continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await walk(root, r)));
    else out.push(r);
  }
  return out.sort();
}

/** Detecta licença SPDX a partir do texto do arquivo LICENSE (heurística conservadora). */
export function detectLicense(text) {
  if (!text) return undefined;
  const t = text.slice(0, 4000);
  if (/Apache License\s+Version 2\.0/i.test(t)) return "Apache-2.0";
  if (/Permission is hereby granted, free of charge/i.test(t)) return "MIT";
  if (/Redistribution and use in source and binary forms/i.test(t)) return "BSD";
  if (/licensing transition from the MIT License to the Apache License/i.test(t)) return "MIT AND Apache-2.0";
  if (/Mozilla Public License/i.test(t)) return "MPL-2.0";
  if (/GNU (Affero )?General Public License/i.test(t)) return "GPL-family";
  return "UNRECOGNIZED";
}

export const PERMISSIVE = new Set(["Apache-2.0", "MIT", "BSD", "MIT AND Apache-2.0", "MPL-2.0"]);

export const stripGit = (url) => (url ? url.replace(/\.git$/, "") : url);

export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
