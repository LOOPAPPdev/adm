# LOOP · monorepo `adm`

Uma aplicação, uma arquitetura, um deploy: **`apps/web`** (Next.js no Cloudflare Workers) serve o website LOOP Consulting, o Workspace do Consultor, o LOOP Studio, o Portal do Cliente, o **ADM Directory** e o backend `/api/v1` (D1). Decisão: [ADR-0002](docs/loop-app/ADR-0002-aplicacao-unificada.md) · deploy: [DEPLOY_MEMORY](docs/deployment/DEPLOY_MEMORY.md) · rotas e código: [apps/web/README.md](apps/web/README.md).

| Rota | Área |
|---|---|
| `/`, `/metodo`, `/solucoes`, `/demonstracao`, `/contato` | Website |
| `/app`, `/app/projetos/[id]/…` | Workspace |
| `/studio` | LOOP Studio |
| `/portal/[id]` | Portal do Cliente |
| `/directory` | ADM Directory |
| `/entrar` | Login |
| `/api/v1/*` | Backend (auth, organizações, projetos, histórico, contato) |

O restante deste README descreve o **ADM Directory** e o orquestrador que o alimenta: ele **cataloga, normaliza e publica** os componentes do **Anthropic Directory**. Esta primeira fase importa somente fontes oficiais da Anthropic; fontes da comunidade ficam para uma fase seguinte (basta um novo adapter).

```
apps/
  orchestrator/   pipeline DISCOVER → FETCH → VALIDATE → NORMALIZE → DEDUPLICATE → INDEX → PUBLISH
  web/            aplicação unificada LOOP (Next.js 16 + Tailwind 4 + D1, um Worker via OpenNext): site, Workspace, Studio, Portal, Directory, /api/v1
registry/
  sources.json    inventário de fontes (adapter, método, limitações)
storage/
  indexes/        registry.json (índice normalizado) e sync-state.json  ← versionados
  reports/        import-report.md (contagens e itens não verificados)  ← versionado
  checkouts/      clones rasos das fontes                               ← ignorado pelo Git
  mirrors/        espelhos de código sob demanda                        ← ignorado pelo Git
design-system/   tokens, componentes e padrões compartilhados (fonte única de estilo de todos os apps)
docs/
  adicionar-fonte.md   como adicionar fontes e tipos
  diagrama-cld/        documentos do Diagrama CLD
```

**Decisão central:** o Git guarda apenas o *índice* (metadados, hash SHA-256, proveniência). O código das fontes é clonado para `storage/checkouts` e só é copiado para `storage/mirrors` sob demanda, e somente se a licença permitir. O histórico não cresce com milhares de repositórios.

## Fontes (fase 1 — Anthropic)

| Fonte | Método | Tipo |
|---|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) | git raso; `skills/*/SKILL.md` | skill |
| [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | git raso; `marketplace.json` + `plugin.json` | plugin |
| [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) | git raso; README + manifests de `src/*` | mcp-server |
| claude.ai/directory | HTTP 403 a clientes automatizados — **restrito, não contornado** | — |
| claude.com/marketplace | página de marketing, sem API/manifesto — não raspada | — |
| docs de sub-agents / plugin-marketplaces | só documentação de formato | — |

Detalhes e limitações por fonte: `registry/sources.json` e `storage/reports/import-report.md`.

## Resultado da importação atual

351 recursos: 19 skills, 312 plugins (54 hospedados no repositório oficial + 258 de terceiros apenas listados; 5 entradas duplicadas foram fundidas como aliases) e 20 MCP servers (7 de referência + 13 arquivados). **Não há agents nem workflows** nas fontes oficiais deste escopo como itens independentes; agents empacotados em plugins aparecem no campo `provides`. Relatório completo: [`storage/reports/import-report.md`](storage/reports/import-report.md).

Status: `verified` (código na fonte oficial, manifesto lido, licença permissiva detectada), `available` (sem licença detectada: não espelhável), `external` (terceiro/arquivado: só metadados e link), `restricted`, `error` (removido da fonte; nunca apagado em silêncio).

## Uso

Requer Node ≥ 20 e acesso HTTPS ao GitHub.

```bash
npm install
npm run sync                 # sincroniza todas as fontes (incremental, idempotente)
npm run orchestrator -- sync --source anthropics-skills
npm run orchestrator -- list --type skill
npm run orchestrator -- mirror skill:anthropics-skills/docx   # copia o código sob demanda (se a licença permitir)
npm test                     # orquestrador + apps/web (domínio e backend)
npm run dev                  # aplicação em http://localhost:3000
npm run build                # build Next
npm run cf-build             # build OpenNext (Worker)
npm run e2e                  # Playwright (ver apps/web/README.md)
```

Testes e sync offline usam fixtures/diretórios locais: `sync --offline anthropics-skills=/caminho`.

## Garantias de segurança

- Manifestos e código baixados são tratados como **entrada não confiável**; o orquestrador só lê arquivos. Hooks do git desativados no clone; nenhum script de instalação é executado.
- Comandos de instalação são exibidos para **cópia manual**, com risco, permissões e dependências à vista. Itens com `scripts/`, hooks, MCP ou comandos exigem aprovação explícita.
- Falha em uma fonte não afeta as outras (dados anteriores preservados). Retry com backoff exponencial e tratamento de rate limit.
- Sem segredos no repositório; nenhum acesso a conteúdo autenticado ou restrito.

## Automação

- `.github/workflows/sync-registry.yml`: sync diário (06:17 UTC) e manual (`workflow_dispatch`, com filtro de fonte); testa, builda e commita só se o índice mudou.
- `.github/workflows/ci.yml`: audit, testes, typecheck, build Next, build OpenNext e E2E (inclui o Worker real com D1 local).

## Interface do Directory (`apps/web`, rota `/directory`)

Abas (All, Skills, Agents, Plugins, MCP Servers, Workflows, Sources, Installed), busca de texto, filtros (fonte, categoria, oficial/terceiro, status), ordenação, paginação, detalhes, link para a fonte original, copiar comando, pré-visualização do manifesto, comparação (até 3) e itens salvos localmente. Os dados vêm de `apps/web/src/data/registry.json`, gerado pela etapa PUBLISH.

Deploy (Cloudflare Workers): ver [docs/deployment/DEPLOY_MEMORY.md](docs/deployment/DEPLOY_MEMORY.md).

## Limitações conhecidas

- Contagens de instalação/popularidade não existem nas fontes públicas e **não são inventadas**.
- Plugins de terceiros não têm licença/segurança verificadas aqui.
- Detecção de licença é heurística (Apache-2.0, MIT, BSD, MPL, GPL); qualquer outra vira `UNRECOGNIZED`.

## LOOP — baseline de arquitetura e Design System (2026-11-11)

A documentação técnica consolidada do LOOP está em [`docs/loop-app/technical-baseline/README.md`](docs/loop-app/technical-baseline/README.md). Contém [arquitetura e diagrama Mermaid](docs/loop-app/technical-baseline/docs/architecture.md), [famílias de componentes](docs/loop-app/technical-baseline/docs/components/README.md), [tokens de FlowMap](docs/loop-app/technical-baseline/design-system/README.md), [referências](docs/loop-app/technical-baseline/docs/references.md), [decisões pendentes D-A–D-L](docs/loop-app/technical-baseline/docs/decisions.md) e [validação](docs/loop-app/technical-baseline/docs/validation.md). Os cinco arquivos originais foram preservados em [`sources/`](docs/loop-app/technical-baseline/sources/) com hashes SHA-256 verificáveis.

**Aplicações:** desde o ADR-0002 (2026-11-11) o antigo `apps/loop` (Vite) foi migrado para `apps/web`; há uma única aplicação Next.js com backend. O `design-system/` da raiz continua como fonte única de tokens executáveis. O baseline é documental e **não** certifica conformidade BPMN, migração de tokens, backend, autenticação ou deploy. As decisões em aberto devem ser tratadas antes de implementar os recursos dependentes.
