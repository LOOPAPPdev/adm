import { useState } from 'react';
import { useCurrentProject } from '../workspace/ProjectLayout';
import { allQuestions, FACTS, gaps, STATUS_LABEL, TRI_LABEL } from '@/domain/model';
import { EVIDENCE, type EvidenceStatus } from '@/domain/schema';
import { Card, Eyebrow } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { Select } from '@/components/ui/field';
import { EvidenceCounts } from '@/components/EvidenceCounts';

export function Evidencias() {
  const p = useCurrentProject();
  const [f, setF] = useState<'all' | EvidenceStatus>('all');
  const qs = allQuestions(p);
  const rows = qs.filter(q => f === 'all' || q.effective === f);
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 p-4"><Eyebrow>Registro de evidências · {rows.length} de {qs.length}</Eyebrow>
          <Select aria-label="Filtrar por estado" className="h-9 w-auto" value={f} onChange={e => setF(e.target.value as typeof f)}><option value="all">Todos os estados</option>{EVIDENCE.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</Select></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
            <thead><tr className="border-y border-stroke"><th className="p-3 eyebrow">Bloco</th><th className="p-3 eyebrow">Pergunta</th><th className="p-3 eyebrow">Resposta</th><th className="p-3 eyebrow">Estado</th></tr></thead>
            <tbody>{rows.map(q => <tr key={q.id} className="border-b border-soft align-top"><td className="p-3 font-bold">{q.block}</td><td className="p-3">{q.text}</td><td className="p-3 text-muted">{q.answer.trim() || '—'}</td><td className="p-3"><StatusBadge status={q.effective} /></td></tr>)}</tbody>
          </table>
        </div>
      </Card>
      <div className="space-y-4">
        <Card><Eyebrow className="mb-2">Resumo</Eyebrow><EvidenceCounts items={qs} /></Card>
        <Card><Eyebrow className="mb-2">Fatos usados pelas regras</Eyebrow><ul className="m-0 list-none space-y-1 p-0 text-[12.5px]">{FACTS.map(x => <li key={x.key} className="flex justify-between gap-2"><span>{x.block} · {x.label}</span><b className={p.facts[x.key] === 'yes' ? 'text-green' : p.facts[x.key] === 'no' ? 'text-red' : 'text-muted'}>{TRI_LABEL[p.facts[x.key]]}</b></li>)}</ul></Card>
        <Card><Eyebrow className="mb-2">Lacunas estruturais</Eyebrow><ul className="mb-0 mt-0 space-y-1 pl-4 text-[12.5px] text-muted">{gaps(p).filter(g => g.startsWith('B02 · Reporte') || g.startsWith('B05 · Resp')).map(g => <li key={g}>{g}</li>)}</ul></Card>
      </div>
    </div>
  );
}
