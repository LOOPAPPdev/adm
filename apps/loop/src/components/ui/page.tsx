import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function PageHeader({ eyebrow, title, lead, actions, size = 'md' }: { eyebrow?: string; title: ReactNode; lead?: ReactNode; actions?: ReactNode; size?: 'md' | 'xl' }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow m-0 mb-1.5">{eyebrow}</p>}
        <h1 className={cn('m-0 font-extrabold tracking-[-0.04em]', size === 'xl' ? 'text-[clamp(34px,6vw,58px)] leading-[0.98]' : 'text-[clamp(24px,3.4vw,32px)] leading-tight')}>{title}</h1>
        {lead && <div className="mt-2.5 text-[15px] leading-relaxed text-muted">{lead}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export const Notice = ({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'red' | 'purple' | 'green'; className?: string }) => (
  <div role="note" className={cn('rounded-xl border px-4 py-3 text-[13px] leading-relaxed',
    tone === 'red' ? 'border-red-line bg-red-soft text-red-deep' : tone === 'purple' ? 'border-purple-line bg-purple-soft text-purple-deep' : tone === 'green' ? 'border-green-line bg-green-soft text-green-deep' : 'border-stroke bg-soft text-ink-soft', className)}>{children}</div>
);

export const Empty = ({ children }: { children: ReactNode }) => <div className="rounded-xl border border-dashed border-line-strong bg-paper px-5 py-8 text-center text-[13px] text-muted">{children}</div>;
