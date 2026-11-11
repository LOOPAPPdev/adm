# ADR — LOOP unified application, engineering target

Status: **user direction, not production implementation evidence**
Repository: LOOPAPPdev/adm | integration base: main | main app: apps/web

## Decision
Unify website, consulting, Workspace, Studio, Portal and ADM Directory in a Next.js App Router app at apps/web. Publish frontend plus initial Next.js Route Handler backend as **one Cloudflare Worker** using OpenNext. Reuse design-system/. Keep apps/loop until full migration passes acceptance; keep apps/orchestrator as registry sync/index tool.

Target routes: /, /metodo, /solucoes, /demonstracao, /app, /studio, /portal, /directory, /api/v1/*.
These are proposed routes, not proof of existing behavior; inspect current route tree and avoid breaking live paths.

Backend boundaries: UI -> domain services -> D1 repositories -> Cloudflare infrastructure. Authentication, sessions, organizations, memberships/roles, projects, processes, nodes/links, document/evidence metadata, audit log and permitted GitHub integration require real server-side implementation. R2 is optional and contingent on requirements.

Data: D1 is preferred, subject to ADR and schema review. Client IndexedDB cannot be the multi-device authoritative store. Use versioned migrations and tests for tenant isolation, durable edits and concurrency.

Security: no tenant read/write without server-side membership checks; secrets through Cloudflare bindings; no exposed tokens; no fake auth, GitHub calls, AI execution or BPMN processing represented as production services.

Build: inspect actual installed scripts for OpenNext/Wrangler. Check generated .open-next/worker.js, target compatibility and CI before any deployment. Do not rely on the listed commands until tested.

## Explicit architecture conflict
docs/loop-app/BACKEND_ARQUITETURA.md (2026-11-10) is a *proposal for approval* and currently describes a separate apps/worker for webhooks, queues and cron. This conflicts with the later explicit single-Worker target. Treat the later user constraint as the goal. Before implementing jobs that cannot run as request handlers, prepare a separate ADR with technical evidence and user authorization; do not silently create another Worker.

## Gates
A Audit -> B Next.js migration -> C Domain/API/D1/Auth -> D Real integration -> E Build, test and draft PR -> Release only after approval.
Acceptance examples: authenticated same-project reads across devices; unprivileged cross-tenant reads are denied; diagram edits survive reload; OpenNext artifact exists; all mapped routes work. Record test evidence and limitations.
