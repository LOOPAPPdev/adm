---
name: backend-contracts
description: This skill should be used for "implement authentication", "create API routes", "design D1 schema", "multi-tenant security", "persist project data", "GitHub integration" and backend design.
---
# Backend execution
Examine actual project documents and code. Do not implement a proposal as if approved. Write domain contracts independent of Next.js, then server-side adapters and route handlers. Validate all inputs and output schemas. Check actor/organization membership server-side on every command and query. Use per-tenant keys and indexes; enforce explicit authorization and optimistic concurrency for editable diagrams. Record auditable mutations.
Before changing migrations or authenticators, record secrets/bindings and security threat scenarios. Never log tokens or persist them in Git. Do not simulate identity or external execution.
Use tests: unauthenticated is 401, authenticated cross-tenant is denied, stale version is rejected, approved edits are durable and readable after session renewal. Documentation and implementation must agree.
