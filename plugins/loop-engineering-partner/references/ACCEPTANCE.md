# Acceptance scenarios for the unified application (future implementation)

## Routes and migration
GIVEN the current ADM Directory and LOOP Vite app exist, WHEN the modules are migrated into apps/web, THEN all approved Directory functions and LOOP forms, edits, diagrams, filters and navigation still work under Next.js routes.

## Durable cross-device state
GIVEN an authenticated actor with project access, WHEN a diagram is edited and saved in one session, THEN the same authorized state is readable after signing in on a second device.

## Tenant isolation
GIVEN an authenticated user from organization A, WHEN that user requests a private project of organization B, THEN the API denies it without revealing the resource's content.

## Versioning
GIVEN a diagram revision is current, WHEN an outdated client attempts to overwrite it, THEN the server returns a concurrency conflict and preserves the saved version.

## Single deploy
GIVEN a complete valid Cloudflare configuration and dependencies, WHEN the OpenNext production build finishes, THEN apps/web/.open-next/worker.js exists and only the approved Worker is deployed after authorization.

## Evidence
Record actual test command, environment, date, pass/fail, and stdout excerpt in PR and deployment memory. These are acceptance tests, NOT claims that they have passed.
