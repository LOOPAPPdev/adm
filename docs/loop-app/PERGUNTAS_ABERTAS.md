# Loop App · Perguntas e pontos em aberto para ficar verde para produção

Versão 0.1 · 2026-11-10 · complementa `ANALISE_PRD_FRD.md`

## Como usar

- Cada item tem **ID**, **responsável**, **formato de resposta** e o **workflow que ele bloqueia**.
- Responda no formato pedido. Uma resposta fora do formato volta como pendente.
- Quando não souber, responda `DESCONHECIDO` e diga quem sabe. O item fica **amarelo**, não verde.
- Cada resposta recebe um nível de evidência: **A** declarado pela empresa · **B** fonte externa · **C** hipótese · **D** desconhecido.

### Estados

| Estado | Regra |
|---|---|
| 🔴 Vermelho | Sem resposta |
| 🟡 Amarelo | Respondido com evidência C ou D, ou com `DESCONHECIDO` |
| 🟢 Verde | Respondido no formato pedido, com evidência A ou B e, quando pedido, com anexo |

**Regra de produção:** todos os itens marcados **Bloqueante** de um workflow MUST estar verdes antes de o workflow começar. Itens **Importante** podem seguir em amarelo com um plano de resposta datado.

### Formatos de resposta

| Código | Formato | Exemplo |
|---|---|---|
| `SN` | Sim ou Não (+ observação opcional) | `Sim — Business desde 2024` |
| `NUM` | Número + unidade + período + fonte | `45 pedidos/mês (média jan–out/2026, planilha comercial)` |
| `FAIXA` | Mínimo – típico – máximo + unidade | `2 h – 6 h – 48 h` |
| `ESC` | Uma opção de uma lista fechada | `Google Workspace` |
| `MULT` | Uma ou mais opções de uma lista fechada | `Português, Inglês` |
| `LISTA` | Itens, um por linha | nomes, portos, sistemas |
| `TAB` | Planilha com as colunas indicadas (CSV ou XLSX) | ver colunas no item |
| `ARQ` | Arquivo anexado (PDF, DOCX, imagem) | regulamento do porto |
| `TXT` | Texto curto, máximo 5 linhas | descrição de processo |
| `PESSOA` | Nome + papel + e-mail de contato | `João — Diretor de Operações — …` |
| `DATA` | AAAA-MM-DD | `2026-12-15` |
| `VALOR` | Valor em R$ + periodicidade + o que inclui | `R$ 2.000/mês, inclui hospedagem e WhatsApp` |
| `DECISÃO` | Opção escolhida + motivo em 1 linha | `D1 — custo zero na fase inicial` |
| `CRED` | Credencial entregue pelo canal seguro (nunca no chat ou por e-mail) | token salvo no ambiente |

---

## Bloco 1 · Operação da CleanSea (responde: João / CleanSea)

Alimenta os parâmetros do mapa de fluxos e as regras do sistema.

| ID | Pergunta | Formato | Bloqueia | Prioridade |
|---|---|---|---|---|
| OP-01 | Organograma da empresa e de quem participa do fluxo pedido → certificado | `ARQ` (imagem ou PDF) + `LISTA` de `PESSOA` por etapa | W2 | Bloqueante |
| OP-02 | Como chega um pedido hoje? | `MULT`: e-mail · WhatsApp · telefone · portal · agente marítimo · outro + `TXT` | W2 | Bloqueante |
| OP-03 | Quantos pedidos chegam? | `NUM` por dia **e** por mês, com período e fonte | W2 | Bloqueante |
| OP-04 | Tempo da primeira mensagem até a cotação enviada | `FAIXA` em horas | W2 | Bloqueante |
| OP-05 | Tempo da cotação até o "de acordo" do cliente | `FAIXA` em horas | W2 | Importante |
| OP-06 | Tempo para obter anuência de autoridade/porto | `FAIXA` em horas, por porto-piloto | W2 | Bloqueante |
| OP-07 | Quantas equipes de coleta existem no porto-piloto e quantas coletas cada uma faz por dia? | `NUM` + `NUM` | W2 | Bloqueante |
| OP-08 | Veículos de transporte (caminhão, barcaça) disponíveis no porto-piloto | `NUM` por tipo | W2 | Importante |
| OP-09 | Tempo de tratamento/destinação até o comprovante | `FAIXA` em dias | W2 | Importante |
| OP-10 | Percentual de documentos devolvidos para correção | `NUM` em % + período | W2 | Importante |
| OP-11 | Onde estão as regras de cada porto? | `ESC`: documento por porto · planilha única · na cabeça das pessoas · sistema + `ARQ` das regras do porto-piloto | W2 | Bloqueante |
| OP-12 | Quem atualiza as regras dos portos e com que frequência? | `PESSOA` + `ESC`: sob demanda · mensal · trimestral · anual | W3 | Importante |
| OP-13 | Existe tabela porto × serviço × preço? | `SN` + `TAB` colunas: porto, serviço, tipo de resíduo (MARPOL anexo), unidade, preço, vigência | W3 | Bloqueante |
| OP-14 | Quem aprova mudanças de preço, regra ou processo? | `LISTA` de `PESSOA` por tipo de mudança | W3 | Bloqueante |
| OP-15 | Nos 28 portos, a operação é própria ou de parceiros? | `TAB` colunas: porto, própria/parceiro, nome do parceiro | W3 | Importante |
| OP-16 | Qual porto será o piloto? | `ESC` de um porto da lista OP-15 + motivo | W2 | Bloqueante |
| OP-17 | Idiomas dos pedidos recebidos | `MULT`: Português · Inglês · Espanhol · outro + % aproximado de cada | W3 | Importante |
| OP-18 | Exemplos reais de pedidos e respostas (anonimizados) | `ARQ`, mínimo 10 conversas completas | W3 | Bloqueante |
| OP-19 | O que já deu errado e custou caro? | `TAB` colunas: data, tipo (multa · atraso · cliente perdido · outro), etapa, custo estimado em R$, causa | W2 | Importante |
| OP-20 | KPIs que a empresa acompanha hoje | `TAB` colunas: KPI, fórmula, valor atual, meta, fonte | W3 | Bloqueante |
| OP-21 | Qual resultado faria a CleanSea considerar o projeto um sucesso? | `TXT` + 1 a 3 metas em `NUM` (ex.: tempo até cotação ≤ 2 h) | W3 | Bloqueante |

## Bloco 2 · Sistemas, canais e dados (responde: CleanSea + Loop)

| ID | Pergunta | Formato | Bloqueia | Prioridade |
|---|---|---|---|---|
| SI-01 | E-mail corporativo | `ESC`: Google Workspace · Microsoft 365 · outro | W3 | Bloqueante |
| SI-02 | Acesso ao e-mail operacional para os agentes | `SN` + `PESSOA` que autoriza; acesso via OAuth, nunca senha | W3 | Bloqueante |
| SI-03 | WhatsApp já é Business? Qual tipo? | `ESC`: app comum · WhatsApp Business app · API oficial (Cloud API) · via parceiro (nome) | W3 | Bloqueante |
| SI-04 | Número de WhatsApp que será usado e conta Meta Business verificada | `SN` + `TXT` | W3 | Bloqueante |
| SI-05 | Por quanto tempo as mensagens e documentos devem ser guardados? | `NUM` em meses/anos + base (contrato, lei, decisão interna) | W1 | Bloqueante |
| SI-06 | Sistemas que já usam (ERP, CRM, planilhas) | `TAB` colunas: sistema, uso, dono, tem API (S/N) | W3 | Importante |
| SI-07 | Os 3 sites para integração de dados (E_4) | `TAB` colunas: URL, dado buscado, frequência, tem API oficial (S/N), termos de uso permitem (S/N) | W3 | Bloqueante |
| SI-08 | Domínio da CleanSea para o webapp (E_1) e quem administra o DNS | `TXT` + `PESSOA` | W3 | Importante |
| SI-09 | Repositório GitHub da CleanSea | `TXT` (org/repo) + `PESSOA` admin da organização | W1 | Bloqueante |
| SI-10 | Dados pessoais tratados (nomes, telefones, documentos de tripulação) | `MULT` + `TXT`; define base legal LGPD | W1 | Bloqueante |
| SI-11 | Encarregado de dados (DPO) ou responsável LGPD na CleanSea | `PESSOA` | W1 | Importante |

## Bloco 3 · Regulação (responde: CleanSea + verificação Loop)

| ID | Pergunta | Formato | Bloqueia | Prioridade |
|---|---|---|---|---|
| RG-01 | Normas que regem a coleta no porto-piloto (confirmar Res. ANTAQ 99/2023 e regras locais) | `LISTA` + `ARQ` do texto vigente | W2 | Bloqueante |
| RG-02 | Documentos exigidos em cada etapa (anuência, manifesto, certificado) | `TAB` colunas: etapa, documento, emissor, prazo, modelo anexo | W2 | Bloqueante |
| RG-03 | A CleanSea está habilitada como prestadora no porto-piloto? | `SN` + `ARQ` comprovante + validade em `DATA` | W3 | Bloqueante |
| RG-04 | Algum documento pode ser gerado ou preenchido por IA, ou exige pessoa responsável? | `TAB` colunas: documento, IA pode rascunhar (S/N), quem assina | W3 | Bloqueante |

## Bloco 4 · Comercial e governança (responde: Loop + CleanSea)

| ID | Pergunta | Formato | Bloqueia | Prioridade |
|---|---|---|---|---|
| CM-01 | Escopo contratado: quais entregas E_1–E_10 entram na primeira fase? | `MULT` E_1…E_10 | W1 | Bloqueante |
| CM-02 | Preço do projeto e da operação mensal | `VALOR` (implantação) + `VALOR` (mensal) | W3 | Bloqueante |
| CM-03 | Quem paga custos variáveis (IA, WhatsApp, hospedagem)? | `ESC`: Loop embute no mensal · repasse ao custo · CleanSea paga direto | W3 | Bloqueante |
| CM-04 | Teto mensal de custo variável | `VALOR` + ação ao atingir: `ESC` alerta · pausa · aprova exceção | W3 | Importante |
| CM-05 | Prazo desejado para produção | `DATA` + o que acontece se atrasar (`TXT`) | W1 | Importante |
| CM-06 | Suporte pós-entrega | `ESC`: horário comercial · estendido · 24×7 + tempo de resposta em `NUM` horas | W3 | Bloqueante |
| CM-07 | Quem aprova a proposta e as intervenções do lado CleanSea? | `PESSOA` (papel `client_admin`) | W1 | Bloqueante |
| CM-08 | Quem mais da CleanSea terá acesso à plataforma? | `LISTA` de `PESSOA` + papel: client_member · viewer | W1 | Importante |

## Bloco 5 · Decisões técnicas (responde: Loop)

| ID | Decisão | Formato | Recomendação atual | Bloqueia | Prioridade |
|---|---|---|---|---|---|
| TD-01 | Banco de dados da plataforma | `DECISÃO`: D1 · Prisma Postgres | D1 agora; Postgres quando houver RAG | W1 | Bloqueante |
| TD-02 | Autenticação | `DECISÃO`: Better Auth · Cloudflare Access · outro | Better Auth (D1, multi-tenant) | W1 | Bloqueante |
| TD-03 | Credencial do Cloudflare para deploy | `CRED` (token com permissão Workers, via canal seguro) | — | W1 | Bloqueante |
| TD-04 | Conta GitHub App "Loop" (dono e permissões) | `DECISÃO` + `PESSOA` | Org LOOPAPPdev, permissão mínima | W1 | Bloqueante |
| TD-05 | Provedor de e-mail transacional | `DECISÃO`: Cloudflare Email · Resend · outro | A decidir | W2 | Importante |
| TD-06 | Modelos de IA dos agentes e limites por tarefa | `TAB` colunas: agente, modelo, custo estimado/1.000 pedidos, motivo | A decidir após OP-03 e OP-18 | W3 | Bloqueante |
| TD-07 | Onde rodam os agentes A0–A3 | `DECISÃO`: repo CleanSea (recomendado) · Loop App | Repo CleanSea | W3 | Bloqueante |
| TD-08 | Domínio do Loop App e rotas por cliente | `TXT` | A decidir | W1 | Importante |
| TD-09 | Política de backup e restauração | `TXT`: frequência, retenção, teste | Diário em R2, teste trimestral | W1 | Bloqueante |
| TD-10 | Ferramentas do STACK.zip habilitadas no projeto | `MULT` | Ver `apps/orchestrator/CLAUDE.md` §1.6 | W1 | Importante |

---

## Checklist de verde por workflow

### W1 · Fundação e deploy

Bloqueantes: SI-05, SI-09, SI-10, CM-01, CM-07, TD-01, TD-02, TD-03, TD-04, TD-09.

```gherkin
Scenario: W1 verde
  GIVEN todos os bloqueantes de W1 estão verdes
  WHEN o deploy roda
  THEN a plataforma responde no domínio definido
  AND o teste de isolamento entre tenants passa no CI
  AND o tenant "cleansea" está ligado ao repositório SI-09
  AND existe um backup restaurado com sucesso
```

### W2 · Loop Diagrama com dados reais

Bloqueantes: OP-01, OP-02, OP-03, OP-04, OP-06, OP-07, OP-11, OP-16, RG-01, RG-02.

```gherkin
Scenario: W2 verde
  GIVEN os bloqueantes de W2 estão verdes
  WHEN o mapa do porto-piloto é gerado a partir dos dados
  THEN pelo menos 60% dos parâmetros têm evidência A ou B
  AND o cliente rodou pelo menos um cenário e registrou comentários
```

### W3 · Proposta, execução e operação (produção)

Bloqueantes: OP-13, OP-14, OP-18, OP-20, OP-21, SI-01, SI-02, SI-03, SI-04, SI-07, RG-03, RG-04, CM-02, CM-03, CM-06, TD-06, TD-07.

```gherkin
Scenario: Verde para produção
  GIVEN os bloqueantes de W1, W2 e W3 estão verdes
  AND a proposta foi aprovada pelo client_admin na plataforma
  WHEN os agentes entram em operação no porto-piloto
  THEN existe medição de linha de base dos KPIs de OP-20
  AND cada documento de RG-04 segue a regra de quem assina
  AND o custo variável está abaixo do teto de CM-04
  AND o suporte de CM-06 está ativo
```

---

## Placar

| Bloco | Itens | Bloqueantes |
|---|---|---|
| 1 · Operação | 21 | 13 |
| 2 · Sistemas e dados | 11 | 8 |
| 3 · Regulação | 4 | 4 |
| 4 · Comercial | 8 | 5 |
| 5 · Técnico | 10 | 7 |
| **Total** | **54** | **37** |

Estado atual: **todos vermelhos**, exceto TD-01, TD-02 e TD-07, que estão **amarelos** (há recomendação, falta sua decisão).
