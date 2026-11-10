import registry from "@/data/registry.json";
import sourcesJson from "@/data/sources.json";

export type ResourceType = "skill" | "agent" | "plugin" | "mcp-server" | "workflow";
export type Status = "verified" | "available" | "external" | "restricted" | "error";

export interface Resource {
	id: string;
	name: string;
	description: string;
	type: ResourceType;
	author: string;
	provider: string;
	official: boolean;
	sourceUrl: string;
	repositoryUrl?: string;
	version?: string;
	license?: string;
	tags: string[];
	dependencies: string[];
	installation?: string;
	manifestPath?: string;
	contentHash?: string;
	lastSynced?: string;
	status: Status;
	statusReason?: string;
	provenance: { source: string; ref?: string; sha?: string; path?: string };
	licensing: { redistributable: boolean; mirrorable: boolean };
	security: { risk: "low" | "medium" | "high"; requiresApproval: boolean; notes: string[] };
	compatibility: string[];
	provides?: string[];
	displayName?: string;
	aliases?: string[];
	missingSince?: string;
}

export interface Source {
	id: string;
	name: string;
	url: string;
	adapter: string | null;
	method: string;
	limitation?: string;
	enabled: boolean;
}

export const resources = (registry as unknown as { resources: Resource[] }).resources;
export const generatedAt = (registry as unknown as { generatedAt: string }).generatedAt;
export const sources = (sourcesJson as { sources: Source[] }).sources;

export const TYPE_LABEL: Record<ResourceType, string> = {
	skill: "Skills",
	agent: "Agents",
	plugin: "Plugins",
	"mcp-server": "MCP Servers",
	workflow: "Workflows",
};
