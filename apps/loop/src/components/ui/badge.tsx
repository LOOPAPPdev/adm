import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import type { EvidenceStatus } from '@/domain/schema';
import { STATUS_LABEL } from '@/domain/model';

export const badgeVariants = cva('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.06em] whitespace-nowrap', {
  variants: {
    tone: {
      neutral: 'border border-stroke bg-soft text-ink',
      dashed: 'border border-dashed border-line-strong bg-paper text-muted',
      red: 'border border-red-line bg-red-soft text-red',
      blue: 'border border-blue-line bg-blue-soft text-blue',
      purple: 'border border-purple-line bg-purple-soft text-purple',
      green: 'border border-green-line bg-green-soft text-green'
    }
  },
  defaultVariants: { tone: 'neutral' }
});
export type Tone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

export const Badge = ({ className, tone, ...p }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) => (
  <span className={cn(badgeVariants({ tone }), className)} {...p} />
);

export const STATUS_TONE: Record<EvidenceStatus, Tone> = { unknown: 'dashed', informed: 'neutral', hypothesis: 'purple', restricted: 'red', confirmed: 'green' };
export const StatusBadge = ({ status, className }: { status: EvidenceStatus; className?: string }) => (
  <Badge tone={STATUS_TONE[status]} className={cn('normal-case tracking-normal text-[11px]', className)}>{STATUS_LABEL[status]}</Badge>
);
