import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { useLoop } from '@/store/loop-store';
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

export function AppShell() {
  const { pathname } = useLocation();
  const area = areaOf(pathname);
  const { toast, savedAt, saveError, repo } = useLoop();
  const reduce = useReducedMotion();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { document.title = `LOOP · ${area.word.charAt(0) + area.word.slice(1).toLowerCase()}`; }, [area.word]);

  return (
    <div className="mx-auto max-w-[1550px] px-4 pb-14 pt-5 sm:px-6">
      <a href="#conteudo" className="sr-only focus:not-sr-only">Ir para o conteúdo</a>
      <header className="mb-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border-b border-stroke pb-4">
        <Link to="/" className="text-sm font-extrabold tracking-[0.1em] text-ink no-underline">LOOP <b className="text-red">/</b> {area.word}</Link>
        <nav aria-label="Principal" className="-mx-1 flex max-w-full gap-1 overflow-x-auto rounded-xl bg-soft p-1">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => cn('whitespace-nowrap rounded-[9px] px-3 py-1.5 text-xs font-semibold no-underline',
                isActive || (n.to === '/app/projetos' && /^\/(app\/projetos\/|portal\/)/.test(pathname)) ? 'bg-paper text-ink shadow-[0_1px_5px_#0001]' : 'text-ink-soft hover:text-ink')}>{n.label}</NavLink>
          ))}
        </nav>
        <span className="hidden text-[11px] font-semibold tracking-[0.07em] text-muted lg:inline">{area.stamp}</span>
      </header>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3.5 gap-y-1 text-xs text-muted">
        <span><b className="text-red-deep">MODO DEMO</b> · dados só neste navegador · sem backend, sem autenticação, sem envio de mensagens, sem IA em execução</span>
        <span aria-live="polite">{saveError ? 'Falha ao salvar no armazenamento local.' : savedAt ? `Salvo localmente às ${savedAt}${repo?.kind === 'memory' ? ' (memória da aba)' : ''}` : 'Alterações são salvas automaticamente neste navegador.'}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.main id="conteudo" key={pathname.split('/').slice(0, 4).join('/')} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.18 }}>
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-stroke pt-5 text-xs text-muted">
        <span>LOOP · protótipo de front-end · estados e aprovações são locais e demonstrativos.</span>
        <span className="flex gap-3"><Link to="/verificacao">Verificações</Link><Link to="/configuracoes">Configurações</Link><Link to="/contato">Contato</Link></span>
      </footer>
      <AnimatePresence>
        {toast && (
          <motion.div role="status" aria-live="polite" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-5 left-1/2 z-50 max-w-[92vw] -translate-x-1/2 rounded-xl bg-ink px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">{toast}</motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
