# ADM — Diretório unificado de Skills, Agents, Plugins e MCP Servers

Monorepo (npm workspaces) que **cataloga, normaliza e publica** os componentes do **Anthropic Directory**. Esta primeira fase importa somente fontes oficiais da Anthropic; fontes da comunidade ficam para uma fase seguinte (basta um novo adapter).

```
apps/
  orchestrator/   pipeline DISCOVER → FETCH → VALIDATE → NORMALIZE → DEDUPLICATE → INDEX → PUBLISH
  web/            diretório pesquisável (Next.js 16 + Tailwind 4, deploy em Cloudflare Workers via OpenNext)
registry/
  sources.json    inventário de fontes (adapter, método, limitações)
storage/
  indexes/        registry.json (índice normalizado) e sync-state.json  ← versionados
  reports/        import-report.md (contagens e itens não verificados)  ← versionado
  checkouts/      clones rasos das fontes                               ← ignorado pelo Git
  mirrors/        espelhos de código sob demanda                        ← ignorado pelo Git
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
npm test                     # testes do orquestrador
npm run dev                  # interface em http://localhost:3000
npm run build
```

Testes e sync offline usam fixtures/diretórios locais: `sync --offline anthropics-skills=/caminho`.

## Garantias de segurança

- Manifestos e código baixados são tratados como **entrada não confiável**; o orquestrador só lê arquivos. Hooks do git desativados no clone; nenhum script de instalação é executado.
- Comandos de instalação são exibidos para **cópia manual**, com risco, permissões e dependências à vista. Itens com `scripts/`, hooks, MCP ou comandos exigem aprovação explícita.
- Falha em uma fonte não afeta as outras (dados anteriores preservados). Retry com backoff exponencial e tratamento de rate limit.
- Sem segredos no repositório; nenhum acesso a conteúdo autenticado ou restrito.

## Automação

- `.github/workflows/sync-registry.yml`: sync diário (06:17 UTC) e manual (`workflow_dispatch`, com filtro de fonte); testa, builda e commita só se o índice mudou.
- `.github/workflows/ci.yml`: testes + build.

## Interface (`apps/web`)

Abas (All, Skills, Agents, Plugins, MCP Servers, Workflows, Sources, Installed), busca de texto, filtros (fonte, categoria, oficial/terceiro, status), ordenação, paginação, detalhes, link para a fonte original, copiar comando, pré-visualização do manifesto, comparação (até 3) e itens salvos localmente. Os dados vêm de `apps/web/src/data/registry.json`, gerado pela etapa PUBLISH.

Deploy (Cloudflare Workers): `npm run deploy` com `wrangler login` ou `CLOUDFLARE_API_TOKEN` válido.

## Limitações conhecidas

- Contagens de instalação/popularidade não existem nas fontes públicas e **não são inventadas**.
- Plugins de terceiros não têm licença/segurança verificadas aqui.
- Detecção de licença é heurística (Apache-2.0, MIT, BSD, MPL, GPL); qualquer outra vira `UNRECOGNIZED`.
