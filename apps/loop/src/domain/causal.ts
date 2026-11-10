/**
 * Qualitative causal-loop analysis (CLD). Detects feedback loops and their polarity.
 * RN-04: an arc is not empirical proof of causality. RN-05: no numeric forecast here.
 */
import type { CausalLink, CausalVariable, EvidenceStatus } from './schema';

export interface FeedbackLoop { id: string; nodes: string[]; links: string[]; kind: 'R' | 'B'; weakest: EvidenceStatus }

const RANK: EvidenceStatus[] = ['unknown', 'restricted', 'hypothesis', 'informed', 'confirmed'];

/** Elementary cycles (Johnson-style DFS restricted to small graphs; LOOP models stay small). */
export function findLoops(vars: CausalVariable[], links: CausalLink[], max = 50): FeedbackLoop[] {
  const ids = vars.map(v => v.id);
  const out: FeedbackLoop[] = [];
  const seen = new Set<string>();
  const adj = new Map<string, CausalLink[]>();
  links.forEach(l => { if (ids.includes(l.from) && ids.includes(l.to)) adj.set(l.from, [...(adj.get(l.from) ?? []), l]); });
  ids.forEach((start, si) => {
    const stack: { node: string; path: string[]; via: CausalLink[] }[] = [{ node: start, path: [start], via: [] }];
    while (stack.length && out.length < max) {
      const { node, path, via } = stack.pop()!;
      for (const l of adj.get(node) ?? []) {
        if (l.to === start) {
          const loopLinks = [...via, l];
          const key = [...path].sort().join('|') + '#' + loopLinks.map(x => x.id).sort().join('|');
          if (seen.has(key)) continue;
          seen.add(key);
          const neg = loopLinks.filter(x => x.polarity === '-').length;
          const weakest = loopLinks.map(x => x.status).sort((a, b) => RANK.indexOf(a) - RANK.indexOf(b))[0];
          out.push({ id: `L${out.length + 1}`, nodes: path, links: loopLinks.map(x => x.id), kind: neg % 2 === 0 ? 'R' : 'B', weakest });
        } else if (!path.includes(l.to) && ids.indexOf(l.to) > si) {
          stack.push({ node: l.to, path: [...path, l.to], via: [...via, l] });
        }
      }
    }
  });
  return out;
}

/** A link may support a calculation only with a source/justification (acceptance scenario 3). */
export function canApproveLink(l: CausalLink): { ok: true } | { ok: false; reason: string } {
  if (!l.note.trim()) return { ok: false, reason: 'Fonte ou justificativa ausente. Registre a evidência antes de confirmar a relação.' };
  return { ok: true };
}
