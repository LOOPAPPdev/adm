# Unificação LOOP · auditoria (Fase A) e mapa de migração

Data: 2026-11-11 · Base: `main` em `85679b6` · Resultado: ADR-0002

## 1. Inventário antes da unificação

| Parte | Stack | Rotas | Dados | Testes | Deploy |
|---|---|---|---|---|---|
| `apps/web` | Next.js 16.0.7, React 19.2.1, Tailwind 4, OpenNext 1.14 | `/` (ADM Directory) | JSON estático gerado pelo orquestrador | nenhum próprio | Worker `next-starter-template`, sem bindings |
| `apps/loop` | Vite 8, React 19.3.1, react-router 8 (hash), Zustand, Dexie, Zod, React Flow, ELK, bpmn-js, Motion, Recharts | 22 rotas com `#/` | IndexedDB (Dexie) ou memória | Vitest 34, Playwright 15 | `wrangler pages deploy` (segundo deploy) |
| Backend | — | — | — | — | — |
| `apps/orchestrator` | Node ESM, sem dependências | — | `storage/` | 11 | não é serviço |
| `design-system/` | CSS tokens + componentes | — | — | — | — |

**Incompatibilidades encontradas:** roteamento por hash × App Router; `src/pages` colidiria com o Pages Router do Next; duas versões de React; tokens Tailwind `ds-*` declarados em dois arquivos; `HttpProjectRepository` era só contrato; `npm audit` com 5 vulnerabilidades (glob/minimatch via OpenNext) e Next 16.0.7 desatualizado.

**Reaproveitável sem mudança:** domínio (`schema.ts`, `model.ts`, `bpmn.ts`, `causal.ts`), dados JSON, porta `ProjectRepository`, componentes de UI e diagramas, store Zustand.

## 2. Mapa de migração (`git mv`, histórico preservado)

| Antes (`apps/loop/`) | Depois (`apps/web/`) | Observação |
|---|---|---|
| `src/domain/*` | `src/domain/*` | sem mudança de código |
| `src/data/*.json` | `src/data/*.json` | junto com `registry.json` e `sources.json` do Directory |
| `src/ports/*` | `src/ports/*` | `HttpProjectRepository` agora real |
| `src/store/loop-store.ts` | `src/store/loop-store.ts` | modos conectado/demonstração, sessão, organização ativa |
| `src/components/**` | `src/components/**` | `AppShell` recebe `children` em vez de `<Outlet/>` |
| `src/lib/*` | `src/lib/*` | novo `lib/router.tsx` (adaptador react-router → Next) |
| `src/pages/**` | `src/screens/**` | renomeado para não ativar o Pages Router |
| `src/router.tsx`, `src/main.tsx`, `index.html`, `vite.config.ts` | `src/app/(loop)/**/page.tsx`, `layout.tsx` | uma página Next por rota |
| `src/styles.css` | `src/app/globals.css` + `src/app/loop.css` | tokens unidos; estilos do React Flow só nas áreas LOOP |
| `e2e/*`, `playwright.config.ts` | `e2e/*`, `playwright.config.ts` | caminhos reais; novo `connected.spec.ts` |
| `models/*` | `models/*` | sem mudança |
| `README.md`, `RELATORIO.md` | `docs/loop-app/README_LOOP_V1_VITE.md`, `RELATORIO_LOOP_V1.md` | histórico da v1.0 |
| `public/_headers`, `_redirects`, `scripts/zip.mjs` | removidos | específicos do Cloudflare Pages/Vite |

## 3. Rotas

| Rota | Função | Antes |
|---|---|---|
| `/` | Website LOOP Consulting | `#/` (o Directory saiu de `/`) |
| `/metodo`, `/solucoes`, `/demonstracao`, `/contato` | Site | `#/...` |
| `/app`, `/app/projetos`, `/app/projetos/[id]/...` | Workspace e módulos do projeto | `#/app/...` |
| `/studio` | Entrada do LOOP Studio (escolhe projeto e módulo) | novo |
| `/portal`, `/portal/[id]` | Portal do cliente | `#/portal/...` |
| `/configuracoes`, `/verificacao` | Workspace | `#/...` |
| `/entrar` | Login | novo |
| `/directory` | ADM Directory | era `/` |
| `/api/v1/*` | Backend | novo |

Links antigos com `#/` são redirecionados no navegador para o caminho real.

## 4. Funcionalidades preservadas (evidência)

Os 14 caminhos de aceite do Playwright da v1.0 passam sem mudança de comportamento (só a forma da URL e um rótulo do portal mudaram), mais o teste de responsividade em 9 rotas. Os 34 testes de domínio passam sem alteração; o teste que exigia "HTTP falha explicitamente" foi substituído por testes do adaptador real.

## 5. Requisitos ainda não implementados

Ver a tabela "O que não foi implementado" no ADR-0002 e os itens TD/SI/CM em `PERGUNTAS_ABERTAS.md`.
