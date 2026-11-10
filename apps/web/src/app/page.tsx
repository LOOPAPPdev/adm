import { Directory } from "@/components/Directory";
import { generatedAt, resources, sources } from "@/lib/registry";

export default function Home() {
	return <Directory resources={resources} sources={sources} generatedAt={generatedAt} />;
}
