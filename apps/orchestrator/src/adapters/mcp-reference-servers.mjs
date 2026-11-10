import { join } from "node:path";
import { readJson, readText, listDir, detectLicense, PERMISSIVE, sha256, exists } from "../util.mjs";

export const id = "mcp-reference-servers";

function parseBullets(readme, heading) {
  const start = readme.indexOf(heading);
  if (start < 0) return [];
  const rest = readme.slice(start + heading.length);
  const end = rest.search(/\n##\s/);
  const block = end < 0 ? rest : rest.slice(0, end);
  const items = [];
  for (const line of block.split("\n")) {
    const m = /^- \*\*\[([^\]]+)\]\(([^)]+)\)\*\*\s*-\s*(.*)$/.exec(line.trim());
    if (m) items.push({ title: m[1], link: m[2], desc: m[3].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[`*]/g, "") });
  }
  return items;
}

export async function discover({ checkout, source, commit }) {
  const readme = await readText(join(checkout, "README.md"));
  if (!readme) throw new Error("README.md ausente");
  const repoLicense = detectLicense(await readText(join(checkout, "LICENSE")));
  const out = [];

  const active = parseBullets(readme, "Reference Servers");
  // 'Reference Servers' vem antes de '### Archived' (seção ### própria); limitamos ao bloco ativo.
  const archivedStart = readme.indexOf("### Archived");
  const activeOnly = archivedStart > 0 ? parseBullets(readme.slice(0, archivedStart), "Reference Servers") : active;

  for (const it of activeOnly) {
    const dir = it.link.replace(/^\.?\//, "");
    const abs = join(checkout, dir);
    let pkg = null, pyName = null;
    if (await exists(join(abs, "package.json"))) pkg = await readJson(join(abs, "package.json"));
    const py = await readText(join(abs, "pyproject.toml"));
    if (py) pyName = /^name\s*=\s*"([^"]+)"/m.exec(py)?.[1];
    const pyVersion = py ? /^version\s*=\s*"([^"]+)"/m.exec(py)?.[1] : undefined;
    const license = detectLicense(await readText(join(abs, "LICENSE"))) ?? repoLicense;
    const permissive = PERMISSIVE.has(license);
    const manifestPath = pkg ? `${dir}/package.json` : py ? `${dir}/pyproject.toml` : `${dir}/README.md`;
    const manifestText = (await readText(join(checkout, manifestPath))) ?? "";
    const installation = pkg?.name
      ? `npx -y ${pkg.name}`
      : pyName
        ? `uvx ${pyName}`
        : `Veja ${source.url}/tree/main/${dir}`;
    out.push({
      name: it.title,
      description: it.desc,
      type: "mcp-server",
      author: "Model Context Protocol",
      official: true,
      sourceUrl: `${source.url}/tree/main/${dir}`,
      repositoryUrl: source.url,
      version: pkg?.version ?? pyVersion,
      license,
      tags: ["mcp", "reference-server"],
      dependencies: [pkg ? "node>=18" : "python>=3.10 + uv"],
      installation,
      manifestPath,
      contentHash: sha256(manifestText),
      status: permissive ? "verified" : "available",
      licensing: { redistributable: permissive, mirrorable: permissive },
      security: {
        risk: "high",
        requiresApproval: true,
        notes: ["Servidor MCP executa como processo local e pode acessar arquivos, rede ou credenciais conforme seus argumentos. Configure escopos mínimos."],
      },
      compatibility: ["mcp-clients"],
      provenance: { source: source.id, ref: "main", sha: commit, path: dir },
    });
  }

  const archivedText = archivedStart > 0 ? readme.slice(archivedStart) : "";
  for (const it of parseBullets(archivedText, "### Archived")) {
    out.push({
      name: `${it.title} (archived)`,
      description: it.desc,
      type: "mcp-server",
      author: "Model Context Protocol",
      official: true,
      sourceUrl: it.link,
      repositoryUrl: it.link.split("/tree/")[0],
      tags: ["mcp", "archived"],
      dependencies: [],
      manifestPath: "README.md",
      contentHash: sha256(`${it.title}|${it.link}|${it.desc}`),
      status: "external",
      statusReason: "Arquivado em modelcontextprotocol/servers-archived; mantido apenas como referência.",
      licensing: { redistributable: false, mirrorable: false },
      security: { risk: "high", requiresApproval: true, notes: ["Sem manutenção ativa; pode conter vulnerabilidades conhecidas."] },
      compatibility: ["mcp-clients"],
      provenance: { source: source.id, ref: "main", sha: commit, path: it.link.split("/tree/main/")[1] ?? it.title },
      _slug: `archived-${it.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    });
  }
  return out;
}
