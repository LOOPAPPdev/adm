import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';

// Design-system segmented control (.seg / .seg-opt), used for tabs and in-page navigation.
export function Segmented<T extends string>({ value, options, onChange, label, className }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <div role="tablist" aria-label={label} className={cn('seg max-w-full flex-wrap', className)}>
      {options.map(o => (
        <button key={o.value} role="tab" aria-selected={value === o.value} className="seg-opt" onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function NavTabs({ items, label, className }: { items: { to: string; label: string; end?: boolean }[]; label: string; className?: string }) {
  return (
    <nav aria-label={label} className={cn('seg max-w-full overflow-x-auto', className)}>
      {items.map(i => <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => cn('seg-opt', isActive && 'is-on')}>{i.label}</NavLink>)}
    </nav>
  );
}
