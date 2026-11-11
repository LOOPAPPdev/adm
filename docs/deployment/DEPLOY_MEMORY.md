# DEPLOY_MEMORY · LOOP no Cloudflare Workers

Memória operacional do deploy. Um Worker (`adm`) serve site, Workspace, Studio, Portal, ADM Directory e `/api/v1`.
Atualize este arquivo a cada mudança de infraestrutura.

## Estado em 2026-11-11

| Item | Estado |
|---|---|
| Build OpenNext (`.open-next/worker.js`) | ✅ gerado localmente e no CI |
| Worker testado localmente (`wrangler dev` + D1 local) | ✅ E2E conectado 5/5 |
| Banco D1 de produção (`loop-db`) | ✅ criado em 2026-11-11 (`e965c51a-910f-408f-a456-919b11ae74f5`, região ENAM); migração `0001_init.sql` aplicada e registrada em `d1_migrations` |
| Segredo `BOOTSTRAP_TOKEN` | ❌ não configurado |
| Publicação em produção | ❌ **não feita** — a credencial Cloudflare deste ambiente de desenvolvimento foi recusada pela API |
| Domínio | ❌ a definir (TD-08) |

## Configuração do Cloudflare (Workers Builds)

| Campo | Valor |
|---|---|
| Repositório | `LOOPAPPdev/adm` |
| Branch | `main` |
| Root directory | `apps/web` |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx wrangler deploy` |
| Node | 22 |

O Workers Builds já está conectado ao repositório (Worker `adm`). Em 2026-11-11, no PR #3, ele detectou o monorepo, instalou, gerou o build OpenNext e enviou os assets a partir de `apps/web`; o deploy parou porque o D1 `loop-db` ainda não existia (erro 10181); o banco foi criado em seguida. O nome do Worker no `wrangler.jsonc` precisa continuar `adm`.

## Primeira publicação (uma vez)

Rode em `apps/web`, autenticado (`npx wrangler login` ou `CLOUDFLARE_API_TOKEN` com permissão de Workers e D1). Nunca coloque o token no repositório.

```bash
npx wrangler d1 create loop-db
```

Copie o `database_id` impresso para `apps/web/wrangler.jsonc` (substitui os zeros) e faça commit.

```bash
npx wrangler d1 migrations apply loop-db --remote
```

```bash
npx wrangler secret put BOOTSTRAP_TOKEN
```

Publique (pelo Workers Builds ao fazer merge na `main`, ou manualmente):

```bash
npx opennextjs-cloudflare build && npx wrangler deploy
```

Crie o primeiro administrador. **Pelo navegador:** abra `https://SEU-DOMINIO/configurar`, preencha nome, e-mail, senha (12+ caracteres) e o token (a página só abre enquanto não houver usuário e o segredo existir). **Pelo terminal** (equivalente):

```bash
curl -sS -X POST https://SEU-DOMINIO/api/v1/auth/bootstrap -H 'content-type: application/json' -H 'origin: https://SEU-DOMINIO' -d '{"email":"admin@exemplo.com","name":"Admin","password":"SENHA-FORTE-AQUI","token":"O-BOOTSTRAP_TOKEN"}'
```

Depois disso o bootstrap responde 409. Remova o segredo:

```bash
npx wrangler secret delete BOOTSTRAP_TOKEN
```

Organizações de cliente e membros: tela `/admin` (ou `POST /api/v1/orgs` e `POST /api/v1/orgs/{id}/members`), logado como admin. Não há envio de e-mail: defina a senha inicial e entregue-a por um canal seguro.

## Migrações

- Arquivos em `apps/web/migrations/NNNN_descricao.sql`, nunca editados depois de aplicados em produção.
- Aplicar: `npx wrangler d1 migrations apply loop-db --remote` (antes do deploy que depende delas).
- Restauração: D1 Time Travel permite voltar a qualquer minuto dos últimos 30 dias (plano pago). A restauração **sobrescreve** o banco.

## Verificação pós-deploy

```bash
curl -sS https://SEU-DOMINIO/api/v1/health
```

Deve responder `{"status":"ok","db":"ok"}`. Depois, abra `/`, `/app`, `/studio`, `/portal/demo`, `/directory` e `/entrar` e faça login.

## Local

```bash
npm install
```

```bash
cd apps/web && printf 'BOOTSTRAP_TOKEN=local-only\n' > .dev.vars && npx wrangler d1 migrations apply loop-db --local
```

```bash
npm run cf-build && npx wrangler dev
```

`.dev.vars` é ignorado pelo Git. `npm run dev` (Next) também enxerga o D1 local por meio do `initOpenNextCloudflareForDev`.

## Histórico

| Data | Mudança |
|---|---|
| 2026-11-11 | D1 `loop-db` criado pela API do Cloudflare e migração `0001_init.sql` aplicada (registrada em `d1_migrations`, compatível com `wrangler d1 migrations apply`). |
| 2026-11-11 | Worker renomeado de `next-starter-template` para `adm` (nome exigido pelo Workers Builds conectado ao repositório); binding D1 `DB`; migração `0001_init`; aplicação unificada (ADR-0002). |
