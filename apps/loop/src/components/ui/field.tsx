import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const base = 'w-full rounded-[10px] border border-stroke bg-paper px-3 text-[13px] text-ink placeholder:text-line-strong focus:border-line-strong focus:outline-none aria-[invalid=true]:border-red';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => <input ref={ref} className={cn(base, 'h-10', className)} {...p} />);
Input.displayName = 'Input';
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => <textarea ref={ref} className={cn(base, 'min-h-[76px] py-2 leading-relaxed', className)} {...p} />);
Textarea.displayName = 'Textarea';
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...p }, ref) => <select ref={ref} className={cn(base, 'h-10 pr-8', className)} {...p} />);
Select.displayName = 'Select';
export const Label = ({ className, ...p }: LabelHTMLAttributes<HTMLLabelElement>) => <label className={cn('mb-1 block text-xs font-bold text-ink', className)} {...p} />;
export const FieldError = ({ msg, id }: { msg?: string; id?: string }) => (msg ? <p id={id} role="alert" className="mt-1 text-xs font-semibold text-red">{msg}</p> : null);
