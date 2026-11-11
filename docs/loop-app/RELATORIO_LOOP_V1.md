# LOOP v1.0 — relatório de entrega

Data: 2026-11-10 · Escopo: front-end funcional sem backend de produção.

## Critério de aceite

> A plataforma deve permitir demonstrar a jornada completa da consultoria e da ferramenta LOOP sem backend de produção.

**Atendido.** Jornada demonstrável: site → demonstração → contato → workspace → criar projeto → descoberta 3×3 → organograma → processos (Play/Pausa, BPMN) → oportunidades → cenários A/B/C → mapa causal → apresentação → portal do cliente → entregáveis. Tudo é salvo localmente.

## Funcionalidades implementadas

| Área | Rotas | O que funciona |
|---|---|---|
| Site | `/`, `/metodo`, `/solucoes`, `/demonstracao`, `/contato` | BPM da consultoria (23 atividades, 7 fases, 5 gates) com 4 visões e impressão; fluxo de exemplo com Play/Pausa; formulário de contato validado (rascunho local, nunca enviado) |
| Workspace | `/app`, `/app/projetos`, `/app/projetos/:id`, `…/consultoria`, `…/entregaveis`, `/configuracoes`, `/verificacao` | Painel; criar (3 templates), buscar, renomear, duplicar, arquivar, exportar e importar JSON com validação; aceite sequencial de atividades bloqueado por gates; aprovar/rejeitar gates com regra de retorno; entregáveis por fase; exportar tudo / apagar dados com confirmação; 13 autotestes no navegador |
| Studio | `…/descoberta`, `…/organograma`, `…/processos`, `…/oportunidades`, `…/cenarios`, `…/sistemas`, `…/evidencias`, `…/apresentacao` | Formulário 3×3 (React Hook Form + Zod, autosave) com 5 estados de evidência e prévia ao vivo; organograma com layout ELK; fluxo com raias, seleção e edição, Play/Pausa e vista/exportação BPMN 2.0; 5 regras determinísticas → candidatos → cenário B; cenários A/B/C com adicionar/remover/reatribuir, diff, indicadores e gráfico; mapa causal com laços R/B e gate de simulação; registro de evidências; apresentação em tela cheia com 6 etapas e teclado |
| Portal | `/portal/:id` | Andamento por fase, fluxo modelado, lacunas, validação do cliente; perfil cliente/consultor simulado |

Entregáveis técnicos: código-fonte em `apps/loop`, componentes reutilizáveis (`src/components/ui`, `src/components/diagrams`), design tokens (`src/styles.css`, `src/data/design-tokens.json`), modelos JSON (`src/data/`, `models/`), dados de demonstração marcados (`seedDemo`, template Clean Sea), interfaces para APIs futuras (`src/ports/`), README e ZIP (`npm run zip`).

## Testes executados

| Suíte | Resultado |
|---|---|
| TypeScript (`tsc --noEmit`, modo strict) | sem erros |
| Vitest — domínio, importação, gates, cenários, BPMN (lido pelo `bpmn-moddle`), mapa causal, Dexie/IndexedDB, store, `models/` | 34/34 passaram |
| Playwright desktop — 8 caminhos de aceite do handoff (`project-create-save-refresh`, `discovery-to-org-chart`, `process-playback`, `rule-routing`, `scenario-structural-diff`, `presentation-mode`, `gate-block`, `invalid-json-reject`) + autotestes, gate de simulação, contato, portal, BPMN | 14/14 passaram |
| Playwright mobile (Pixel 7) — sem rolagem horizontal em 9 rotas | 1/1 passou |
| Varredura de 22 rotas no Chromium | sem erros de JavaScript (só a fonte do Google, bloqueada de propósito no teste) |

Defeitos encontrados e corrigidos durante a verificação: duas cópias do React no monorepo (resolvido com `dedupe`); estouro horizontal em telas estreitas (trilhas de grid sem `minmax(0,1fr)`); fluxo cortado no celular (`minZoom` alto) e altura vazia (altura agora segue a largura medida); JSON Schema não determinístico (data padrão embutida).

## Limitações

- Sem autenticação nem backend: perfis e aprovações são locais e demonstrativos.
- Play é progressão visual, não execução BPMN. O XML BPMN é para notação e troca (`isExecutable="false"`).
- Sem motor de System Dynamics nem de eventos discretos: tempo de ciclo, custo e ROI aparecem como “não calculável”.
- Regras de oportunidade: correspondência determinística de fatos, não DMN.
- Os componentes seguem o padrão do shadcn/ui (`cva` + `tailwind-merge`), mas foram escritos à mão. Não usam Radix nem o CLI do shadcn.
- No celular, diagramas largos aparecem pequenos; use o zoom do canvas.
- O primeiro carregamento tem cerca de 0,8 MB de JS (≈250 kB gzip). Recharts, ELK.js (1,46 MB) e bpmn-js carregam só nas telas que os usam.

## Pendente de integração

1. Backend (`HttpProjectRepository`, contratos em `src/ports/HttpProjectRepository.ts` e `docs/loop-app/BACKEND_ARQUITETURA.md`): login, perfis, permissões e auditoria.
2. Rota e senha por cliente no portal; sincronização com o repositório do projeto do cliente.
3. Envio real de contato, e-mail e WhatsApp.
4. Motor BPMN executável, motor quantitativo (estoques e fluxos, unidades, integração numérica) e validação com dados medidos.
5. Publicação no Cloudflare Pages: `npm run deploy -w @adm/loop` precisa de `wrangler login` ou `CLOUDFLARE_API_TOKEN`. Ainda não foi publicado.
