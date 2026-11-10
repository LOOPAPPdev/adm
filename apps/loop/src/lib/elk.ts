/** ELK.js is loaded on demand (≈1.5 MB) and shared by the org chart and the causal map. */
type ElkNode = { id: string; width: number; height: number; x?: number; y?: number };
type ElkGraph = { id: string; layoutOptions: Record<string, string>; children: ElkNode[]; edges: { id: string; sources: string[]; targets: string[] }[] };
let elk: Promise<{ layout: (g: ElkGraph) => Promise<ElkGraph> }> | null = null;

export async function elkLayout(g: ElkGraph): Promise<Map<string, { x: number; y: number }>> {
  elk ??= import('elkjs/lib/elk.bundled.js').then(m => new m.default());
  const out = await (await elk).layout(g);
  return new Map(out.children.map(c => [c.id, { x: c.x ?? 0, y: c.y ?? 0 }]));
}
