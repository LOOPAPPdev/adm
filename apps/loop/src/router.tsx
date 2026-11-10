import { createHashRouter, Navigate } from 'react-router';
import { AppShell } from './components/shell/AppShell';
import { Gate } from './components/shell/Gate';
import { Home } from './pages/site/Home';
import { Solucoes } from './pages/site/Solucoes';
import { Contato } from './pages/site/Contato';
import { Dashboard } from './pages/workspace/Dashboard';
import { Projetos } from './pages/workspace/Projetos';
import { ProjectLayout } from './pages/workspace/ProjectLayout';
import { Overview } from './pages/workspace/Overview';
import { Verificacao } from './pages/workspace/Verificacao';
import { NotFound } from './pages/NotFound';

/** Hash routing keeps deep links working on any static host (Cloudflare Pages, sub-paths, file previews). */
export const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Home /> },
      { path: 'metodo', lazy: () => import('./pages/site/Metodo').then(m => ({ Component: m.Metodo })) },
      { path: 'solucoes', element: <Solucoes /> },
      { path: 'demonstracao', lazy: () => import('./pages/site/Demonstracao').then(m => ({ Component: () => <Gate><m.Demonstracao /></Gate> })) },
      { path: 'contato', element: <Gate><Contato /></Gate> },
      { path: 'app', element: <Gate><Dashboard /></Gate> },
      { path: 'app/projetos', element: <Gate><Projetos /></Gate> },
      {
        path: 'app/projetos/:id', element: <Gate><ProjectLayout /></Gate>,
        children: [
          { index: true, element: <Overview /> },
          { path: 'consultoria', lazy: () => import('./pages/workspace/Consultoria').then(m => ({ Component: m.Consultoria })) },
          { path: 'descoberta', lazy: () => import('./pages/studio/Descoberta').then(m => ({ Component: m.Descoberta })) },
          { path: 'organograma', lazy: () => import('./pages/studio/Organograma').then(m => ({ Component: m.Organograma })) },
          { path: 'processos', lazy: () => import('./pages/studio/Processos').then(m => ({ Component: m.Processos })) },
          { path: 'oportunidades', lazy: () => import('./pages/studio/Oportunidades').then(m => ({ Component: m.Oportunidades })) },
          { path: 'cenarios', lazy: () => import('./pages/studio/Cenarios').then(m => ({ Component: m.Cenarios })) },
          { path: 'apresentacao', lazy: () => import('./pages/studio/Apresentacao').then(m => ({ Component: m.Apresentacao })) },
          { path: 'sistemas', lazy: () => import('./pages/studio/Sistemas').then(m => ({ Component: m.Sistemas })) },
          { path: 'evidencias', lazy: () => import('./pages/studio/Evidencias').then(m => ({ Component: m.Evidencias })) },
          { path: 'entregaveis', lazy: () => import('./pages/workspace/Entregaveis').then(m => ({ Component: m.Entregaveis })) }
        ]
      },
      { path: 'portal', element: <Navigate to="/portal/demo" replace /> },
      { path: 'portal/:id', lazy: () => import('./pages/portal/Portal').then(m => ({ Component: () => <Gate><m.Portal /></Gate> })) },
      { path: 'configuracoes', lazy: () => import('./pages/workspace/Configuracoes').then(m => ({ Component: () => <Gate><m.Configuracoes /></Gate> })) },
      { path: 'verificacao', element: <Verificacao /> },
      { path: '*', element: <NotFound /> }
    ]
  }
]);
