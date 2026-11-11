---
name: unify-nextjs
description: This skill should be used when asked to "unify the LOOP apps", "merge apps/loop into apps/web", "migrate Vite to Next.js", "unify deployment", or "implement the LOOP unified application".
---
# Unified application workflow
Read references/UNIFIED_APP_ADR.md, root package.json, apps/web, apps/loop, design-system and docs/loop-app. Identify actual routes, schemas and tests before editing. Keep one Next.js App Router application in apps/web and one Cloudflare Worker hosting UI and initial API.

A. Inventory and decision register: list current working routes, modules, browser storage, design tokens, pending approvals and test coverage.
B. Route migration: incrementally move existing features from apps/loop; preserve directory, URL redirects, diagrams, forms and client editing. Do not delete original until verified.
C. Domain and backend: isolate business rules, D1 repositories and typed API; implement secure auth, tenant checks and persistent CRUD; use real GitHub integration only after credentials/permissions and contracts are approved.
D. Integrate: remove production reliance on IndexedDB/mocks; label demo mode.
E. Verify: npm tests, end-to-end flows, auth isolation, second-device persistence, OpenNext build artifact, CI evidence.
F. Release: draft PR and deployment plan; do not merge or deploy without approval. Update ADR, README and docs/deployment/DEPLOY_MEMORY.md with commands and verified outcomes.
If docs/loop-app/BACKEND_ARQUITETURA.md still proposes an independent worker, mark it as pending conflict with the user-approved single-Worker target, and document exception decision before any split.
