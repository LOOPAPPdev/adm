import { Background, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react';
import { memo, useEffect, useMemo, useState } from 'react';
import type { CausalLink, CausalVariable } from '@/domain/schema';
import { STATUS_LABEL } from '@/domain/model';
import { elkLayout } from '@/lib/elk';
import { cn } from '@/lib/cn';

const W = 170, H = 52;
const hidden = '!h-1 !w-1 !min-w-0 !border-0 !bg-transparent';
type VData = { label: string; unit: string; status: CausalVariable['status']; inLoop: boolean };

const VarNode = memo(({ data }: NodeProps<Node<VData>>) => (
  <div className={cn('flex h-[52px] w-[170px] flex-col justify-center rounded-full border-[1.5px] bg-paper px-4 text-center', data.inLoop ? 'border-ink' : 'border-stroke', data.status === 'unknown' && 'border-dashed')}>
    <Handle type="target" position={Position.Left} className={hidden} />
    <span className="truncate text-[12px] font-bold">{data.label}</span>
    <span className="truncate text-[10px] text-muted">{STATUS_LABEL[data.status]}{data.unit ? ' · ' + data.unit : ''}</span>
    <Handle type="source" position={Position.Right} className={hidden} />
  </div>
));
VarNode.displayName = 'VarNode';
const nodeTypes = { v: VarNode };

/** Causal loop diagram. Qualitative only: arcs are hypotheses unless backed by evidence (RN-04). */
export function CausalCanvas({ variables, links, loopNodes, height = 420 }: { variables: CausalVariable[]; links: CausalLink[]; loopNodes: Set<string>; height?: number }) {
  const [pos, setPos] = useState<Map<string, { x: number; y: number }>>(new Map());
  useEffect(() => {
    let live = true;
    elkLayout({ id: 'cld', layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': 'RIGHT', 'elk.spacing.nodeNode': '50', 'elk.layered.spacing.nodeNodeBetweenLayers': '80' },
      children: variables.map(v => ({ id: v.id, width: W, height: H })), edges: links.filter(l => variables.some(v => v.id === l.from) && variables.some(v => v.id === l.to)).map(l => ({ id: l.id, sources: [l.from], targets: [l.to] })) })
      .then(m => { if (live) setPos(m); }).catch(() => undefined);
    return () => { live = false; };
  }, [variables, links]);
  const { nodes, edges } = useMemo(() => ({
    nodes: variables.map((v, i): Node => ({ id: v.id, type: 'v', position: pos.get(v.id) ?? { x: (i % 3) * 230, y: Math.floor(i / 3) * 110 }, draggable: false, data: { label: v.label, unit: v.unit, status: v.status, inLoop: loopNodes.has(v.id) } })),
    edges: links.map((l): Edge => ({
      id: l.id, source: l.from, target: l.to, type: 'default', label: `${l.polarity === '+' ? '+' : '−'}${l.delay ? ' ‖' : ''}`,
      labelStyle: { fontWeight: 800, fontSize: 13, fill: l.polarity === '+' ? 'var(--color-green)' : 'var(--color-red)' }, labelBgStyle: { fill: 'var(--color-paper)' },
      style: { stroke: l.status === 'hypothesis' || l.status === 'unknown' ? 'var(--color-line-strong)' : 'var(--color-ink)', strokeWidth: 1.6, strokeDasharray: l.status === 'hypothesis' || l.status === 'unknown' ? '5 4' : undefined },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--color-ink-soft)', width: 16, height: 16 }
    }))
  }), [variables, links, pos, loopNodes]);
  return (
    <div role="figure" aria-label="Diagrama de laços causais" className="w-full overflow-hidden rounded-xl border border-stroke bg-paper" style={{ height }}>
      <ReactFlow key={pos.size} nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.15 }} nodesDraggable={false} nodesConnectable={false} zoomOnScroll={false} preventScrolling={false} proOptions={{ hideAttribution: true }}>
        <Background gap={24} color="var(--color-soft)" />
        <Controls showInteractive={false} className="no-print" />
      </ReactFlow>
    </div>
  );
}
