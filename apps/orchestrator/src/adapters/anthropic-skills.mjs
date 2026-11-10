import { join } from "node:path";
import { listDir, readText, parseFrontmatter, detectLicense, PERMISSIVE, walk, sha256, slug } from "../util.mjs";

export const id = "anthropics-skills";

// DISCOVER: lê skills/<nome>/SKILL.md. Nada é executado.
export async function discover({ checkout, source, commit }) {
  const root = join(checkout, "skills");
  const out = [];
  for (const e of await listDir(root)) {
    if (!e.isDirectory()) continue;
    const manifestPath = `skills/${e.name}/SKILL.md`;
    const text = await readText(join(checkout, manifestPath));
    if (text == null) continue;
    const fm = parseFrontmatter(text);
    const files = await walk(join(checkout, "skills", e.name));
    const license = detectLicense(await readText(join(checkout, "skills", e.name, "LICENSE.txt"))) ??
      detectLicense(await readText(join(checkout, "LICENSE")));
    const scripts = files.filter((f) => f.startsWith("scripts/"));
    const permissive = PERMISSIVE.has(license);
    out.push({
      name: fm.name || e.name,
      description: fm.description || "",
      type: "skill",
      author: "Anthropic",
      official: true,
      sourceUrl: `${source.url}/tree/main/skills/${e.name}`,
      repositoryUrl: source.url,
      license,
      tags: ["skill", ...(fm["allowed-tools"] ? ["restricted-tools"] : [])],
      dependencies: [],
      installation: `git clone ${source.url} && cp -r anthropics-skills/skills/${e.name} ~/.claude/skills/  # revise SKILL.md e scripts/ antes`,
      manifestPath,
      contentHash: sha256(text),
      status: permissive ? "verified" : "available",
      licensing: { redistributable: permissive, mirrorable: permissive },
      security: {
        risk: scripts.length ? "medium" : "low",
        requiresApproval: scripts.length > 0,
        notes: scripts.length
          ? [`Inclui ${scripts.length} arquivo(s) em scripts/ que o agente pode executar; revise antes de instalar.`]
          : ["Somente instruções em Markdown."],
      },
      compatibility: ["claude-code", "claude.ai", "agent-sdk"],
      provenance: { source: source.id, ref: "main", sha: commit, path: `skills/${e.name}` },
      fileCount: files.length,
      _slug: slug(e.name),
    });
  }
  return out;
}
