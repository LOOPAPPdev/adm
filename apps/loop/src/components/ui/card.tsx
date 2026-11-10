import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Card = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('min-w-0 rounded-[var(--radius-card)] border border-stroke bg-paper p-5 shadow-card', className)} {...p} />
);
export const CardTitle = ({ className, ...p }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('m-0 text-[15px] font-bold', className)} {...p} />;
export const Eyebrow = ({ className, ...p }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('eyebrow m-0', className)} {...p} />;
export const Muted = ({ className, ...p }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('m-0 text-[13px] leading-relaxed text-muted', className)} {...p} />;
