# @adm/web · LOOP unified application

Next.js App Router on Cloudflare Workers (OpenNext). One Worker serves:

| Area | Routes |
|---|---|
| Website LOOP Consulting | `/`, `/metodo`, `/solucoes`, `/demonstracao`, `/contato` |
| Workspace do Consultor | `/app`, `/app/projetos`, `/app/projetos/[id]/…`, `/configuracoes`, `/verificacao` |
| LOOP Studio | `/studio`, `/app/projetos/[id]/{descoberta,organograma,processos,oportunidades,cenarios,sistemas,evidencias,apresentacao}` |
| Portal do Cliente | `/portal/[id]` |
| ADM Directory | `/directory` |
| Login | `/entrar` |
| API | `/api/v1/*` (health, auth, orgs, projects, history, contact) |

## Code map

```
src/app/            routes (App Router); (loop)/ = site, Workspace, Studio, Portal; api/v1/ = Route Handlers
src/screens/        LOOP screens (client components)
src/components/     UI, diagrams, shell
src/domain/         LOOP domain: Zod schema, rules, BPMN, causal map (no UI, no I/O) — shared by UI and server
src/ports/          ProjectRepository + adapters: Http (server), Dexie/Memory (demo mode)
src/store/          Zustand store (connected vs demo mode)
src/server/         backend: domain (roles, errors) · data (SQL) · services · infra (D1, crypto) · http
migrations/         D1 SQL migrations
e2e/                Playwright: acceptance, responsive, connected (real Worker)
```

## Commands

Run from the repository root (`npm install` once):

| Command | What it does |
|---|---|
| `npm run dev -w @adm/web` | Next dev server |
| `npm test -w @adm/web` | Vitest: domain + backend (real migrations on node:sqlite) |
| `npm run typecheck -w @adm/web` | TypeScript |
| `npm run build -w @adm/web` | Next production build |
| `npm run cf-build -w @adm/web` | OpenNext build → `.open-next/worker.js` |
| `npm run e2e -w @adm/web` | Playwright (needs both builds and local D1, see below) |

Local D1 for `wrangler dev` and the connected E2E:

```bash
printf 'BOOTSTRAP_TOKEN=local-only\n' > .dev.vars && npx wrangler d1 migrations apply loop-db --local
```

Deploy and production setup: [`docs/deployment/DEPLOY_MEMORY.md`](../../docs/deployment/DEPLOY_MEMORY.md). Architecture decision: [`docs/loop-app/ADR-0002-aplicacao-unificada.md`](../../docs/loop-app/ADR-0002-aplicacao-unificada.md).
