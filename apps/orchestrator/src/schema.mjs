export const RESOURCE_TYPES = ["skill", "agent", "plugin", "mcp-server", "workflow"];
export const STATUSES = ["verified", "available", "external", "restricted", "error"];

/**
 * @typedef {Object} RegistryResource
 * @property {string} id  `${type}:${provider}/${name}`
 * @property {string} name
 * @property {string} description
 * @property {"skill"|"agent"|"plugin"|"mcp-server"|"workflow"} type
 * @property {string} author
 * @property {string} provider        id da fonte (ex.: anthropics-skills)
 * @property {boolean} official       true somente para conteúdo mantido pela Anthropic / MCP project
 * @property {string} sourceUrl       link para a origem (sempre presente)
 * @property {string=} repositoryUrl
 * @property {string=} version
 * @property {string=} license        SPDX (ou UNRECOGNIZED / undefined)
 * @property {string[]} tags
 * @property {string[]} dependencies
 * @property {string=} installation   comando/instrução MANUAL (nunca executada pelo orquestrador)
 * @property {string=} manifestPath
 * @property {string=} contentHash    sha256 do manifesto canônico
 * @property {string=} lastSynced     ISO-8601
 * @property {"verified"|"available"|"external"|"restricted"|"error"} status
 * extensões:
 * @property {string=} statusReason
 * @property {{source:string, ref?:string, sha?:string, path?:string}} provenance
 * @property {{redistributable:boolean, mirrorable:boolean}} licensing
 * @property {{risk:"low"|"medium"|"high", requiresApproval:boolean, notes:string[]}} security
 * @property {string[]} compatibility  ex.: ["claude-code","claude.ai"]
 * @property {string[]=} provides      para plugins: skills/agents/commands/hooks/mcp empacotados
 * @property {string[]=} aliases       ids deduplicados fundidos neste registro
 * @property {string=} missingSince    preenchido quando a fonte deixa de listar o recurso
 */

export function validateResource(r) {
  const errors = [];
  const need = (k, ok) => { if (!ok) errors.push(`campo inválido: ${k}`); };
  need("id", typeof r.id === "string" && r.id.includes(":"));
  need("name", typeof r.name === "string" && r.name.length > 0);
  need("description", typeof r.description === "string");
  need("type", RESOURCE_TYPES.includes(r.type));
  need("author", typeof r.author === "string");
  need("provider", typeof r.provider === "string");
  need("official", typeof r.official === "boolean");
  need("sourceUrl", typeof r.sourceUrl === "string" && /^https:\/\//.test(r.sourceUrl));
  need("tags", Array.isArray(r.tags));
  need("dependencies", Array.isArray(r.dependencies));
  need("status", STATUSES.includes(r.status));
  need("provenance", r.provenance && typeof r.provenance.source === "string");
  return errors;
}
