# Integração do baseline — LOOPAPPdev/adm

Data: 2026-11-11  
Destino: `docs/loop-app/technical-baseline/` na branch `main`.

## Estado comprovado do repositório

- `apps/web/`: Next.js 16, React, OpenNext para Cloudflare Workers. A rota `/` apresenta o diretório ADM.
- `apps/loop/`: aplicação LOOP v1.0 em React + Vite; site, workspace, studio e portal. Tem dados locais no IndexedDB e adapters planejados, sem backend real.
- `design-system/`: Design System compartilhado da raiz. Seus tokens e componentes são o contrato efetivo de UI do monorepo.
- `docs/loop-app/`: PRD/FRD, arquitetura de backend, perguntas abertas e material de design já presentes.

## Regra de precedência

Este baseline documenta requisitos, sem substituir o código executável existente. Quando os tokens históricos `ds-` e os tokens atuais `--color-*` divergirem, **não criar um segundo sistema**: registrar a correspondência e aprovar aliases antes de alterar componentes. A documentação original prevalece como evidência histórica; o código do monorepo continua sendo a referência para o comportamento implementado.

## Escopo da importação

- Copiar o pacote de 20 arquivos sem perda: cinco originais em `sources/`, transcrições, diagrama Mermaid, tokens e referência ilustrativa.
- Atualizar apenas o índice documental do pacote e adicionar este contexto de integração.
- Não publicar o HTML da Clean Sea nem datasets operacionais do protótipo.
- Não criar rotas, APIs, banco, Worker adicional nem alterar implantações neste merge documental.
- Não afirmar que as pendências D-B…D-L foram resolvidas.

## Aceitação

1. O JSON de tokens deve analisar sem erros.
2. Todos os cinco arquivos originais devem manter os hashes SHA-256 registrados em `sources/manifest.json`.
3. Todos os links Markdown relativos devem resolver.
4. A integração não deve alterar `apps/loop`, `apps/web` nem `design-system/`.
5. O README raiz deve apontar para este baseline e separar `apps/loop` de `apps/web`.

**Nota:** o processo de merge e os testes de aplicação devem ser verificados separadamente por GitHub CI. Sem autenticação e acesso de escrita, este pacote é apenas uma proposta de commit.
