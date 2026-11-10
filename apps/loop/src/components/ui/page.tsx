import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

// Page header on the design-system type scale: hero or title size, weight 600, Inter.
export function PageHeader({ eyebrow, title, lead, actions, size = 'md' }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; actions?: ReactNode; size?: 'md' | 'xl' }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow m-0 mb-2">{eyebrow}</p>}
        <h1 className={cn('m-0', size === 'xl' ? 'text-[clamp(40px,7vw,var(--text-hero))] leading-[1.07]' : 'text-[clamp(28px,4vw,var(--text-title))] leading-[1.1]')}>{title}</h1>
        {lead && <div className="mt-3 text-ds-body leading-[1.47] text-ds-muted">{lead}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const TONE = {
  neutral: 'bg-ds-surface text-ds-text-soft',
  red: 'bg-ds-accent-soft text-ds-accent-strong',
  purple: 'bg-ds-violet-soft text-ds-violet-strong',
  green: 'bg-ds-success-soft text-ds-success'
} as const;
export const Notice = ({ children, tone = 'neutral', className }: { children: ReactNode; tone?: keyof typeof TONE; className?: string }) => (
  <div role="note" className={cn('rounded-ds-md px-4 py-3 text-ds-caption leading-[1.43]', TONE[tone], className)}>{children}</div>
);

export const Empty = ({ children }: { children: ReactNode }) => <div className="rounded-ds-lg border border-dashed border-ds-line-strong px-5 py-10 text-center text-ds-caption text-ds-muted">{children}</div>;
