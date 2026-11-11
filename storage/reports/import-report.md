# Import report

Gerado por `apps/orchestrator`. Total: **351** recursos.

## Por tipo e fonte

| fonte | skill | agent | plugin | mcp-server | workflow | total |
|---|---|---|---|---|---|---|
| mcp-reference-servers | 0 | 0 | 0 | 20 | 0 | 20 |
| claude-plugins-official | 0 | 0 | 312 | 0 | 0 | 312 |
| anthropics-skills | 19 | 0 | 0 | 0 | 0 | 19 |

## Por status

| status | qtd |
|---|---|
| verified | 78 |
| available | 2 |
| external | 271 |
| restricted | 0 |
| error | 0 |

## Oficial × terceiros

| classe | qtd |
|---|---|
| oficial (Anthropic/MCP) | 91 |
| terceiros listados no diretório | 260 |

## Última sincronização por fonte

| fonte | commit | último sucesso | itens | estado |
|---|---|---|---|---|
| anthropics-skills | `2c5958ecac` | 2026-11-11T07:31:06.598Z | 19 | ok |
| claude-plugins-official | `43fd1f9db0` | 2026-11-11T07:31:06.598Z | 312 | ok |
| mcp-reference-servers | `e1dc4b18db` | 2026-11-11T07:31:06.598Z | 20 | ok |

## Fontes indisponíveis, restritas ou fora de escopo

| fonte | método testado | limitação |
|---|---|---|
| https://code.claude.com/docs/en/sub-agents | documentação (HTTP 200). Define o formato de agents; não lista componentes. | Sem catálogo de agents. Agents oficiais chegam empacotados em plugins (agents/*.md) e aparecem em 'provides'. |
| https://code.claude.com/docs/en/plugin-marketplaces | documentação (HTTP 200). Define o schema de marketplace.json usado pelo adapter claude-plugins-official. | Referência de formato apenas. |
| https://claude.ai/directory | HTTP 403 em acesso automatizado. | Restrito: sem API pública documentada. Não contornado. Conteúdo equivalente vem de claude-plugins-official. |
| https://claude.com/marketplace | HTTP 200, página de marketing renderizada (sem manifesto/API pública). | Sem endpoint estruturado. Não raspado. |
| https://skills.sh | Fora do escopo desta fase (somente Anthropic Directory). | Planejado para fase posterior; basta registrar um novo adapter. |

## Não espelhados / não verificados

- **271** recursos `external` (apenas metadados + link de origem; código não copiado).
- **2** recursos `available` ou com licença não reconhecida (sem redistribuição automática).
- **0** recursos marcados como removidos/ausentes na fonte.
- 0 verificados sem licença detectada (deve ser 0).
