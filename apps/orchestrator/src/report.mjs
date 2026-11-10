function count(list, key) {
  const m = {};
  for (const r of list) { const k = key(r); m[k] = (m[k] ?? 0) + 1; }
  return m;
}
const table = (rows, head) => `| ${head.join(" | ")} |\n|${head.map(() => "---").join("|")}|\n${rows.map((r) => `| ${r.join(" | ")} |`).join("\n")}\n`;

export function renderReport({ index, cfg, state }) {
  const R = index.resources;
  const types = ["skill", "agent", "plugin", "mcp-server", "workflow"];
  const statuses = ["verified", "available", "external", "restricted", "error"];
  const providers = [...new Set(R.map((r) => r.provider))];
  let md = `# Import report\n\nGerado por \`apps/orchestrator\`. Total: **${index.total}** recursos.\n\n`;
  md += `## Por tipo e fonte\n\n` + table(
    providers.map((p) => [p, ...types.map((t) => String(R.filter((r) => r.provider === p && r.type === t).length)), String(R.filter((r) => r.provider === p).length)]),
    ["fonte", ...types, "total"]);
  md += `\n## Por status\n\n` + table(statuses.map((s) => [s, String(R.filter((r) => r.status === s).length)]), ["status", "qtd"]);
  const off = count(R, (r) => (r.official ? "oficial (Anthropic/MCP)" : "terceiros listados no diretório"));
  md += `\n## Oficial × terceiros\n\n` + table(Object.entries(off).map(([k, v]) => [k, String(v)]), ["classe", "qtd"]);
  md += `\n## Última sincronização por fonte\n\n` + table(
    cfg.sources.filter((s) => s.adapter).map((s) => {
      const st = state.sources[s.id];
      return [s.id, st?.commit ? `\`${st.commit.slice(0, 10)}\`` : "—", st?.lastSuccess ?? "—", String(st?.count ?? 0), st?.lastError ? `ERRO: ${st.lastError.message}` : "ok"];
    }), ["fonte", "commit", "último sucesso", "itens", "estado"]);
  md += `\n## Fontes indisponíveis, restritas ou fora de escopo\n\n` + table(
    cfg.sources.filter((s) => !s.adapter).map((s) => [s.url, s.method, s.limitation ?? ""]), ["fonte", "método testado", "limitação"]);
  const ext = R.filter((r) => r.status === "external");
  md += `\n## Não espelhados / não verificados\n\n- **${ext.length}** recursos \`external\` (apenas metadados + link de origem; código não copiado).\n`;
  const unrec = R.filter((r) => r.license === "UNRECOGNIZED" || (r.status === "available"));
  md += `- **${unrec.length}** recursos \`available\` ou com licença não reconhecida (sem redistribuição automática).\n`;
  const miss = R.filter((r) => r.missingSince);
  md += `- **${miss.length}** recursos marcados como removidos/ausentes na fonte.\n`;
  const noLic = R.filter((r) => r.status === "verified" && !r.license);
  md += `- ${noLic.length} verificados sem licença detectada (deve ser 0).\n`;
  return md;
}
