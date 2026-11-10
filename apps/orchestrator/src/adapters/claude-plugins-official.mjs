import { join } from "node:path";
import { readJson, readText, listDir, detectLicense, PERMISSIVE, canonicalJson, sha256, stripGit, exists } from "../util.mjs";

export const id = "claude-plugins-official";

const isAnthropic = (a) => /^anthropic/i.test(a || "");

async function inspectLocal(checkout, rel) {
  const dir = join(checkout, rel);
  const provides = [];
  for (const [folder, label] of [["skills", "skills"], ["agents", "agents"], ["commands", "commands"], ["hooks", "hooks"]]) {
    if ((await listDir(join(dir, folder))).length) provides.push(label);
  }
  if (await exists(join(dir, ".mcp.json"))) provides.push("mcp");
  if (await exists(join(dir, ".lsp.json"))) provides.push("lsp");
  const manifest = await readJson(join(dir, ".claude-plugin", "plugin.json")).catch(() => null);
  const license = detectLicense(await readText(join(dir, "LICENSE"))) ?? detectLicense(await readText(join(checkout, "LICENSE")));
  return { provides, manifest, license };
}

export async function discover({ checkout, source, commit }) {
  const mpPath = ".claude-plugin/marketplace.json";
  const mpText = await readText(join(checkout, mpPath));
  if (mpText == null) throw new Error(`${mpPath} ausente`);
  const mp = JSON.parse(mpText);
  const out = [];
  for (const p of mp.plugins ?? []) {
    const src = p.source;
    const local = typeof src === "string";
    const author = p.author?.name || mp.owner?.name || "desconhecido";
    const base = {
      name: p.name,
      description: p.description || "",
      type: "plugin",
      author,
      tags: ["plugin", ...(p.category ? [p.category] : []), ...(p.tags ?? [])],
      dependencies: [],
      installation: `/plugin install ${p.name}@${mp.name}`,
      manifestPath: mpPath,
      version: p.version,
      compatibility: ["claude-code"],
      displayName: p.displayName,
    };
    if (local) {
      const rel = src.replace(/^\.\//, "");
      const info = await inspectLocal(checkout, rel);
      const permissive = PERMISSIVE.has(info.license);
      const risky = info.provides.some((x) => ["hooks", "mcp", "commands"].includes(x));
      out.push({
        ...base,
        version: info.manifest?.version ?? p.version,
        official: isAnthropic(author),
        sourceUrl: `${source.url}/tree/main/${rel}`,
        repositoryUrl: source.url,
        license: info.license,
        provides: info.provides,
        contentHash: sha256(canonicalJson({ entry: p, manifest: info.manifest })),
        status: permissive ? "verified" : "available",
        licensing: { redistributable: permissive, mirrorable: permissive },
        security: {
          risk: risky ? "high" : "low",
          requiresApproval: risky,
          notes: risky
            ? [`Empacota: ${info.provides.join(", ")}. Hooks/MCP/comandos podem executar código, acessar arquivos ou rede.`]
            : ["Somente skills/agents em Markdown."],
        },
        provenance: { source: source.id, ref: "main", sha: commit, path: rel },
      });
    } else {
      const repoUrl = stripGit(src?.url) ?? p.homepage;
      out.push({
        ...base,
        official: false,
        sourceUrl: p.homepage || repoUrl || source.url,
        repositoryUrl: repoUrl,
        contentHash: sha256(canonicalJson(p)),
        status: "external",
        statusReason: "Plugin de terceiros apenas listado no diretório da Anthropic; código não é espelhado.",
        licensing: { redistributable: false, mirrorable: false },
        security: {
          risk: "high",
          requiresApproval: true,
          notes: ["Código de terceiros, não auditado aqui. Pode empacotar hooks/MCP; revise o repositório de origem."],
        },
        provenance: { source: source.id, ref: src?.ref, sha: src?.sha, path: src?.path },
      });
    }
  }
  return out;
}
