import { EVIDENCE, type EvidenceStatus } from '@/domain/schema';
import { STATUS_LABEL } from '@/domain/model';
import { badgeVariants, STATUS_TONE } from './ui/badge';
import { cn } from '@/lib/cn';

export function EvidenceCounts({ items }: { items: { effective: EvidenceStatus }[] }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {EVIDENCE.map(k => (
        <li key={k} className={cn(badgeVariants({ tone: STATUS_TONE[k] }), 'text-[11px] normal-case tracking-normal')}>{items.filter(q => q.effective === k).length} · {STATUS_LABEL[k]}</li>
      ))}
    </ul>
  );
}
