# CLAUDE.md — @adm/orchestrator

Scope: this file applies to `apps/orchestrator`. It adds to the root `README.md`. If a rule here conflicts with a user request, ask once, then follow the user.

---

## PART 1 — PROJECT CONTEXT

### 1.1 Mission (MACRO)

The orchestrator MUST build and maintain the unified registry of Skills, Agents, Plugins, MCP Servers and Workflows.
The first scope is the Anthropic Directory only.
The Git repository MUST store the searchable index. It MUST NOT store source mirrors.

### 1.2 Stack

| Layer | Choice | Note |
|---|---|---|
| Runtime | Node.js ≥ 20 (tested on 22), ESM (`"type": "module"`) | No build step |
| Language | Plain JavaScript (`.mjs`) with JSDoc types | Types live in `src/schema.mjs` |
| Dependencies | None at runtime | MUST stay at zero unless a decision record allows one |
| Fetch | `git` CLI, shallow clone, `execFile` without a shell | Hooks disabled |
| Tests | `node:test`, `node:assert/strict` | Run: `npm test` |
| Data | JSON files under `storage/` | Source of truth for the web app |
| Monorepo | npm workspaces (`apps/*`) | Root `package.json` |
| Consumer | `apps/web` (Next.js 16, React 19, Tailwind 4, OpenNext on Cloudflare Workers) | Reads `apps/web/src/data/registry.json` |
| Automation | GitHub Actions: `ci.yml`, `sync-registry.yml` | Daily sync, manual run allowed |

### 1.3 Layout (MESO)

```
apps/orchestrator/
  src/cli.mjs                    commands: sync, list, mirror
  src/pipeline.mjs               normalize, dedupe, index, publish
  src/fetch.mjs                  shallow clone, incremental fetch, retry
  src/schema.mjs                 RegistryResource model and validation
  src/report.mjs                 storage/reports/import-report.md
  src/util.mjs                   hash, retry, frontmatter, license detection
  src/adapters/<source>.mjs      one adapter per source
  src/adapters/index.mjs         adapter registry
  test/*.test.mjs                unit and pipeline tests (fixtures in helpers.mjs)
registry/sources.json            source inventory (method, limitation)
storage/indexes/                 registry.json, sync-state.json   (committed)
storage/reports/                 import-report.md                 (committed)
storage/checkouts|mirrors|logs/  (ignored by Git)
```

### 1.4 Pipeline

```
DISCOVER → FETCH → VALIDATE → NORMALIZE → DEDUPLICATE → INDEX → PUBLISH
```

- Each source MUST fail alone. One failure MUST NOT remove data of other sources.
- The pipeline MUST be idempotent. A second run on unchanged sources MUST NOT change `registry.json`.
- The pipeline MUST NOT delete an indexed resource. It MUST mark it `status: "error"` with `missingSince`.
- A resource merged by deduplication MUST be listed in `aliases`. It is not "removed".

### 1.5 Commands

```bash
npm install                                       # from repo root
npm run sync                                      # all enabled sources
npm run orchestrator -- sync --source <id>        # one source
npm run orchestrator -- sync --offline <id>=<dir> # local directory, no network
npm run orchestrator -- list --type skill
npm run orchestrator -- mirror <resource-id>      # on-demand copy, license permitting
npm test                                          # orchestrator tests
npm run build                                     # web app build (needs a fresh registry)
```

### 1.6 Agent tooling stack (from `STACK.zip`)

Facts: the archive holds 12 plugin packages. They were inspected by listing manifests only. Nothing was installed or executed. They are third-party content: review each one (`hooks`, `.mcp.json`, scripts) before you enable it.

| Plugin (version) | Role in this project | Used at gate |
|---|---|---|
| Senior Engineering Partner (1.28.0) | Lead workflow: spec → plan → TDD → verify. Modes `REVIEW:`, `DEBUG:`, `AUDIT:`, `MVP:`. Security floor and rigor ladder | G0–G7 |
| Agent Engineering (0.3.2) | `setup-project`, `plan-change`, `verify-change`, `publish-change` | G2, G6, G7 |
| agent-handoff (0.4.2) | Plan → execute → verify with disk state and a fresh-context review | G2, G4, G6 |
| Backend Design (0.2.0) | Query, migration, idempotency, error and security reflexes (use for index and sync logic) | G2, G5 |
| Engineering (1.2.0) | `debug`, `testing-strategy`, `system-design`, `incident-response`, code review | G5, failures |
| Modern Web Guidance (0.0.194) | Current web practice for `apps/web` | G4 (web only) |
| AI-Firstify (1.1.0) | Audit of AI-first design principles | Periodic audit |
| Plugin Management (0.2.2) | Create or change plugins for this repo | On demand |
| GitHub MCP | Branches, pull requests, CI status | G7 |
| Prisma MCP | Postgres and migrations. **Not needed now:** the registry is JSON files | Out of scope |
| Expo (1.12.5) | Mobile apps. **Not needed now** | Out of scope |
| Customer Support (1.3.0) | Support triage. **Not needed now** | Out of scope |

Rules for the stack:
- A plugin MUST NOT override Part 2 or Part 5. If it conflicts, this file wins.
- Use only the plugins marked with a gate. Do not add a plugin without a recorded reason.
- A plugin MUST NOT receive secrets. MCP plugins use their own login.
- The Senior Engineering Partner defaults to Python, Bash, Apps Script and Swift. This project uses JavaScript (`.mjs`). Apply its disciplines. Ignore its language-specific tools (`ruff`, `mypy`).

### 1.7 Rigor tier

This project runs at **Tier 1 (MVP)** of the Senior Engineering Partner ladder: real users may read the index, but no private or tenant data exists.
Required at Tier 1: critical-path tests, CI with tests, locked dependencies, no secrets in Git, failure alerting, and a backup story (the index is in Git).
Promote to **Tier 2** when any of these becomes true: the registry stores user data or accounts, money changes hands, the service is multi-tenant, or a second team contributes.

---

## PART 2 — GLOBAL INSTRUCTIONS

Controlled Language · Agentic Engineering · Visual Communication

### 1. Mission

- Transform natural-language requests into functional, verified, reusable deliverables.
- Minimize human effort without sacrificing quality, safety or accuracy.
- Prioritize simplicity, modularity, autonomy and reproducibility.
- Infer intent from available context. Avoid unnecessary questions.

### 2. Controlled Language — ASD-STE100

- Use plain English, short sentences and consistent terminology.
- Prefer active voice and explicit action verbs.
- Express one action per instruction.
- Eliminate ambiguity, redundancy and unnecessary technical jargon.
- Distinguish facts, assumptions, hypotheses and recommendations.

### 3. Requirements — EARS / RFC 2119

- Convert requests into measurable, testable requirements.
- Use MUST, SHOULD and MAY to define obligations.
- Specify inputs, outputs, constraints and acceptance criteria.
- Apply WHEN–THEN and IF–THEN conditional rules.
- Ask clarification only when uncertainty materially affects outcomes.

### 4. Architecture — MACRO / MESO / MICRO

- MACRO: Define objectives, scope and expected results.
- MESO: Select workflows, Skills, agents and tools.
- MICRO: Implement, validate and deliver.
- Separate data, business logic, interfaces and infrastructure.
- Reuse existing schemas, components and design tokens.

### 5. Agent Orchestration

- Delegate independent work to specialized subagents.
- Apply inexpensive deterministic filters before advanced reasoning.
- Select models according to complexity, cost and risk.
- Integrate outputs and independently validate results.
- Preserve decision history and reusable knowledge.

### 6. Execution — Aviation Protocols

- Follow explicit procedures, checkpoints and quality gates.
- Verify prerequisites before consequential operations.
- Obtain authorization for destructive or sensitive actions.
- Detect failures, recover context, correct and retest.
- Never fabricate successful execution.

### 7. Verification — Gherkin / FMEA

- Express acceptance tests using GIVEN–WHEN–THEN.
- Validate functionality, security, accessibility and usability.
- Anticipate failure modes and prioritize risks.
- Prefer real-world evaluations over benchmark scores alone.
- Convert recurring failures into regression tests.

### Appendix — Additional Operating Rules

**A. Visual-First Explanations**

- Prefer visual explanations when they improve comprehension.
- Generate diagrams, flowcharts, SVG, HTML previews or interactive demonstrations.
- Convert complex processes into intuitive visual models.
- Show system architecture, dependencies, causal relationships and information flows.
- Use progressive disclosure: overview first, details on demand.
- Prefer working visualizations over lengthy theoretical explanations.
- Follow established design tokens and accessibility standards.
- Never replace necessary technical accuracy with attractive visuals.
- Visuals are optional. Use them only when they communicate better than text.

**B. Short Prompts, Deep Context**

- Interpret concise requests using project files and established conventions.
- Retrieve relevant instructions instead of requesting repeated explanations.
- Avoid contradictory or excessive requirements.

**C. Data-First Development**

- Treat structured data and schemas as reusable sources of truth.
- Keep core information independent of application interfaces.
- Enable multiple implementations from the same validated data.

**D. Continuous Improvement**

- Fix recurring problems at their source.
- Document reusable solutions as Skills, rules or tests.
- Preserve reproducibility across projects.

**E. Delivery Protocol**

- Provide functional artifacts and visual previews when useful.
- Explain WHAT changed, WHY and HOW it was verified.
- Separate executive communication from technical documentation.
- Report limitations, risks and outstanding work.

> **Core principle:** Minimal instructions. Maximum contextual understanding. Controlled autonomy. Visual clarity. Verified execution.

---

## PART 3 — SENIOR ENGINEERING PARTNER WORKFLOW

Use these gates for every non-trivial change. Do not skip a gate. Do not report a gate as passed without evidence.

| Gate | Action | Evidence |
|---|---|---|
| G0 Context | Read this file, `registry/sources.json`, `src/schema.mjs` and the affected adapter. | Files named in the plan |
| G1 Requirements | Write EARS requirements for the change (Part 4 shows the form). | List in the PR description |
| G2 Plan | State MACRO goal, MESO modules, MICRO steps. List risks (FMEA). | Short plan before coding |
| G3 Authorization | Ask the user before any destructive or outward action: force push, deleting indexed data, new dependency, new network host, deploy. | User reply |
| G4 Build | Make the smallest change. Reuse existing modules. | Diff |
| G5 Test | Add a GIVEN–WHEN–THEN test first for each new rule. Run `npm test`. | Test output |
| G6 Integrate | Run `sync` (offline fixture or real). Run `npm run build`. Confirm the second `sync` reports "sem mudanças". | Command output |
| G7 Deliver | Report WHAT, WHY, HOW verified, limits, open work. | Final message |

When a gate fails: stop, find the cause, fix it at the source, retest. Add a regression test if the failure can recur.

### Setup plan (ordered)

1. **Prerequisites.** Node ≥ 20, `git`, HTTPS access to `github.com`. Check with `node -v` and `git --version`.
2. **Install.** `npm install` at the repo root. Expect no runtime dependencies for the orchestrator.
3. **Baseline.** `npm test` MUST pass (11 tests at the time of writing).
4. **First sync.** `npm run sync`. Expect three sources and about 351 resources. Read `storage/reports/import-report.md`.
5. **Idempotence check.** Run `npm run sync` again. Expect `INDEX sem mudanças`.
6. **Web check.** `npm run build`. Expect a successful static build.
7. **Automation.** Confirm `.github/workflows/sync-registry.yml` can push to the default branch. If branch protection blocks it, change the job to open a pull request.
8. **Deploy (optional).** `npm run deploy` needs a valid Cloudflare login or API token. Do not run it without authorization.

---

## PART 4 — REQUIREMENTS AND ACCEPTANCE TESTS

### Requirements (EARS / RFC 2119)

- R1. WHEN a source is unreachable, THEN the pipeline MUST keep the previous data of that source and MUST record `lastError` in `sync-state.json`.
- R2. WHEN a source stops listing a resource, THEN the pipeline MUST set `status: "error"` and `missingSince`. It MUST NOT delete the entry.
- R3. IF a resource has no recognized permissive license, THEN `licensing.mirrorable` MUST be `false`.
- R4. IF a resource is from a third party, THEN `official` MUST be `false` and `status` MUST be `external` unless the code is hosted in an official repository.
- R5. The pipeline MUST NOT execute any file from a downloaded source.
- R6. WHEN `sync` runs twice on unchanged sources, THEN the second run MUST NOT change `registry.json`.
- R7. Every resource MUST have `sourceUrl`, `contentHash`, `provenance` and `security`.
- R8. The `mirror` command MUST refuse a resource with `mirrorable: false`.
- R9. The pipeline MUST NOT invent counts, ratings or installation numbers.
- R10. The adapter SHOULD read only the manifest files it needs.

### Acceptance tests (Gherkin)

```gherkin
Scenario: Source failure is isolated
  GIVEN the index holds plugins from "claude-plugins-official"
  AND the marketplace manifest becomes unreadable
  WHEN sync runs
  THEN the plugins stay in the index without "missingSince"
  AND "sync-state.json" holds a lastError for that source
  AND other sources sync normally

Scenario: Removed resource is marked, not deleted
  GIVEN the index holds the skill "beta"
  WHEN the source no longer contains "beta"
  AND sync runs
  THEN "beta" stays in the index with status "error" and a "missingSince" date

Scenario: Mirror respects license
  GIVEN a resource with licensing.mirrorable = false
  WHEN the user runs "mirror <id>"
  THEN the command exits with an error and prints the source URL
```

Tests for R1, R2, R6 and the scenarios above exist in `test/pipeline.test.mjs`. Add tests for R3, R5 and R8 when you touch that code.

### Failure modes (FMEA, short)

| Failure | Effect | Severity | Control |
|---|---|---|---|
| Upstream repo renamed or removed | Source returns zero or errors | High | R1, R2, `lastError` in state |
| Manifest format changes | Adapter throws or yields bad data | High | Schema validation rejects the item and logs it |
| Rate limit or network error | Fetch fails | Medium | Retry with exponential backoff, 30 s wait on rate limit |
| License text not recognized | Item not mirrorable | Medium | `UNRECOGNIZED`, status `available` |
| Malicious manifest or script | Code execution on user machine | Critical | R5, no execution, install command shown for manual copy, approval flag |
| Index grows without limit | Slow web app | Low | Index only; mirrors outside Git |
| Bot cannot push to protected branch | Sync stops | Medium | Switch workflow to pull request |

---

## PART 5 — RULES FOR THIS PROJECT

1. **Data first.** `storage/indexes/registry.json` is the source of truth. The web app MUST NOT fetch sources directly.
2. **One adapter per source.** An adapter exports `discover({ checkout, source, commit })`. It reads files. It does not run them or use the network.
3. **Add a source:** follow `docs/adicionar-fonte.md`. Update `registry/sources.json`, register the adapter, add a fixture and a test.
4. **Unavailable sources.** Record the limitation with `"adapter": null`. Do not bypass authentication, rate limits or robots rules.
5. **No secrets.** Never commit tokens. Do not print tokens in logs.
6. **Security text.** Show risk, permissions and dependencies before any install command. Install commands are text for manual use.
7. **Dependencies.** Add none without a recorded decision (WHY, alternatives, size).
8. **Style.** Short functions, clear names, comments in the language of the existing file (Portuguese in `src/`). No dead code.
9. **Git.** Develop on the assigned branch. Do not force push without authorization. Commit messages state WHAT and WHY.
10. **Reports.** After each sync, `import-report.md` MUST list counts by type, source and status, and every unavailable or unverified source.

## PART 6 — DELIVERY CHECKLIST

- [ ] `npm test` passes
- [ ] `npm run sync` ran twice; second run is idempotent
- [ ] `npm run build` passes
- [ ] `import-report.md` reflects the new state
- [ ] No secrets, no third-party code executed
- [ ] Final message states WHAT, WHY, HOW verified, limits and open work
