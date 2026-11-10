import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';

const wrap = 'flex flex-wrap gap-1 rounded-xl bg-[#ededed] p-1';
const item = (on: boolean) => cn('rounded-[9px] px-3 py-1.5 text-xs font-semibold no-underline whitespace-nowrap transition-colors', on ? 'bg-paper text-ink shadow-[0_1px_5px_#0001]' : 'bg-transparent text-[#555] hover:text-ink');

export function Segmented<T extends string>({ value, options, onChange, label, className }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <div role="tablist" aria-label={label} className={cn(wrap, className)}>
      {options.map(o => (
        <button key={o.value} role="tab" aria-selected={value === o.value} className={item(value === o.value)} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function NavTabs({ items, label, className }: { items: { to: string; label: string; end?: boolean }[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn(wrap, 'overflow-x-auto', className)}>
      {items.map(i => <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => item(isActive)}>{i.label}</NavLink>)}
    </nav>
  );
}
