# LOOP — protótipo de front-end (Claude Design)

Importado do projeto Claude Design `64b44d7d-46bb-4fee-8d3b-fe12c8e57c30` (arquivo `LOOP.dc.html`). Os arquivos estão byte a byte iguais à origem.

| Arquivo | Papel |
|---|---|
| `LOOP.dc.html` | Interface (site, workspace, projetos, descoberta 3×3, organograma, processos, oportunidades, cenários A/B/C, apresentação, verificações). |
| `loop-core.js` | Domínio sem UI: BPM (23 atividades, 7 fases, 5 gates), blocos 3×3, regras de oportunidade, cenários, layout, import/export, adapter `localStorage`, `runSelfTests()`. |
| `support.js` | Runtime `x-dc` (gerado; não editar). Carrega React 18.3.1 e Babel 7.29.0 do unpkg. |

## Abrir

```bash
cd docs/loop-app/design && python3 -m http.server 8000
```

Abra `http://localhost:8000/LOOP.dc.html`. Rotas: `#/`, `#/metodo`, `#/solucoes`, `#/demonstracao`, `#/contato`, `#/app/projetos/demo`, `#/verificacao`. Requer acesso a unpkg.com.

## Verificação

```bash
node -e "global.window={};global.localStorage={getItem:()=>null,setItem(){}};require('./docs/loop-app/design/loop-core.js');const r=window.LOOP.runSelfTests();r.forEach(t=>console.log(t.pass?'PASS':'FAIL',t.name));"
```

Resultado na importação: 13/13 PASS. Renderização conferida em Chromium (1440 px e 390 px, sem rolagem horizontal, sem erros de runtime).

## Limites (declarados no próprio protótipo)

- Modo demo: dados só no navegador; sem backend, autenticação, envio de mensagens ou IA em execução.
- Indicadores quantitativos (tempo de ciclo, custo, ROI) ficam `null`; `SimulationPort` responde `not-implemented`.
- A porta `ProjectRepository` usa `localStorage`; a troca por `HttpProjectRepository` segue `../BACKEND_ARQUITETURA.md`.
