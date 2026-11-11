import { Background, Controls, Handle, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react';
import { motion } from 'motion/react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { FLOW_GEOM, type FlowLayout } from '@/domain/model';
import { cn } from '@/lib/cn';

type FlowData = { label: string; owner: string; kind: 'start' | 'end' | 'task' | 'gateway'; active: boolean; done: boolean; selected: boolean; change: string | null; auto: boolean };
type LaneData = { label: string; auto: boolean; even: boolean; width: number };

const hidden = '!h-1 !w-1 !min-w-0 !border-0 !bg-transparent';

const FlowNode = memo(({ data }: NodeProps<Node<FlowData>>) => {
  const { kind, active, selected, change } = data;
  const ring = active ? 'border-2 border-ds-accent bg-ds-accent-soft' : selected ? 'border-2 border-ds-text' : change === 'added' ? 'border-[1.5px] border-ds-success' : change === 'reassigned' ? 'border-[1.5px] border-ds-violet' : kind === 'task' ? 'border-[1.5px] border-ds-line' : 'border-[1.5px] border-ds-text';
  const pulse = active && <motion.span aria-hidden className="pointer-events-none absolute inset-[-6px] rounded-[inherit] border-2 border-ds-accent" initial={{ opacity: 0.6, scale: 0.96 }} animate={{ opacity: 0, scale: 1.12 }} transition={{ duration: 1, repeat: Infinity }} />;
  if (kind === 'task') {
    return (
      <div className={cn('relative flex h-[60px] w-[132px] flex-col justify-center rounded-[11px] px-2.5 shadow-sm', ring, !active && (data.auto ? 'bg-ds-violet-soft' : 'bg-ds-surface'))} title={`${data.label} — ${data.owner}`}>
        <Handle type="target" position={Position.Left} className={hidden} />
        {change && <span className={cn('absolute -top-2 left-2 rounded-ds-pill bg-ds-surface px-1.5 text-[9px] font-semibold tracking-wider', change === 'added' ? 'text-ds-success' : 'text-ds-violet')}>{change === 'added' ? 'NOVO' : 'REATRIBUÍDO'}</span>}
        <span className="line-clamp-2 text-[11.5px] font-semibold leading-tight text-ds-text">{data.label}</span>
        <span className="mt-0.5 truncate text-[10px] text-ds-muted">{data.owner}</span>
        {pulse}
        <Handle type="source" position={Position.Right} className={hidden} />
      </div>
    );
  }
  const size = kind === 'gateway' ? FLOW_GEOM.gw : FLOW_GEOM.ev;
  return (
    <div className="relative flex flex-col items-center" style={{ width: 120 }}>
      <div className="relative" style={{ width: size, height: size }}>
        <Handle type="target" position={Position.Left} className={hidden} style={{ left: 0 }} />
        <div className={cn('absolute inset-0 bg-ds-surface', ring, kind === 'gateway' ? 'rotate-45 scale-[.74] rounded-[4px]' : 'rounded-ds-pill', kind === 'end' && !active && 'border-4', active && 'bg-ds-accent-soft')} />
        {kind === 'gateway' && <span className="absolute inset-0 flex items-center justify-center text-[15px] font-semibold text-ds-text">×</span>}
        {pulse}
        <Handle type="source" position={Position.Right} className={hidden} style={{ right: 0 }} />
      </div>
      <span className="mt-1 max-w-[120px] text-center text-[10.5px] font-semibold leading-tight text-ds-text">{data.label}</span>
    </div>
  );
});
FlowNode.displayName = 'FlowNode';

const LaneNode = memo(({ data }: NodeProps<Node<LaneData>>) => (
  <div className={cn('h-full border-b border-ds-line', data.auto ? 'bg-ds-violet-soft/70' : data.even ? 'bg-ds-surface' : 'bg-ds-surface')} style={{ width: data.width }}>
    <span className="absolute left-3 top-1/2 max-w-[150px] -translate-y-1/2 text-[11px] font-semibold uppercase leading-tight tracking-[0.04em] text-ds-muted">{data.label}</span>
  </div>
));
LaneNode.displayName = 'LaneNode';

const nodeTypes = { flow: FlowNode, lane: LaneNode };

export interface FlowCanvasProps { layout: FlowLayout; activeIdx?: number; selectedId?: string; onPick?: (id: string) => void; height?: number; ariaLabel: string }

export function FlowCanvas({ layout, activeIdx = -1, selectedId, onPick, height, ariaLabel }: FlowCanvasProps) {
  // Height follows the measured width × diagram aspect ratio, capped by the requested height (avoids empty space on phones).
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const cap = height ?? Math.min(Math.max(layout.height + 40, 260), 560);
  const h = w ? Math.min(cap, Math.max(200, Math.round(w * (layout.height + 60) / (layout.width + 40)) + 70)) : cap;
  const { nodes, edges } = useMemo(() => {
    const lanes: Node[] = layout.lanes.map((l, i) => ({ id: 'lane:' + l.id, type: 'lane', position: { x: 0, y: l.top }, data: { label: l.label, auto: l.auto, even: i % 2 === 0, width: layout.width }, style: { width: layout.width, height: l.height }, selectable: false, draggable: false, zIndex: -1, focusable: false }));
    const ns: Node[] = layout.nodes.map(n => {
      const isTask = n.type === 'task', s = n.type === 'gateway' ? FLOW_GEOM.gw : FLOW_GEOM.ev;
      return {
        id: n.id, type: 'flow', draggable: false, connectable: false, ariaLabel: `${n.label}, ${n.owner}`,
        position: isTask ? { x: n.cx - FLOW_GEOM.taskW / 2, y: n.cy - FLOW_GEOM.taskH / 2 } : { x: n.cx - 60, y: n.cy - s / 2 },
        data: { label: n.label, owner: n.owner, kind: n.type, active: n.idx === activeIdx, done: n.idx < activeIdx, selected: n.id === selectedId, change: n.change, auto: n.ownerId === 'auto' }
      };
    });
    const es: Edge[] = layout.nodes.slice(1).map((n, i) => {
      const lit = activeIdx >= 0 && i + 1 <= activeIdx;
      return { id: `e${i}`, source: layout.nodes[i].id, target: n.id, type: 'smoothstep', animated: i + 1 === activeIdx, style: { stroke: lit ? 'var(--color-accent)' : 'var(--color-neutral-400)', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed', color: lit ? 'var(--color-accent)' : 'var(--color-neutral-400)', width: 16, height: 16 } } as Edge;
    });
    return { nodes: [...lanes, ...ns], edges: es };
  }, [layout, activeIdx, selectedId]);

  return (
    <div ref={box} role="figure" aria-label={ariaLabel} className="w-full overflow-hidden rounded-ds-lg border border-ds-line bg-ds-surface" style={{ height: h }}>
      <ReactFlow key={h} nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.08 }} minZoom={0.15} maxZoom={1.6}
        nodesDraggable={false} nodesConnectable={false} elementsSelectable={!!onPick} panOnScroll={false} zoomOnScroll={false} preventScrolling={false}
        onNodeClick={(_, n) => { if (onPick && n.type === 'flow') onPick(n.id); }} proOptions={{ hideAttribution: true }}>
        <Background gap={24} color="var(--color-neutral-200)" />
        <Controls showInteractive={false} className="no-print" />
      </ReactFlow>
    </div>
  );
}
