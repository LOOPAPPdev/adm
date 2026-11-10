import { Background, Controls, Handle, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react';
import { memo, useEffect, useMemo, useState } from 'react';
import { orgStructure } from '@/domain/model';
import type { Person } from '@/domain/schema';
import { elkLayout } from '@/lib/elk';
import { cn } from '@/lib/cn';

const W = 168, H = 64;
type OrgData = { name: string; role: string; kind: string; pending: boolean; selected: boolean };
const hidden = '!h-1 !w-1 !min-w-0 !border-0 !bg-transparent';

const OrgNode = memo(({ data }: NodeProps<Node<OrgData>>) => (
  <div className={cn('flex h-[64px] w-[168px] flex-col justify-center bg-paper px-3 shadow-sm',
    data.kind === 'equipe' ? 'rounded-[22px]' : data.kind === 'area' ? 'rounded-[4px]' : 'rounded-[11px]',
    data.selected ? 'border-2 border-red bg-red-soft' : data.pending ? 'border-[1.5px] border-dashed border-[#9a9a9a]' : 'border-[1.5px] border-[#d9d9d9]')}>
    <Handle type="target" position={Position.Top} className={hidden} />
    <span className={cn('text-[9px] font-extrabold tracking-[0.08em]', data.pending ? 'text-red' : 'text-muted')}>{data.kind.toUpperCase()}{data.pending ? ' · A CONFIRMAR' : ''}</span>
    <span className="truncate text-[12px] font-bold text-ink">{data.name || '(sem nome)'}</span>
    <span className="truncate text-[10.5px] text-muted">{data.role || 'função não informada'}</span>
    <Handle type="source" position={Position.Bottom} className={hidden} />
  </div>
));
OrgNode.displayName = 'OrgNode';
const nodeTypes = { org: OrgNode };

/** Org chart: hierarchy laid out by ELK (layered, top-down). Nodes without a declared manager stay in a separate "a confirmar" row. */
export function OrgCanvas({ people, selectedId, onPick, height = 440, ariaLabel }: { people: Person[]; selectedId?: string; onPick?: (id: string) => void; height?: number; ariaLabel: string }) {
  const s = useMemo(() => orgStructure(people), [people]);
  const placedIds = useMemo(() => {
    const placed = new Set(s.roots.map(r => r.id));
    let grew = true;
    while (grew) { grew = false; s.edges.forEach(e => { if (placed.has(e.from) && !placed.has(e.to)) { placed.add(e.to); grew = true; } }); }
    return placed;
  }, [s]);
  const [pos, setPos] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    let live = true;
    const tree = people.filter(p => placedIds.has(p.id));
    const edges = s.edges.filter(e => placedIds.has(e.from) && placedIds.has(e.to));
    elkLayout({ id: 'org', layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'DOWN', 'elk.spacing.nodeNode': '22', 'elk.layered.spacing.nodeNodeBetweenLayers': '46', 'elk.edgeRouting': 'ORTHOGONAL' },
      children: tree.map(p => ({ id: p.id, width: W, height: H })), edges: edges.map((e, i) => ({ id: 'e' + i, sources: [e.from], targets: [e.to] })) })
      .then(m => { if (live) setPos(m); })
      .catch(() => undefined);
    return () => { live = false; };
  }, [people, placedIds, s.edges]);

  const { nodes, edges } = useMemo(() => {
    const treeBottom = Math.max(0, ...[...pos.values()].map(p => p.y + H));
    const loose = people.filter(p => !placedIds.has(p.id));
    const ns: Node[] = people.map(p => {
      const pending = !placedIds.has(p.id);
      const li = loose.indexOf(p);
      const position = pending ? { x: li * (W + 22), y: treeBottom + 70 } : pos.get(p.id) ?? { x: 0, y: 0 };
      return { id: p.id, type: 'org', position, draggable: false, ariaLabel: `${p.name}, ${p.role}`, data: { name: p.name, role: p.role, kind: p.kind, pending, selected: p.id === selectedId } };
    });
    if (loose.length) ns.push({ id: 'pending-label', position: { x: 0, y: treeBottom + 40 }, data: { label: 'Reporte a confirmar' }, type: 'default', selectable: false, draggable: false, style: { border: 0, background: 'transparent', width: 240, padding: 0, fontSize: 11, fontWeight: 700, color: 'var(--color-muted)', textAlign: 'left', boxShadow: 'none' } });
    const es: Edge[] = s.edges.filter(e => placedIds.has(e.from)).map((e, i) => ({ id: 'o' + i, source: e.from, target: e.to, type: 'smoothstep', style: { stroke: '#bdbdbd', strokeWidth: 1.6 } }));
    return { nodes: ns, edges: es };
  }, [people, placedIds, pos, s.edges, selectedId]);

  return (
    <div role="figure" aria-label={ariaLabel} className="w-full overflow-hidden rounded-xl border border-stroke bg-paper" style={{ height }}>
      <ReactFlow key={pos.size} nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.12 }} minZoom={0.15} maxZoom={1.6}
        nodesDraggable={false} nodesConnectable={false} zoomOnScroll={false} preventScrolling={false}
        onNodeClick={(_, n) => { if (onPick && n.type === 'org') onPick(n.id); }} proOptions={{ hideAttribution: true }}>
        <Background gap={24} color="#eeeeee" />
        <Controls showInteractive={false} className="no-print" />
      </ReactFlow>
    </div>
  );
}
