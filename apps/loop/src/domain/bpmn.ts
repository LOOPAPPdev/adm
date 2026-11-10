/**
 * BPMN 2.0 XML projection of the operational flow (notation and exchange only).
 * NOT an executable model: no conditions, no data objects, no engine. See RQ-04.
 */
import { FLOW_GEOM, layoutFlow, type FlowActivity } from './model';
import type { Activity, Person } from './schema';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const sid = (s: string) => 'n_' + s.replace(/[^A-Za-z0-9_-]/g, '_');

export function toBpmnXml(acts: Activity[] | FlowActivity[], people: Person[], opts: { name: string; startLabel?: string }): string {
  const f = layoutFlow(acts, people, opts.startLabel);
  const G = FLOW_GEOM, poolX = 0, laneX = 30, laneW = f.width + 40;
  const tag = (t: string) => (t === 'start' ? 'startEvent' : t === 'end' ? 'endEvent' : t === 'gateway' ? 'exclusiveGateway' : 'task');
  const size = (t: string) => (t === 'task' ? [G.taskW, G.taskH] : t === 'gateway' ? [50, 50] : [36, 36]);

  const flows = f.nodes.slice(1).map((n, i) => ({ id: `flow_${i + 1}`, from: f.nodes[i], to: n }));
  const incoming = (id: string) => flows.filter(x => x.to.id === id).map(x => `<bpmn:incoming>${x.id}</bpmn:incoming>`).join('');
  const outgoing = (id: string) => flows.filter(x => x.from.id === id).map(x => `<bpmn:outgoing>${x.id}</bpmn:outgoing>`).join('');

  const lanesXml = f.lanes.map(l => `<bpmn:lane id="${sid('lane_' + l.id)}" name="${esc(l.label)}">${f.nodes.filter(n => (n.ownerId || 'none') === l.id || n.ownerId === l.ownerId).map(n => `<bpmn:flowNodeRef>${sid(n.id)}</bpmn:flowNodeRef>`).join('')}</bpmn:lane>`).join('');
  const nodesXml = f.nodes.map(n => `<bpmn:${tag(n.type)} id="${sid(n.id)}" name="${esc(n.label)}">${incoming(n.id)}${outgoing(n.id)}</bpmn:${tag(n.type)}>`).join('');
  const flowsXml = flows.map(x => `<bpmn:sequenceFlow id="${x.id}" sourceRef="${sid(x.from.id)}" targetRef="${sid(x.to.id)}" />`).join('');

  const shapes = f.nodes.map(n => {
    const [w, h] = size(n.type);
    return `<bpmndi:BPMNShape id="${sid(n.id)}_di" bpmnElement="${sid(n.id)}"><dc:Bounds x="${laneX + n.cx - w / 2}" y="${n.cy - h / 2}" width="${w}" height="${h}" /></bpmndi:BPMNShape>`;
  }).join('');
  const edges = flows.map(x => {
    const [aw] = size(x.from.type), [bw] = size(x.to.type);
    const x1 = laneX + x.from.cx + aw / 2, x2 = laneX + x.to.cx - bw / 2, mx = x2 - 20;
    const pts = x.from.cy === x.to.cy ? [[x1, x.from.cy], [x2, x.to.cy]] : [[x1, x.from.cy], [mx, x.from.cy], [mx, x.to.cy], [x2, x.to.cy]];
    return `<bpmndi:BPMNEdge id="${x.id}_di" bpmnElement="${x.id}">${pts.map(p => `<di:waypoint x="${p[0]}" y="${p[1]}" />`).join('')}</bpmndi:BPMNEdge>`;
  }).join('');
  const laneShapes = f.lanes.map(l => `<bpmndi:BPMNShape id="${sid('lane_' + l.id)}_di" bpmnElement="${sid('lane_' + l.id)}" isHorizontal="true"><dc:Bounds x="${laneX}" y="${l.top}" width="${laneW}" height="${l.height}" /></bpmndi:BPMNShape>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="loop_defs" targetNamespace="https://loop.app/bpmn" exporter="LOOP Studio" exporterVersion="1.0">
<bpmn:documentation>Projeção de notação gerada pelo LOOP Studio. Não é um modelo BPMN executável.</bpmn:documentation>
<bpmn:collaboration id="loop_collab"><bpmn:participant id="loop_pool" name="${esc(opts.name)}" processRef="loop_process" /></bpmn:collaboration>
<bpmn:process id="loop_process" isExecutable="false"><bpmn:laneSet id="loop_lanes">${lanesXml}</bpmn:laneSet>${nodesXml}${flowsXml}</bpmn:process>
<bpmndi:BPMNDiagram id="loop_diagram"><bpmndi:BPMNPlane id="loop_plane" bpmnElement="loop_collab"><bpmndi:BPMNShape id="loop_pool_di" bpmnElement="loop_pool" isHorizontal="true"><dc:Bounds x="${poolX}" y="0" width="${laneW + laneX}" height="${f.height}" /></bpmndi:BPMNShape>${laneShapes}${shapes}${edges}</bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>
`;
}
