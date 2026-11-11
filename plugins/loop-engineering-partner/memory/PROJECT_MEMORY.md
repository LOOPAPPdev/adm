# LOOP project memory — curated context for retrieval
Provenance: user-provided project direction and prior conversations, curated 2026-11-11. Historical context, not evidence that a feature is implemented. Do not include personal/private data in this public repository. Verify live code and approved ADRs before acting.

## Application architecture
Target repository: LOOPAPPdev/adm. The integration base is main, despite a different configured GitHub default branch observed on 2026-11-11. apps/web is the single Next.js App Router frontend and the initial Route Handler API. OpenNext targets one Cloudflare Worker. apps/loop is the existing Vite/React prototype and migration source. apps/orchestrator remains a registry index synchronization CLI, not a production agent runtime. Reuse design-system/. D1 is preferred for authoritative data; R2 is optional. No second production Worker without an approved exception ADR. All claims of deployment need observed evidence.

## Product modules and routing
The desired integrated modules are LOOP website/consulting, methodology, solutions, demonstration, consultant Workspace, LOOP Studio, client Portal and ADM Directory. Target routes are /, /metodo, /solucoes, /demonstracao, /app, /studio, /portal, /directory and /api/v1/*. Existing paths must be inspected before changes. Route migration must preserve forms, diagram editing, filters, navigation and saved state. IndexedDB and demos cannot be presented as multi-user backend persistence.

## Domain and security
The planned platform needs authentication, sessions, organizations, memberships and roles, tenant-scoped projects, models, processes, diagram elements and connections, evidence, audit trail, versioning and authorized GitHub integration. Never describe simulated authentication or agent operations as real. A previously written backend proposal describes a second Worker for queue/cron/webhooks, but that was not approved and conflicts with the latest one-Worker target.

## Deterministic LOOP operating model
LOOP is a consultancy/system modelling platform. It transforms validated methodologies into explainable systems and decision scenarios. The customer-facing analysis and simulations are intended to remain deterministic, reproducible, versioned and evidence-linked. Generative AI is used to help engineer the software, not automatically to make client business decisions. Evidence classifications: declared, external source, hypothesis and unknown; distinguish these in output.

## Visual-first Canvas Workspace
The project has a shared canvas/inspector approach with a topbar, collapsible sidebars and five coordinated views: infographic, tutorial, BPMN, organization chart and complex diagram. Shared entities, IDs and links must be consistent across views. The design system is a single shared source of tokens and components. For BPMN process work, keep gates, flow, labels, inspection and accessible layouts.

## Consulting method and reusable workflows
The process patterns include Entender -> Estruturar -> Emitir -> Executar (4E), gates, clear handoff and an explicit restart/resumption point. The consulting pipeline uses E0, intermediate phases A/B/C/D and deliverable gates E1/E2/E3. CleanSea is a pilot consulting context; do not put proprietary client datasets, operational records, personal contact details or credentials in this plugin or its retrieval files. Retrieve project documents from approved sources instead.

## Engineering partner behavior
Use senior engineering pair-programming and teaching by default. For conceptual questions use Definition -> Visual difference -> Technical comparison -> Application to LOOP -> Recommendation/verification. For builds use observed architecture, plan, tests, evidence, implemented/tested/published/pending. Requirements use EARS, MUST/SHOULD/MAY, architecture uses MACRO/MESO/MICRO, verification uses Given-When-Then. Explain tradeoffs, cite file evidence and avoid unnecessary clarification. Prefer concise Portuguese.

## Plugins and roles
Senior Engineering Partner 1.28.0 supplies engineering rigor, review modes, security floor, spec/plan/TDD/verify workflow. Agent Engineering 0.3.2, agent-handoff 0.4.2, Backend Design 0.2.0, Engineering 1.2.0, Modern Web Guidance 0.0.194, AI-Firstify 1.1.0 and Plugin Management 0.2.2 are supplied reference plugins, not automatic dependencies. Their contents, hooks and licenses must be reviewed before reuse. Expo and Prisma MCP are out of scope for initial web consolidation.

## Approval and evidence boundaries
Do not force-push, delete, merge, deploy, apply production migrations or install unreviewed third-party hooks without authorization. Test and report gates. The pending BACKEND_ARQUITETURA proposal does not grant authority to deploy another Worker. Source of truth is the current Git tree and approved ADRs. Historical context may explain intent but must not overwrite verified implementation facts.
