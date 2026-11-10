import * as skills from "./anthropic-skills.mjs";
import * as plugins from "./claude-plugins-official.mjs";
import * as mcp from "./mcp-reference-servers.mjs";

/** Para adicionar uma fonte: crie o módulo (export discover) e registre aqui + em registry/sources.json. */
export const ADAPTERS = { "anthropic-skills": skills, "claude-plugins-official": plugins, "mcp-reference-servers": mcp };
