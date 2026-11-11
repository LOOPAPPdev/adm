import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from '@/lib/router';
import { cn } from '@/lib/cn';

// Design-system buttons (.btn): pill shape, Inter, accent blue for the main action.
export const buttonVariants = cva('btn whitespace-nowrap', {
  variants: {
    variant: {
      primary: 'btn-primary',
      outline: 'btn-secondary',
      ghost: 'btn-ghost',
      danger: 'border-ds-danger text-ds-danger hover:bg-ds-danger-soft',
      success: 'border-ds-success text-ds-success hover:bg-ds-success-soft'
    },
    size: { sm: 'btn-sm', md: '', lg: 'px-6 py-3', icon: 'btn-icon' }
  },
  defaultVariants: { variant: 'outline', size: 'md' }
});
type V = VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & V>(
  ({ className, variant, size, type = 'button', ...p }, ref) => <button ref={ref} type={type} className={cn(buttonVariants({ variant, size }), className)} {...p} />
);
Button.displayName = 'Button';

export const ButtonLink = ({ className, variant, size, ...p }: LinkProps & V) => <Link className={cn(buttonVariants({ variant, size }), className)} {...p} />;
