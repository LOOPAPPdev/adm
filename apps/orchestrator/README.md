# @adm/orchestrator

Pipeline de ingestão do registry. Sem dependências externas (Node ≥ 20, ESM). Veja o [README raiz](../../README.md) e [docs/adicionar-fonte.md](../../docs/adicionar-fonte.md).

```bash
node src/cli.mjs sync [--source id[,id]] [--offline id=/caminho] [--no-publish]
node src/cli.mjs list [--type skill|plugin|mcp-server]
node src/cli.mjs mirror <resource-id>
npm test
```

Módulos: `src/adapters/*` (uma fonte cada), `src/fetch.mjs` (git raso + retry/backoff), `src/pipeline.mjs` (normalize, dedupe, index, publish), `src/schema.mjs` (modelo e validação), `src/report.mjs` (import-report.md).
