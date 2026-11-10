import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { sync } from "../src/pipeline.mjs";
import { tmp, put, skillsFixture, pluginsFixture, mcpFixture } from "./helpers.mjs";

async function setup() {
  const root = await tmp();
  const sources = await readFile(new URL("../../../registry/sources.json", import.meta.url), "utf8");
  await put(root, "registry/sources.json", sources);
  const offline = {
    "anthropics-skills": await skillsFixture(),
    "claude-plugins-official": await pluginsFixture(),
    "mcp-reference-servers": await mcpFixture(),
  };
  return { root, offline };
}
const quiet = () => {};
const load = async (root) => JSON.parse(await readFile(join(root, "storage/indexes/registry.json"), "utf8"));

test("sync completo sobre fixtures", async () => {
  const { root, offline } = await setup();
  await sync({ root, offline, log: quiet, publish: false });
  const { resources: R } = await load(root);
  const by = (id) => R.find((r) => r.id === id);

  const alpha = by("skill:anthropics-skills/alpha");
  assert.equal(alpha.status, "verified");
  assert.equal(alpha.license, "Apache-2.0");
  assert.equal(alpha.security.requiresApproval, true, "scripts/ exigem aprovação");
  assert.match(alpha.contentHash, /^[0-9a-f]{64}$/);
  assert.equal(by("skill:anthropics-skills/beta").description, "linha um linha dois");
  assert.equal(by("skill:anthropics-skills/beta").status, "available", "sem licença: não redistribuível");

  const local = by("plugin:claude-plugins-official/local-one");
  assert.equal(local.version, "1.2.3");
  assert.deepEqual(local.provides, ["agents", "hooks"]);
  assert.equal(local.security.risk, "high");
  assert.equal(local.official, true);

  const ext = by("plugin:claude-plugins-official/ext-one");
  assert.equal(ext.status, "external");
  assert.equal(ext.official, false);
  assert.equal(ext.licensing.mirrorable, false);
  assert.equal(R.filter((r) => r.name.startsWith("ext-")).length, 1, "duplicata mesclada");
  assert.deepEqual(ext.aliases, ["plugin:claude-plugins-official/ext-dup"]);

  assert.equal(by("mcp-server:mcp-reference-servers/memory").installation, "npx -y @x/server-memory");
  assert.equal(by("mcp-server:mcp-reference-servers/time").installation, "uvx mcp-server-time");
  assert.equal(by("mcp-server:mcp-reference-servers/archived-redis").status, "external");
  assert.equal(R.length, 7);
});

test("idempotente: segunda execução não altera o índice", async () => {
  const { root, offline } = await setup();
  await sync({ root, offline, log: quiet, publish: false, now: "2026-01-01T00:00:00Z" });
  const a = await readFile(join(root, "storage/indexes/registry.json"), "utf8");
  const r = await sync({ root, offline, log: quiet, publish: false, now: "2026-02-02T00:00:00Z" });
  assert.equal(r.changed, false);
  assert.equal(await readFile(join(root, "storage/indexes/registry.json"), "utf8"), a);
});

test("nunca apaga em silêncio: recurso removido é marcado", async () => {
  const { root, offline } = await setup();
  await sync({ root, offline, log: quiet, publish: false, now: "2026-01-01T00:00:00Z" });
  await rm(join(offline["anthropics-skills"], "skills/beta"), { recursive: true });
  await sync({ root, offline, log: quiet, publish: false, now: "2026-02-02T00:00:00Z" });
  const beta = (await load(root)).resources.find((r) => r.id === "skill:anthropics-skills/beta");
  assert.ok(beta, "continua no índice");
  assert.equal(beta.status, "error");
  assert.equal(beta.missingSince, "2026-02-02T00:00:00Z");
});

test("falha isolada: uma fonte quebrada não afeta as outras nem apaga seus dados", async () => {
  const { root, offline } = await setup();
  await sync({ root, offline, log: quiet, publish: false, now: "2026-01-01T00:00:00Z" });
  await rm(join(offline["claude-plugins-official"], ".claude-plugin"), { recursive: true });
  await sync({ root, offline, log: quiet, publish: false, now: "2026-02-02T00:00:00Z" });
  const idx = await load(root);
  assert.ok(idx.resources.some((r) => r.id === "plugin:claude-plugins-official/local-one" && !r.missingSince), "dados anteriores preservados");
  const st = JSON.parse(await readFile(join(root, "storage/indexes/sync-state.json"), "utf8"));
  assert.match(st.sources["claude-plugins-official"].lastError.message, /ausente/);
  assert.equal(st.sources["anthropics-skills"].lastError, null);
});
