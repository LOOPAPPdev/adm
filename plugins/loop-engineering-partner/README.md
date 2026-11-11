# LOOP Engineering Partner — Claude Code plugin

Version 0.1.0 | Source: LOOPAPPdev/adm | Scope: engineering assistance, not a commercial AI backend.

## Purpose
A teaching-first senior engineering partner for migrating apps/loop into apps/web with one Next.js application, real backend APIs and a single Cloudflare Workers deployment. Uses the discipline of the supplied Senior Engineering Partner v1.28.0 and modular patterns from the provided Plugin Management v0.2.2 create-cowork-plugin skill. This is an original project-specific configuration; other third-party plugin code was not copied or executed.

## Included
- **Lead agent:** senior-engineering-partner.
- **Five specialist subagents:** repository-auditor, nextjs-migration-engineer, backend-security-engineer, cloudflare-delivery-engineer and verification-reviewer.
- **Six skills:** /loop-partner, /unify-nextjs, /backend-contracts, /teach-architecture, /memory-search, /verify-delivery.
- **One read-only MCP server:** loop-project-memory exposes memory_search for retrieval from memory/*.md. No token, database, HTTP requests, hooks or external telemetry.
- **Reference contracts:** response schema, unified-app ADR and curated project memory.
- **Validation:** Node test files and a GitHub Actions workflow.

## Install and run
Use a recent Claude Code with plugin-directory support. From the repository root, a common local-development invocation is:
    claude --plugin-dir ./plugins/loop-engineering-partner

Confirm this CLI flag with your installed version of 'claude --help'; Claude Code was unavailable in the authoring environment, so live activation in the app is not verified. If using a managed plugin installation, install this directory using the supported plugin workflow of your Claude Code version.

To search memory directly:
    node plugins/loop-engineering-partner/scripts/memory-search.mjs search "Cloudflare arquitetura" --limit 5

To validate this package:
    node plugins/loop-engineering-partner/scripts/validate.mjs
    node --test plugins/loop-engineering-partner/test/*.test.mjs

The main Claude Code session should invoke /loop-partner and dispatch subagents as needed. Agent-in-agent delegation must not be assumed; the lead agent can act as a specialist, while the main session owns coordination.

## Memory and authority
Memory is a curated **public-safe historical summary**, not an automatic mirror of the user's private account. The MCP server performs deterministic lexical section ranking, **not** semantic/vector search. It returns snippets with path and line range. The senior partner must verify memory claims against repository code and approved docs. Do not place secrets, client data or personal/sensitive facts into public memory files.

## Architecture and lifecycle
This plugin does not itself implement authentication, D1, R2, Next.js migration or deployment. It directs the coding workflow and gates. The existing apps/orchestrator remains the registry sync CLI. Source of truth is the current monorepo code, not this README.

An older backend document proposes a separate Worker for jobs. The latest user requirement is one Worker. Any incompatible webhook, queue or cron implementation requires a reviewed ADR and explicit approval.

## Plugin-source review
Reviewed package structures from uploaded Senior Engineering Partner 1.28.0 (Apache-2.0), Backend Design 0.2.0, agent-handoff 0.4.2, Agent Engineering 0.3.2, Engineering 1.2.0, Modern Web Guidance 0.0.194, AI-Firstify 1.1.0, Plugin Management 0.2.2, Prisma v1 and Expo 1.12.5. No copied hooks or executable third-party scripts were installed. Expo and Prisma MCP are not required for this Next.js scope. A live lookup of the latest official Claude Code documentation was unavailable; verify the plugin and CLI against it before production use.

## Guardrails
Preserve existing code. No forced pushes, production migrations, deployments, merges or handling of secrets without separate authorization. Report Implementado, Testado, Publicado and Pendente explicitly.
