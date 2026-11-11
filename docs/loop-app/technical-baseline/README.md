# LOOP documentation

Repository documentation baseline · 2026-11-11 · Reference specification (not application code)

Start with the architecture. Use the component specifications for visual behavior. Use the decision register to identify implementation blockers.

| Document | Owns | Status |
| --- | --- | --- |
| [Architecture](docs/architecture.md) | Layers, boundaries, modules, edit flow | Consolidated rules |
| [Design system](design-system/README.md) | Token ownership and delivery status | Provisional values |
| [Components](docs/components/README.md) | Family specifications and corrections | Source specifications with explicit overrides |
| [References](docs/references.md) | Provenance and adoption limits | Sources identified; images incomplete |
| [Decisions](docs/decisions.md) | Conflicts, unknowns and acceptance gates | Open items tracked |
| [Changes](docs/changes.md) | Changes made in this local baseline | Recorded |
| [Validation](docs/validation.md) | Checks and limitations | Local checks |
| [Source manifest](sources/manifest.json) | SHA-256 for original attachments | Originals preserved, unmodified |
| [Integration context](INTEGRATION.md) | Existing monorepo structure and import rules | Repository-specific |

## Document authority

The current architecture and explicit corrections in the component index take precedence over historical transcriptions. Token values remain provisional. An open proposal MUST NOT be described as an approved implementation. Source DOCX files are retained unchanged; Markdown transcriptions preserve paragraph and table text, not Word layout.

## Working procedure

WHEN a rule changes, THEN update its owning document and the change log. WHEN a reference is added, THEN register it before deriving implementation values. WHEN a token is approved, THEN record its alias, theme behavior and validation evidence. New contributors SHOULD read the decision register before implementation.

Repository target: `LOOPAPPdev/adm`, branch `main`, path `docs/loop-app/technical-baseline/`. This documentation is a source baseline, not a report that implementation is complete. The monorepo currently contains both `apps/loop` (Vite + React frontend) and `apps/web` (Next.js/OpenNext directory). The baseline does not move or replace either application. See [Integration context](INTEGRATION.md).
