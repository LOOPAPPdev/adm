# ADR-0002 · LOOP Unified Application (Next.js + backend + um Worker)

| Campo | Valor |
|---|---|
| Status | **Aceito para implementação** · decisões marcadas *provisória* aguardam validação |
| Data | 2026-11-11 |
| Substitui | A separação `apps/loop` (Vite) × `apps/web` (Next.js) descrita em `technical-baseline/INTEGRATION.md` |
| Relaciona | `BACKEND_ARQUITETURA.md` (ADR-01 a ADR-08), `PERGUNTAS_ABERTAS.md`, `technical-baseline/docs/decisions.md` (D-H, D-L) |

## Contexto

O monorepo tinha três partes: `apps/web` (ADM Directory em Next.js/OpenNext), `apps/loop` (site, Workspace, Studio e Portal em Vite, dados só no IndexedDB) e um backend que não existia. Duas interfaces, dois deploys previstos e nenhum dado persistente no servidor.

## Decisão

1. **Uma aplicação:** `apps/web` (Next.js App Router) é a única interface. O código do `apps/loop` foi movido com `git mv` (histórico preservado) e o diretório foi removido. Mapa de migração em `UNIFICACAO_AUDITORIA.md`.
2. **Um deploy:** um Cloudflare Worker gerado pelo OpenNext (`.open-next/worker.js`) serve todas as rotas e a API.
3. **Backend nos Route Handlers** (`/api/v1/*`), no mesmo Worker. **Não há segundo Worker.** Isso substitui o ADR-04 de `BACKEND_ARQUITETURA.md` (Worker separado) enquanto não houver filas, cron ou webhooks; quando houver, a exceção será documentada.
4. **D1** como banco relacional (binding `DB`), migrações SQL versionadas em `apps/web/migrations/`. **R2 não é usado**: nenhum requisito implementado guarda arquivos.
5. **Camadas** (`apps/web/src/server/`): `domain` (papéis, erros) · `data` (todo o SQL) · `services` (regras) · `infra` (D1, WebCrypto, bindings) · `http` (cookies, origem, erros). A UI só fala com o backend pelo `HttpProjectRepository`.
6. **Modelo de dados:** o projeto LOOP é um **documento** validado pelo mesmo schema Zod do frontend (`src/domain/schema.ts`), guardado por organização, com `version` para concorrência otimista e um snapshot por versão em `project_revisions`. Processos, elementos, ligações, organograma, cenários e mapa causal vivem dentro do documento. Isso responde parcialmente a **D-H** (persistência sem perda do conteúdo não-BPMN; o BPMN continua derivado) e a **D-L** (edição recusada não altera o servidor; todo salvamento gera revisão; *desfazer* não existe ainda).
7. **Autenticação (provisória):** e-mail + senha com PBKDF2-SHA256 (100 000 iterações, limite do Workers), sessão opaca em cookie `HttpOnly; SameSite=Lax; Secure` (em HTTPS) e hash SHA-256 do token no banco, expiração de 14 dias, bloqueio após 5 falhas em 15 min. O primeiro administrador nasce por `POST /api/v1/auth/bootstrap`, que só funciona com o segredo `BOOTSTRAP_TOKEN` e com a tabela de usuários vazia. **Desvio do ADR-03 (Better Auth):** adiado porque exigia ORM e um provedor de e-mail que não existe; a troca fica pendente (TD-02) e as tabelas `users`/`sessions` são isoladas para facilitar a migração.
8. **Autorização:** papéis `owner`, `consultant`, `client_admin`, `client_member`, `viewer` por organização (tenant), mais `platform_role = admin`. A matriz está em `src/server/domain/roles.ts` e é aplicada nos serviços, nunca só na UI. Quem não pertence à organização recebe **404**.
9. **Modo demonstração:** sem sessão, a interface continua funcionando com IndexedDB e dados de exemplo **rotulados**. Com sessão, o servidor é a fonte da verdade e nenhum dado de exemplo é gravado lá.
10. **Design system:** `design-system/` na raiz continua a fonte única; os nomes Tailwind `ds-*` dos dois apps foram unidos em `globals.css`, sem duplicar tokens.

## O que não foi implementado (e não é simulado)

| Item | Estado | Por quê |
|---|---|---|
| Integração GitHub (repositório do cliente) | **Não implementada** | Contratos e GitHub App não aprovados (TD-04) |
| Agentes de IA, WhatsApp, e-mail | **Não implementados** | Sem provedores definidos (SI-01…SI-04, TD-05, TD-06) |
| Envio de e-mail (convite, redefinição de senha) | **Não implementado** | Sem provedor; contas são criadas por um administrador com senha inicial |
| Arquivos de evidência (upload) | **Não implementado** | Sem requisito aprovado; evidências são registros textuais no projeto |
| Processamento BPMN | Exportação/visualização apenas | Execução BPMN não faz parte do escopo |
| Fila de saída, filas, cron | **Não implementados** | Sem efeitos externos ainda (ADR-05 aguarda a primeira integração) |
| Desfazer / restaurar revisão | **Não implementado** | Revisões são guardadas; a operação de restauração falta |

## Consequências

- Um build, um Worker, um domínio. CI único testa domínio, backend (com as migrações reais), build Next, build OpenNext e E2E — inclusive no Worker real via `wrangler dev` com D1 local.
- Telas antigas com rotas por hash continuam acessíveis (`/#/app/...` redireciona para `/app/...`).
- Documento por projeto é simples e versionável; consultas analíticas entre projetos exigirão colunas extras ou outra tabela no futuro.
- A autenticação própria é pequena e testada, mas é código de segurança a manter; revisar antes de abrir para muitos clientes.
