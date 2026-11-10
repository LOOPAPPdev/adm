import test from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter, detectLicense, canonicalJson, withRetry } from "../src/util.mjs";
import { validateResource } from "../src/schema.mjs";
import { dedupe, normalize } from "../src/pipeline.mjs";
import { APACHE } from "./helpers.mjs";

test("frontmatter: aspas, bloco dobrado", () => {
  const fm = parseFrontmatter('---\nname: x\ndescription: >\n  a\n  b\nlicense: "MIT"\n---\nbody');
  assert.deepEqual(fm, { name: "x", description: "a b", license: "MIT" });
});
test("licença detectada", () => {
  assert.equal(detectLicense(APACHE), "Apache-2.0");
  assert.equal(detectLicense("Proprietary. All rights reserved."), "UNRECOGNIZED");
  assert.equal(detectLicense(null), undefined);
});
test("canonicalJson ignora ordem e undefined", () => {
  assert.equal(canonicalJson({ b: 1, a: undefined, c: [2] }), canonicalJson({ c: [2], b: 1 }));
});
test("retry com backoff", async () => {
  let n = 0;
  const r = await withRetry(async () => { if (++n < 3) { const e = new Error("x"); e.retryAfterMs = 1; throw e; } return "ok"; }, { retries: 3 });
  assert.equal(r, "ok"); assert.equal(n, 3);
});
test("validateResource rejeita incompleto", () => {
  assert.ok(validateResource({ id: "x" }).length > 0);
});
test("dedupe funde mesma origem e preserva alias", () => {
  const mk = (id, name) => ({ id, name, type: "plugin", repositoryUrl: "https://github.com/a/b", provenance: { path: "p" }, contentHash: "h", sourceUrl: "https://x" });
  const { list, dropped } = dedupe([mk("plugin:s/a", "a"), mk("plugin:s/b", "b")]);
  assert.equal(list.length, 1); assert.deepEqual(list[0].aliases, ["plugin:s/b"]); assert.deepEqual(dropped, ["plugin:s/b"]);
});
test("normalize gera id canônico", () => {
  const r = normalize({ name: "Foo Bar", type: "skill" }, { id: "src" }, "t");
  assert.equal(r.id, "skill:src/foo-bar");
});
