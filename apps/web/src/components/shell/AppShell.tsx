'use client';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link, NavLink, useLocation } from '@/lib/router';
import { useEffect, type ReactNode } from 'react';
import { useLoop } from '@/store/loop-store';
import { SessionBar } from './SessionBar';
import { cn } from '@/lib/cn';

const NAV = [
  { to: '/', label: 'Home', end: true }, { to: '/metodo', label: 'Método' }, { to: '/solucoes', label: 'Soluções' },
  { to: '/demonstracao', label: 'Demonstração' }, { to: '/contato', label: 'Contato' }, { to: '/app', label: 'Workspace', end: true }, { to: '/app/projetos', label: 'Projetos' }
];
const STUDIO = ['descoberta', 'organograma', 'processos', 'oportunidades', 'cenarios', 'apresentacao', 'sistemas', 'evidencias'];

export function areaOf(path: string): { word: string; stamp: string } {
  const seg = path.split('/').filter(Boolean);
  if (seg[0] === 'portal') return { word: 'PORTAL', stamp: 'PORTAL · CLIENTE · V1.0' };
  if (seg[0] === 'app' && STUDIO.includes(seg[3] ?? '')) return { word: 'STUDIO', stamp: 'STUDIO · PROTÓTIPO · V1.0' };
  if (seg[0] === 'app' || seg[0] === 'configuracoes' || seg[0] === 'verificacao') return { word: 'OPERATIONS', stamp: 'WORKSPACE · CONSULTOR · V1.0' };
  return { word: 'CONSULTING', stamp: 'SITE · CONSULTORIA · V1.0' };
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const area = areaOf(pathname);
  const toast = useLoop(st => st.toast);
  const reduce = useReducedMotion();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { document.title = `LOOP · ${area.word.charAt(0) + area.word.slice(1).toLowerCase()}`; }, [area.word]);

  return (
    <div className="min-h-screen bg-ds-bg">
      <a href="#conteudo" className="sr-only focus:not-sr-only">Ir para o conteúdo</a>
      {/* Design-system navigation bar (.nav): sticky, translucent, hairline divider */}
      <header className="nav gap-4 overflow-x-auto px-4 sm:px-6">
        <Link to="/" className="nav-brand shrink-0 no-underline">LOOP <span className="text-ds-muted">· {area.word.charAt(0) + area.word.slice(1).toLowerCase()}</span></Link>
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) => cn('shrink-0', (isActive || (n.to === '/app/projetos' && /^\/(app\/projetos\/|portal\/)/.test(pathname))) && 'is-on')}>{n.label}</NavLink>
        ))}
      </header>
      <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-6 sm:px-6">
        <SessionBar />
        <AnimatePresence mode="wait">
          <motion.main id="conteudo" key={pathname.split('/').slice(0, 4).join('/')} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.18 }}>
            {children}
          </motion.main>
        </AnimatePresence>
        <footer className="mt-16 flex flex-wrap justify-between gap-3 border-t border-ds-line pt-6 text-ds-micro text-ds-muted">
          <span>LOOP · <span className="eyebrow">{area.stamp}</span></span>
          <span className="flex gap-4"><Link to="/directory">Directory</Link><Link to="/entrar">Entrar</Link><Link to="/verificacao">Verificações</Link><Link to="/configuracoes">Configurações</Link><Link to="/contato">Contato</Link></span>
        </footer>
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div role="status" aria-live="polite" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 z-50 max-w-[92vw] -translate-x-1/2 rounded-ds-pill bg-ds-text px-5 py-2.5 text-ds-caption text-ds-bg elev-lg">{toast}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
