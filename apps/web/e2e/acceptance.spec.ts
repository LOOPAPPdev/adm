import { expect, test, type Page } from '@playwright/test';

// Acceptance paths from the Claude Design handoff (ROUTES_AND_DESIGN_TOKENS.json → acceptancePaths).
const go = async (page: Page, path: string) => { await page.goto(path); await expect(page.locator('main')).toBeVisible(); };
test.beforeEach(async ({ page }) => { await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort()); });

test('project-create-save-refresh', async ({ page }) => {
  await go(page, '/app/projetos');
  await page.getByLabel('Nome', { exact: true }).fill('Projeto E2E');
  await page.getByRole('button', { name: 'Criar e abrir a descoberta' }).click();
  await expect(page).toHaveURL(/\/app\/projetos\/prj_.*\/descoberta/);
  await go(page, '/app/projetos');
  await page.reload();
  await expect(page.getByRole('link', { name: 'Projeto E2E' })).toBeVisible();
});

test('discovery-to-org-chart', async ({ page }) => {
  await go(page, '/app/projetos');
  await page.getByLabel('Nome', { exact: true }).fill('Org E2E');
  await page.getByRole('button', { name: 'Criar e abrir a descoberta' }).click();
  await page.getByRole('button', { name: 'Pessoa / equipe' }).click();
  await page.getByLabel('Nome do nó 1').fill('Diretoria Teste');
  await page.getByLabel('Reporta a (nó 1)').selectOption('top');
  await page.waitForTimeout(500); // autosave debounce
  await page.getByRole('link', { name: 'Organograma' }).click();
  await expect(page.getByRole('figure', { name: 'Organograma do projeto' }).getByText('Diretoria Teste')).toBeVisible();
});

test('process-playback', async ({ page }) => {
  await go(page, '/app/projetos/demo/processos');
  await expect(page.getByTestId('playback-pos')).toContainText('Etapa 1 de 8');
  await page.getByRole('button', { name: 'Próxima etapa' }).click();
  await expect(page.getByTestId('playback-pos')).toContainText('Etapa 2 de 8');
  await page.getByRole('button', { name: 'Reproduzir' }).click();
  await expect(page.getByTestId('playback-pos')).toContainText(/Etapa [3-8] de 8/, { timeout: 4000 });
  await page.getByRole('button', { name: 'Pausar' }).click();
  await expect(page.getByTestId('playback-pos')).toContainText('pausado');
});

test('rule-routing', async ({ page }) => {
  await go(page, '/app/projetos/demo/oportunidades');
  await expect(page.getByTestId('rule-state-R-TRIAGE')).toHaveText('Candidato');
  await expect(page.getByTestId('rule-state-R-CRM')).toHaveText('Pedir confirmação');
  await page.getByTestId('rule-R-TRIAGE').getByRole('button', { name: 'Adicionar ao cenário B' }).click();
  await go(page, '/app/projetos/demo/cenarios');
  await expect(page.getByTestId('diff-list')).toContainText('Triagem automatizada (hipótese)');
});

test('scenario-structural-diff', async ({ page }) => {
  await go(page, '/app/projetos/demo/cenarios');
  await page.getByTestId('scn-step-ac4').getByRole('button', { name: 'Remover' }).click();
  await expect(page.getByTestId('diff-list')).toContainText('REMOVIDO');
  const row = page.getByTestId('metrics-table').getByRole('row', { name: /^Atividades/ });
  await expect(row).toContainText('6');
  await expect(row).toContainText('5');
  await expect(page.getByTestId('metrics-table')).toContainText('não calculável');
});

test('presentation-mode', async ({ page }) => {
  await go(page, '/app/projetos/demo/apresentacao');
  await page.getByRole('button', { name: 'Iniciar apresentação' }).click();
  const dlg = page.getByRole('dialog');
  await expect(dlg).toContainText('1 / 6');
  await page.keyboard.press('ArrowRight');
  await expect(dlg).toContainText('2 / 6');
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
});

test('gate-block', async ({ page }) => {
  await go(page, '/app/projetos/demo/consultoria');
  const accept = page.getByRole('button', { name: 'Aceitar atividade (demo)' });
  await accept.click(); // 5 → 6
  await accept.click(); // 6 → 7
  await accept.click(); // 7 blocked by G1
  await expect(page.getByRole('note').filter({ hasText: 'Bloqueado' })).toContainText('G1');
  await page.getByRole('tab', { name: 'Decisões' }).click();
  await page.getByTestId('gate-G1').getByRole('button', { name: 'Aprovar', exact: true }).click();
  await expect(page.getByTestId('gate-G1')).toContainText('APROVADO');
});

test('invalid-json-reject', async ({ page }) => {
  await go(page, '/app/projetos');
  await page.getByTestId('import-input').setInputFiles({ name: 'ruim.json', mimeType: 'application/json', buffer: Buffer.from('{"name": "x"}') });
  await expect(page.getByTestId('import-errors')).toContainText('discovery');
  await page.getByTestId('import-input').setInputFiles({ name: 'quebrado.json', mimeType: 'application/json', buffer: Buffer.from('{oops') });
  await expect(page.getByTestId('import-errors')).toContainText('JSON malformado');
});

test('self-tests pass in the browser', async ({ page }) => {
  await go(page, '/verificacao');
  await expect(page.getByTestId('selftest-summary')).toHaveText('13 de 13 verificações aprovadas');
});

test('simulation gate blocks quantitative results', async ({ page }) => {
  await go(page, '/app/projetos/demo/sistemas');
  await expect(page.getByTestId('loops')).toContainText('R · reforço');
  await expect(page.getByTestId('sim-gate')).toContainText('not-implemented');
});

test('contact form validates and saves a local draft only', async ({ page }) => {
  await go(page, '/contato');
  await page.getByRole('button', { name: 'Salvar rascunho local' }).click();
  await expect(page.getByText('Informe um e-mail válido.')).toBeVisible();
  await page.getByLabel('Nome').fill('Ana Teste');
  await page.getByLabel('E-mail').fill('ana@example.com');
  await page.getByLabel('Mensagem').fill('Quero ver uma demonstração.');
  await page.getByRole('button', { name: 'Salvar rascunho local' }).click();
  await expect(page.getByText('Rascunho salvo localmente. Não foi enviado.')).toBeVisible();
});

test('portal review records locally', async ({ page }) => {
  await go(page, '/portal/demo');
  await page.getByRole('button', { name: 'O fluxo representa a operação' }).click();
  await expect(page.getByTestId('portal-review')).toContainText('Validação registrada');
});

test('BPMN view renders', async ({ page }) => {
  await go(page, '/app/projetos/demo/processos');
  await page.getByRole('tab', { name: 'BPMN 2.0 (leitura)' }).click();
  await expect(page.locator('.djs-container svg .djs-element').first()).toBeVisible({ timeout: 10000 });
  await expect(page.locator('main [role=alert]')).toHaveCount(0);
});
