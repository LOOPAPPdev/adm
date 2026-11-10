"use client";

import { useEffect, useMemo, useState } from "react";
import { TYPE_LABEL, type Resource, type ResourceType, type Source, type Status } from "@/lib/registry";

type Tab = "all" | ResourceType | "sources" | "installed";
const TABS: { id: Tab; label: string }[] = [
	{ id: "all", label: "All Resources" },
	{ id: "skill", label: "Skills" },
	{ id: "agent", label: "Agents" },
	{ id: "plugin", label: "Plugins" },
	{ id: "mcp-server", label: "MCP Servers" },
	{ id: "workflow", label: "Workflows" },
	{ id: "sources", label: "Sources" },
	{ id: "installed", label: "Installed" },
];
const PAGE_SIZE = 24;
const STORE = "adm.saved.v1";
type Sort = "relevance" | "name" | "recent";

function useSaved() {
	const [saved, setSaved] = useState<string[]>([]);
	const [storageError, setStorageError] = useState(false);
	useEffect(() => {
		try {
			setSaved(JSON.parse(localStorage.getItem(STORE) ?? "[]"));
		} catch {
			setStorageError(true);
		}
	}, []);
	const toggle = (id: string) =>
		setSaved((prev) => {
			const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
			try {
				localStorage.setItem(STORE, JSON.stringify(next));
			} catch {
				setStorageError(true);
			}
			return next;
		});
	return { saved, toggle, storageError };
}

const badge = "inline-flex items-center rounded-ds-pill border px-2 py-0.5 font-mono text-[11px]";
const statusStyle: Record<Status, string> = {
	verified: "border-ds-success text-ds-success",
	available: "border-ds-accent text-ds-link",
	external: "border-ds-line text-ds-muted text-ds-muted",
	restricted: "border-ds-warning text-ds-warning",
	error: "border-ds-danger text-ds-danger",
};
const statusLabel: Record<Status, string> = {
	verified: "verificado",
	available: "disponível",
	external: "externo (só link)",
	restricted: "restrito",
	error: "erro / removido",
};

export function Directory({ resources, sources, generatedAt }: { resources: Resource[]; sources: Source[]; generatedAt: string }) {
	const [tab, setTab] = useState<Tab>("all");
	const [q, setQ] = useState("");
	const [provider, setProvider] = useState("");
	const [category, setCategory] = useState("");
	const [klass, setKlass] = useState<"" | "official" | "community">("");
	const [status, setStatus] = useState<"" | Status>("");
	const [sort, setSort] = useState<Sort>("relevance");
	const [page, setPage] = useState(1);
	const [open, setOpen] = useState<Resource | null>(null);
	const [compare, setCompare] = useState<string[]>([]);
	const [showCompare, setShowCompare] = useState(false);
	const { saved, toggle, storageError } = useSaved();

	const providers = useMemo(() => [...new Set(resources.map((r) => r.provider))].sort(), [resources]);
	const categories = useMemo(
		() => [...new Set(resources.flatMap((r) => r.tags).filter((t) => !["skill", "plugin", "mcp", "agent"].includes(t)))].sort(),
		[resources],
	);

	const filtered = useMemo(() => {
		const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
		let list = resources.filter((r) => {
			if (tab === "installed") return saved.includes(r.id);
			if (tab !== "all" && tab !== "sources" && r.type !== tab) return false;
			if (provider && r.provider !== provider) return false;
			if (category && !r.tags.includes(category)) return false;
			if (klass === "official" && !r.official) return false;
			if (klass === "community" && r.official) return false;
			if (status && r.status !== status) return false;
			if (!terms.length) return true;
			const hay = `${r.name} ${r.description} ${r.author} ${r.tags.join(" ")}`.toLowerCase();
			return terms.every((t) => hay.includes(t));
		});
		const score = (r: Resource) => {
			const n = r.name.toLowerCase();
			return q ? (n === q.toLowerCase() ? 3 : n.includes(q.toLowerCase()) ? 2 : 1) : 0;
		};
		list = [...list].sort((a, b) =>
			sort === "name"
				? a.name.localeCompare(b.name)
				: sort === "recent"
					? (b.lastSynced ?? "").localeCompare(a.lastSynced ?? "")
					: score(b) - score(a) || Number(b.official) - Number(a.official) || a.name.localeCompare(b.name),
		);
		return list;
	}, [resources, tab, q, provider, category, klass, status, sort, saved]);

	useEffect(() => setPage(1), [tab, q, provider, category, klass, status, sort]);
	const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const view = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const counts = (t: Tab) => (t === "all" ? resources.length : t === "sources" ? sources.length : t === "installed" ? saved.length : resources.filter((r) => r.type === t).length);

	const toggleCompare = (id: string) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? c : [...c, id]));
	const selects = "rounded-ds-md border border-ds-line bg-ds-bg px-3 py-2 text-sm text-ds-text focus-visible:outline-2 focus-visible:outline-ds-accent";

	return (
		<div className="mx-auto max-w-6xl px-4 py-6">
			<header className="mb-4">
				<p className="mb-1 font-mono text-xs uppercase tracking-[0.08em] text-ds-muted">Loop App · ADM</p>
				<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Diretório de Skills, Plugins e MCP Servers</h1>
				<p className="text-sm text-ds-muted">
					{resources.length} recursos do Anthropic Directory · índice gerado em {new Date(generatedAt).toLocaleString("pt-BR")}. Nenhum item é instalado ou executado por esta página.
				</p>
			</header>

			<nav aria-label="Tipos de recurso" className="mb-4 flex gap-1 overflow-x-auto border-b border-ds-line">
				{TABS.map((t) => (
					<button
						key={t.id}
						onClick={() => setTab(t.id)}
						aria-current={tab === t.id ? "page" : undefined}
						className={`whitespace-nowrap px-3 py-2 text-sm ${tab === t.id ? "border-b-2 border-ds-accent font-semibold text-ds-text" : "text-ds-muted"}`}
					>
						{t.label} <span className="text-xs opacity-70">{counts(t.id)}</span>
					</button>
				))}
			</nav>

			{tab === "sources" ? (
				<SourcesView sources={sources} resources={resources} />
			) : (
				<>
					<div className="mb-4 flex flex-wrap items-center gap-2" role="search">
						<label className="sr-only" htmlFor="q">Buscar</label>
						<input id="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nome, descrição, autor ou tag…" className={`${selects} min-w-60 flex-1`} />
						<select aria-label="Fonte" className={selects} value={provider} onChange={(e) => setProvider(e.target.value)}>
							<option value="">Todas as fontes</option>
							{providers.map((p) => <option key={p}>{p}</option>)}
						</select>
						<select aria-label="Categoria" className={selects} value={category} onChange={(e) => setCategory(e.target.value)}>
							<option value="">Todas as categorias</option>
							{categories.map((c) => <option key={c}>{c}</option>)}
						</select>
						<select aria-label="Origem" className={selects} value={klass} onChange={(e) => setKlass(e.target.value as typeof klass)}>
							<option value="">Oficial + comunidade</option>
							<option value="official">Somente oficiais</option>
							<option value="community">Terceiros</option>
						</select>
						<select aria-label="Status" className={selects} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
							<option value="">Qualquer status</option>
							{(Object.keys(statusLabel) as Status[]).map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
						</select>
						<select aria-label="Ordenar" className={selects} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
							<option value="relevance">Relevância</option>
							<option value="name">Nome</option>
							<option value="recent">Sincronização recente</option>
						</select>
					</div>

					{storageError && <p role="alert" className="mb-2 text-sm text-ds-warning">Armazenamento local indisponível: itens salvos não serão persistidos.</p>}
					<div className="mb-2 flex items-center justify-between text-sm" aria-live="polite">
						<span>{filtered.length} resultado(s)</span>
						{compare.length > 1 && <button onClick={() => setShowCompare(true)} className="rounded-ds-pill border border-ds-line px-4 py-1.5">Comparar ({compare.length})</button>}
					</div>

					{view.length === 0 ? (
						<p className="rounded-ds-lg border border-dashed border-ds-line p-8 text-center text-ds-muted">
							{tab === "installed" ? "Nada salvo ainda. Use “Salvar” em um recurso." : "Nenhum recurso corresponde aos filtros."}
						</p>
					) : (
						<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{view.map((r) => (
								<li key={r.id} className="flex min-w-0 flex-col rounded-ds-lg border border-ds-line bg-ds-raised p-4 [overflow-wrap:anywhere]">
									<button onClick={() => setOpen(r)} className="text-left">
										<h2 className="text-[17px] leading-snug font-semibold">{r.displayName ?? r.name}</h2>
									</button>
									<p className="mt-1 line-clamp-3 flex-1 text-sm text-ds-muted">{r.description}</p>
									<div className="mt-2 flex flex-wrap gap-1">
										<span className={`${badge} border-ds-line text-ds-muted`}>{r.type}</span>
										<span className={`${badge} ${statusStyle[r.status]}`}>{statusLabel[r.status]}</span>
										<span className={`${badge} border-ds-line text-ds-muted`}>{r.official ? "oficial" : "terceiro"}</span>
										{r.license && <span className={`${badge} border-ds-line text-ds-muted`}>{r.license}</span>}
									</div>
									<p className="mt-2 text-xs text-ds-muted">{r.author} · {r.provider} · verificado {r.lastSynced?.slice(0, 10)}</p>
									<div className="mt-2 flex gap-2 text-sm">
										<button onClick={() => setOpen(r)} className="text-ds-link hover:underline">Detalhes</button>
										<button onClick={() => toggle(r.id)} aria-pressed={saved.includes(r.id)} className="text-ds-link hover:underline">{saved.includes(r.id) ? "Salvo ✓" : "Salvar"}</button>
										<label className="ml-auto flex items-center gap-1">
											<input type="checkbox" checked={compare.includes(r.id)} onChange={() => toggleCompare(r.id)} /> comparar
										</label>
									</div>
								</li>
							))}
						</ul>
					)}

					<div className="mt-4 flex items-center justify-center gap-3 text-sm">
						<button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-ds-pill border border-ds-line px-4 py-1.5 disabled:opacity-40">Anterior</button>
						<span>Página {page} de {pages}</span>
						<button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded-ds-pill border border-ds-line px-4 py-1.5 disabled:opacity-40">Próxima</button>
					</div>
				</>
			)}

			{open && <Details r={open} onClose={() => setOpen(null)} />}
			{showCompare && <Compare items={resources.filter((r) => compare.includes(r.id))} onClose={() => setShowCompare(false)} />}
		</div>
	);
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
	useEffect(() => {
		const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", h);
		return () => window.removeEventListener("keydown", h);
	}, [onClose]);
	return (
		<div className="fixed inset-0 z-10 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
			<div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-t-[var(--radius-xl)] bg-ds-raised p-6 sm:rounded-[var(--radius-xl)]">
				<div className="mb-3 flex items-start justify-between gap-4">
					<h2 className="text-xl font-semibold">{title}</h2>
					<button autoFocus onClick={onClose} aria-label="Fechar" className="rounded-ds-pill border border-ds-line px-3 py-1">✕</button>
				</div>
				{children}
			</div>
		</div>
	);
}

function Details({ r, onClose }: { r: Resource; onClose: () => void }) {
	const [copied, setCopied] = useState(false);
	const [manifest, setManifest] = useState(false);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(r.installation ?? "");
			setCopied(true);
		} catch {
			setCopied(false);
		}
	};
	const row = (k: string, v: React.ReactNode) => v ? <div className="grid grid-cols-[9rem_1fr] gap-2 py-1 text-sm"><dt className="text-ds-muted">{k}</dt><dd className="break-words">{v}</dd></div> : null;
	return (
		<Modal title={r.name} onClose={onClose}>
			<p className="mb-3 text-sm">{r.description}</p>
			<dl className="divide-y divide-ds-line">
				{row("Tipo / status", `${r.type} · ${statusLabel[r.status]}${r.statusReason ? ` — ${r.statusReason}` : ""}`)}
				{row("Autor", `${r.author} (${r.official ? "oficial" : "terceiro"})`)}
				{row("Fonte", r.provider)}
				{row("Versão", r.version)}
				{row("Licença", r.license ?? "não detectada")}
				{row("Compatibilidade", r.compatibility.join(", "))}
				{row("Empacota", r.provides?.join(", "))}
				{row("Dependências", r.dependencies.join(", ") || "nenhuma declarada")}
				{row("Tags", r.tags.join(", "))}
				{row("Hash (SHA-256)", r.contentHash && <code className="text-xs">{r.contentHash}</code>)}
				{row("Commit de origem", r.provenance.sha && <code className="text-xs">{r.provenance.sha}</code>)}
				{row("Removido em", r.missingSince)}
			</dl>

			<section className={`mt-4 rounded-ds-md border p-3 text-sm ${r.security.risk === "high" ? "border-ds-danger" : r.security.risk === "medium" ? "border-ds-warning" : "border-ds-success"}`}>
				<h3 className="font-semibold">Segurança · risco {r.security.risk}{r.security.requiresApproval ? " · exige aprovação explícita" : ""}</h3>
				<ul className="list-disc pl-5">{r.security.notes.map((n) => <li key={n}>{n}</li>)}</ul>
				<p className="mt-1 text-xs text-ds-muted">Heurística estática sobre a listagem de arquivos; o código de terceiros não foi executado nem auditado.</p>
			</section>

			{r.installation && (
				<section className="mt-4">
					<h3 className="mb-1 font-semibold">Instalação (manual)</h3>
					<pre className="overflow-x-auto rounded-ds-md bg-ds-surface p-2 font-mono text-xs">{r.installation}</pre>
					<button onClick={copy} className="mt-1 rounded-ds-pill border border-ds-line px-4 py-1.5 text-sm">{copied ? "Copiado ✓" : "Copiar comando"}</button>
					<span className="ml-2 text-xs text-ds-muted">Revise permissões e dependências acima antes de executar.</span>
				</section>
			)}

			<div className="mt-4 flex flex-wrap gap-3 text-sm">
				<a className="text-ds-link hover:underline" href={r.sourceUrl} target="_blank" rel="noreferrer noopener">Ver fonte original ↗</a>
				{r.repositoryUrl && <a className="text-ds-link hover:underline" href={r.repositoryUrl} target="_blank" rel="noreferrer noopener">Repositório ↗</a>}
				<button onClick={() => setManifest(!manifest)} className="text-ds-link hover:underline">{manifest ? "Ocultar" : "Pré-visualizar"} manifesto</button>
			</div>
			{manifest && <pre className="mt-2 max-h-72 overflow-auto rounded-ds-md bg-ds-surface p-2 font-mono text-xs">{JSON.stringify({ manifestPath: r.manifestPath, provenance: r.provenance, licensing: r.licensing, aliases: r.aliases }, null, 2)}</pre>}
		</Modal>
	);
}

function Compare({ items, onClose }: { items: Resource[]; onClose: () => void }) {
	const rows: [string, (r: Resource) => string][] = [
		["Tipo", (r) => r.type], ["Autor", (r) => r.author], ["Origem", (r) => (r.official ? "oficial" : "terceiro")],
		["Status", (r) => statusLabel[r.status]], ["Versão", (r) => r.version ?? "—"], ["Licença", (r) => r.license ?? "—"],
		["Risco", (r) => r.security.risk], ["Exige aprovação", (r) => (r.security.requiresApproval ? "sim" : "não")],
		["Dependências", (r) => r.dependencies.join(", ") || "—"], ["Empacota", (r) => r.provides?.join(", ") ?? "—"],
	];
	return (
		<Modal title="Comparar recursos" onClose={onClose}>
			<div className="overflow-x-auto">
				<table className="w-full text-left text-sm">
					<thead><tr><th scope="col" />{items.map((r) => <th key={r.id} scope="col" className="p-2">{r.name}</th>)}</tr></thead>
					<tbody>{rows.map(([k, f]) => <tr key={k} className="border-t border-ds-line"><th scope="row" className="p-2 text-ds-muted">{k}</th>{items.map((r) => <td key={r.id} className="p-2">{f(r)}</td>)}</tr>)}</tbody>
				</table>
			</div>
		</Modal>
	);
}

function SourcesView({ sources, resources }: { sources: Source[]; resources: Resource[] }) {
	return (
		<ul className="space-y-3">
			{sources.map((s) => {
				const n = resources.filter((r) => r.provider === s.id).length;
				return (
					<li key={s.id} className="rounded-ds-lg border border-ds-line bg-ds-raised p-4">
						<div className="flex flex-wrap items-center gap-2">
							<a href={s.url} target="_blank" rel="noreferrer noopener" className="font-semibold text-ds-link hover:underline">{s.name} ↗</a>
							<span className={`${badge} ${s.adapter ? "border-ds-success" : "border-ds-line text-ds-muted"}`}>{s.adapter ? `${n} recursos indexados` : "sem adapter"}</span>
						</div>
						<p className="text-sm text-ds-muted">{s.method}</p>
						{s.limitation && <p className="text-sm text-ds-warning">Limitação: {s.limitation}</p>}
					</li>
				);
			})}
		</ul>
	);
}
