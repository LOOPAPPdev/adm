import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import type { EvidenceStatus } from '@/domain/schema';
import { STATUS_LABEL } from '@/domain/model';

// Design-system tags (.tag): pill, 12 px, tinted by role.
export const badgeVariants = cva('tag whitespace-nowrap', {
  variants: {
    tone: {
      neutral: 'tag-neutral',
      dashed: 'border border-dashed border-ds-line-strong text-ds-muted',
      red: 'tag-accent',
      blue: 'tag-outline',
      purple: 'bg-ds-violet-soft text-ds-violet',
      green: 'tag-success'
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
  <Badge tone={STATUS_TONE[status]} className={className}>{STATUS_LABEL[status]}</Badge>
);
