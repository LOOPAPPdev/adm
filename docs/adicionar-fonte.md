# Como adicionar fontes e tipos de recurso

## Nova fonte
1. Valide o método de acesso real (git, API documentada, registry). Não contorne autenticação, limites ou robots. Se não houver acesso legítimo, registre a limitação em `registry/sources.json` com `"adapter": null`.
2. Crie `apps/orchestrator/src/adapters/<nome>.mjs` exportando `async discover({ checkout, source, commit })` que devolve itens com os campos de `RegistryResource` (veja `src/schema.mjs`). Obrigatórios: `name, description, type, author, official, sourceUrl, tags, dependencies, status, provenance`. Preencha `contentHash` (sha256 do manifesto), `license`, `licensing`, `security`, `installation` quando existirem. Apenas leia arquivos; nunca execute código da fonte.
3. Registre o adapter em `src/adapters/index.mjs` e a fonte em `registry/sources.json` (`enabled: true`).
4. Adicione fixture + teste em `apps/orchestrator/test/` (veja `helpers.mjs`) e rode `npm test`.
5. `npm run orchestrator -- sync --source <id>` e confira `storage/reports/import-report.md`.

Regras de status: `verified` (código na origem + licença permissiva), `available` (sem licença detectada), `external` (apenas link/metadados), `restricted`, `error` (removido da fonte).

## Novo tipo de recurso
1. Inclua o tipo em `RESOURCE_TYPES` (`src/schema.mjs`) e em `ResourceType`/`TYPE_LABEL` (`apps/web/src/lib/registry.ts`).
2. Adicione a aba em `TABS` (`apps/web/src/components/Directory.tsx`).
3. Crie ou ajuste um adapter para emiti-lo.

## Ciclo de sincronização
`DISCOVER/FETCH` (clone raso ou fetch incremental, com retry) → `VALIDATE` (schema) → `NORMALIZE` (id `tipo:fonte/slug`) → `DEDUPLICATE` (mesma origem repo+path+sha; duplicados viram `aliases`) → `INDEX` (merge incremental; ausentes viram `status: error` + `missingSince`) → `PUBLISH` (copia o índice para `apps/web/src/data`).
