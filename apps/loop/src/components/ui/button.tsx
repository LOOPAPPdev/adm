import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-[10px] font-bold no-underline transition-colors disabled:opacity-45 whitespace-nowrap',
  {
    variants: {
      variant: {
        primary: 'bg-ink text-white hover:bg-ink-hover hover:text-white',
        outline: 'border border-stroke bg-paper text-ink hover:border-line-strong hover:text-ink',
        ghost: 'bg-transparent text-ink hover:bg-soft hover:text-ink',
        danger: 'border border-alert-line bg-alert-soft text-alert hover:bg-alert-line hover:text-alert',
        success: 'border border-green-line bg-green-soft text-green hover:bg-green-hover hover:text-green'
      },
      size: { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-[13px]', lg: 'h-11 px-5 text-sm', icon: 'h-9 w-9' }
    },
    defaultVariants: { variant: 'outline', size: 'md' }
  }
);
type V = VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & V>(
  ({ className, variant, size, type = 'button', ...p }, ref) => <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...p} />
);
Button.displayName = 'Button';

export const ButtonLink = ({ className, variant, size, ...p }: LinkProps & V) => <Link className={cn(buttonVariants({ variant, size }), className)} {...p} />;
