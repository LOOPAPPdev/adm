import { mkdtemp, mkdir, writeFile, cp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function tmp() { return mkdtemp(join(tmpdir(), "adm-test-")); }
export async function put(root, rel, content) {
  const p = join(root, rel);
  await mkdir(join(p, ".."), { recursive: true });
  await writeFile(p, content);
}
export const APACHE = "                                 Apache License\n                           Version 2.0, January 2004\n";

export async function skillsFixture() {
  const d = await tmp();
  await put(d, "skills/alpha/SKILL.md", '---\nname: alpha\ndescription: "Faz alfa"\nlicense: Complete terms in LICENSE.txt\n---\n# Alpha');
  await put(d, "skills/alpha/LICENSE.txt", APACHE);
  await put(d, "skills/alpha/scripts/run.py", "print('nunca executado')");
  await put(d, "skills/beta/SKILL.md", "---\nname: beta\ndescription: >\n  linha um\n  linha dois\n---\n# Beta");
  return d;
}
export async function pluginsFixture() {
  const d = await tmp();
  await put(d, "LICENSE", APACHE);
  await put(d, ".claude-plugin/marketplace.json", JSON.stringify({
    name: "mp", owner: { name: "Anthropic" },
    plugins: [
      { name: "local-one", description: "L", author: { name: "Anthropic" }, category: "dev", source: "./plugins/local-one" },
      { name: "ext-one", description: "E", author: { name: "ACME" }, source: { source: "url", url: "https://github.com/acme/x.git", sha: "abc" }, homepage: "https://acme.example" },
      { name: "ext-dup", description: "E2", author: { name: "ACME" }, source: { source: "url", url: "https://github.com/acme/x.git", sha: "abc" }, homepage: "https://acme.example" },
    ],
  }));
  await put(d, "plugins/local-one/.claude-plugin/plugin.json", JSON.stringify({ name: "local-one", version: "1.2.3" }));
  await put(d, "plugins/local-one/hooks/hooks.json", "{}");
  await put(d, "plugins/local-one/agents/a.md", "# agent");
  return d;
}
export async function mcpFixture() {
  const d = await tmp();
  await put(d, "LICENSE", "Permission is hereby granted, free of charge, to any person");
  await put(d, "README.md", "## Reference Servers\n\n- **[Memory](src/memory)** - Knowledge graph memory.\n- **[Time](src/time)** - Time tools.\n\n### Archived\n\n- **[Redis](https://github.com/o/servers-archived/tree/main/src/redis)** - Redis access.\n\n## Next\n");
  await put(d, "src/memory/package.json", JSON.stringify({ name: "@x/server-memory", version: "9.9.9" }));
  await put(d, "src/time/pyproject.toml", 'name = "mcp-server-time"\nversion = "0.6.0"\n');
  return d;
}
