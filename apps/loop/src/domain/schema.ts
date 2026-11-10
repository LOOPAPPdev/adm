/**
 * Canonical LOOP project model (data-first).
 * Zod is the single source of truth: types, import validation and form validation derive from it.
 * Compatible with exports from the Claude Design prototype (schema "loop.project", schemaVersion 1).
 */
import { z } from 'zod';
import discovery from '@/data/discovery-3x3.json';
import bpm from '@/data/consulting-bpm.json';

export const EVIDENCE = ['unknown', 'informed', 'hypothesis', 'restricted', 'confirmed'] as const;
export const TRI = ['yes', 'no', 'unknown'] as const;
export const GATE_STATE = ['pending', 'approved', 'rejected'] as const;

export const EvidenceStatus = z.enum(EVIDENCE);
export const TriState = z.enum(TRI);
export const GateState = z.enum(GATE_STATE);

export const Question = z.object({
  id: z.string().min(1),
  text: z.string(),
  answer: z.string(),
  status: EvidenceStatus,
  custom: z.boolean().default(false)
});

export const Person = z.object({
  id: z.string().min(1),
  name: z.string(),
  role: z.string(),
  kind: z.enum(['pessoa', 'equipe', 'area']).default('pessoa'),
  /** 'top' = topo da estrutura; 'unknown' or a missing id = reporte a confirmar. */
  reportsTo: z.string()
});

export const Activity = z.object({
  id: z.string().min(1),
  label: z.string(),
  type: z.enum(['task', 'gateway']),
  /** person id, 'auto' (automação em estudo) or '' (a confirmar). */
  ownerId: z.string()
});

export const ScenarioOp = z.discriminatedUnion('op', [
  z.object({ op: z.literal('add'), id: z.string(), afterId: z.string(), label: z.string(), ownerId: z.string(), ruleId: z.string().optional() }),
  z.object({ op: z.literal('reassign'), nodeId: z.string(), ownerId: z.string() }),
  z.object({ op: z.literal('remove'), nodeId: z.string() })
]);

export const Scenario = z.object({
  name: z.string(),
  kind: z.enum(['intervention', 'alternative']),
  ops: z.array(ScenarioOp)
});

export const CausalVariable = z.object({ id: z.string(), label: z.string(), unit: z.string().default(''), status: EvidenceStatus });
export const CausalLink = z.object({
  id: z.string(),
  from: z.string(),
  to: z.string(),
  polarity: z.enum(['+', '-']),
  delay: z.boolean().default(false),
  status: EvidenceStatus,
  note: z.string().default('')
});
export const CausalModel = z.object({ variables: z.array(CausalVariable), links: z.array(CausalLink) });

const blockIds = discovery.blocks.map(b => b.id);
const factKeys = discovery.facts.map(f => f.key);
const gateIds = bpm.gates.map(g => g.id);

export const Project = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1, 'Campo "name" ausente ou vazio.'),
  version: z.number().int().positive().default(1),
  status: z.string().default('draft'),
  archived: z.boolean().default(false),
  isDemo: z.boolean().default(false),
  createdAt: z.string().optional().transform(v => v ?? new Date().toISOString()),
  updatedAt: z.string().optional().transform(v => v ?? new Date().toISOString()),
  discovery: z.record(z.string(), z.array(Question)).superRefine((d, ctx) => {
    blockIds.forEach(id => { if (!Array.isArray(d[id])) ctx.addIssue({ code: 'custom', message: `Bloco ${id} ausente em "discovery".` }); });
  }),
  facts: z.record(z.string(), TriState).superRefine((f, ctx) => {
    factKeys.forEach(k => { if (!(k in f)) ctx.addIssue({ code: 'custom', message: `Fato "${k}" deve ser yes, no ou unknown.` }); });
  }),
  people: z.array(Person),
  activities: z.array(Activity),
  scenarios: z.object({ B: Scenario, C: Scenario }),
  consulting: z.object({
    currentStep: z.number().int().min(1).max(bpm.steps.length + 1),
    gates: z.record(z.string(), GateState).superRefine((g, ctx) => {
      gateIds.forEach(id => { if (!(id in g)) ctx.addIssue({ code: 'custom', message: `Gate ${id} ausente em "consulting.gates".` }); });
    })
  }),
  portalReview: z.enum(['pending', 'ok', 'adjust']).default('pending'),
  causal: CausalModel.default({ variables: [], links: [] })
});

export type EvidenceStatus = z.infer<typeof EvidenceStatus>;
export type TriState = z.infer<typeof TriState>;
export type GateState = z.infer<typeof GateState>;
export type Question = z.infer<typeof Question>;
export type Person = z.infer<typeof Person>;
export type Activity = z.infer<typeof Activity>;
export type ScenarioOp = z.infer<typeof ScenarioOp>;
export type Scenario = z.infer<typeof Scenario>;
export type CausalVariable = z.infer<typeof CausalVariable>;
export type CausalLink = z.infer<typeof CausalLink>;
export type Project = z.infer<typeof Project> & { id: string };

export const ExportEnvelope = z.object({
  schema: z.literal('loop.project'),
  schemaVersion: z.number(),
  exportedAt: z.string(),
  notice: z.string(),
  project: z.unknown()
});

/** Turns Zod issues into short Portuguese messages with the field path. */
export function describeIssues(err: z.ZodError): string[] {
  return err.issues.map(i => {
    const path = i.path.join('.');
    const custom = i.code === 'custom' || i.message.startsWith('Campo');
    return custom || !path ? i.message : `${path}: valor inválido (${i.message}).`;
  });
}
