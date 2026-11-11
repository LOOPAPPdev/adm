import { Directory } from "@/components/Directory";
import type { Metadata } from "next";
import { generatedAt, resources, sources } from "@/lib/registry";

export const metadata: Metadata = {
	title: "ADM Directory · Skills, Plugins e MCP Servers",
	description: "Diretório unificado de Skills, Agents, Plugins e MCP Servers a partir do Anthropic Directory.",
};

export default function Home() {
	return <Directory resources={resources} sources={sources} generatedAt={generatedAt} />;
}
