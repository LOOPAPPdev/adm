import type { ReactNode } from 'react';
import { useLoop } from '@/store/loop-store';

/** Waits for the local repository to load before rendering data-bound pages. */
export function Gate({ children }: { children: ReactNode }) {
  const ready = useLoop(s => s.ready);
  return ready ? <>{children}</> : <p role="status" className="py-16 text-center text-muted">Carregando dados locais…</p>;
}
