import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

// Design-system cards (.card): surface grey on the white page, 18 px radius, no border.
export const Card = ({ className, ...p }: HTMLAttributes<HTMLDivElement>) => <div className={cn('card min-w-0 gap-3 p-5', className)} {...p} />;
export const CardTitle = ({ className, ...p }: HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn('card-title m-0', className)} {...p} />;
export const Eyebrow = ({ className, ...p }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('eyebrow m-0', className)} {...p} />;
export const Muted = ({ className, ...p }: HTMLAttributes<HTMLParagraphElement>) => <p className={cn('card-body m-0', className)} {...p} />;
