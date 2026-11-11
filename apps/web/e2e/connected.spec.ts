import { expect, test, type APIRequestContext, type Browser } from '@playwright/test';

/**
 * Connected mode against the real Worker artifact (wrangler dev + local D1, see playwright.config.ts).
 * Acceptance criteria from the unification ADR:
 *  - a saved project is read back from the backend on another device (fresh browser context);
 *  - a user of another client cannot read it (server rejects);
 *  - an edited diagram persists;
 *  - every unified route answers.
 */
const BASE = 'http://127.0.0.1:8787';
const PW = 'senha-e2e-muito-segura';
const TOKEN = 'local-e2e-token-only';
const run = Date.now().toString(36);

async function api(request: APIRequestContext, method: string, path: string, data?: unknown) {
  const res = await request.fetch(BASE + path, { method, data, headers: { origin: BASE, 'content-type': 'application/json' } });
  return { status: res.status(), body: await res.json().catch(() => ({})) };
}

async function loginUi(browser: Browser, email: string) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await page.goto(BASE + '/entrar');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill(PW);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/app\/projetos$/);
  await expect(page.getByText('Conectado', { exact: true })).toBeVisible();
  return { ctx, page };
}

test.describe.configure({ mode: 'serial' });

let orgA = '', orgB = '';
const consultant = `consultor-${run}@loop.test`;
const outsider = `cliente-${run}@outra.test`;

test('setup: bootstrap (once), organizations and members via API', async ({ request }) => {
  const adminEmail = 'admin-e2e@loop.test';
  const boot = await api(request, 'POST', '/api/v1/auth/bootstrap', { email: adminEmail, name: 'Admin E2E', password: PW, token: TOKEN });
  expect([201, 409]).toContain(boot.status); // 409 when the local database was already bootstrapped
  const login = await api(request, 'POST', '/api/v1/auth/login', { email: adminEmail, password: PW });
  expect(login.status).toBe(200);
  orgA = (await api(request, 'POST', '/api/v1/orgs', { name: `Cliente A ${run}` })).body.organization.id;
  orgB = (await api(request, 'POST', '/api/v1/orgs', { name: `Cliente B ${run}` })).body.organization.id;
  expect((await api(request, 'POST', `/api/v1/orgs/${orgA}/members`, { email: consultant, name: 'Consultor E2E', role: 'consultant', password: PW })).status).toBe(201);
  expect((await api(request, 'POST', `/api/v1/orgs/${orgB}/members`, { email: outsider, name: 'Cliente B', role: 'client_admin', password: PW })).status).toBe(201);
});

let projectUrl = '';

test('GIVEN a project saved WHEN opened on another device THEN the data comes from the backend', async ({ browser }) => {
  const a = await loginUi(browser, consultant);
  // Select organization A explicitly (the consultant belongs to one organization here).
  await a.page.getByLabel('Nome', { exact: true }).fill(`Porto ${run}`);
  await a.page.getByRole('button', { name: 'Criar e abrir a descoberta' }).click();
  await expect(a.page).toHaveURL(/\/app\/projetos\/prj_.*\/descoberta/);
  projectUrl = a.page.url().replace(/\/descoberta$/, '');
  await expect(a.page.getByText(/Salvo no servidor/)).toBeVisible({ timeout: 10_000 });

  // Edit the org chart (a diagram) and wait for the server save.
  await a.page.getByRole('button', { name: 'Pessoa / equipe' }).click();
  await a.page.getByLabel('Nome do nó 1').fill(`Diretoria ${run}`);
  await a.page.getByLabel('Reporta a (nó 1)').selectOption('top');
  await expect(a.page.getByText(/Salvo no servidor às/)).toBeVisible({ timeout: 10_000 });
  await a.page.waitForTimeout(1500);
  await a.ctx.close();

  const b = await loginUi(browser, consultant); // fresh context = another device, no local data
  await b.page.goto(projectUrl + '/organograma');
  await expect(b.page.getByRole('figure', { name: 'Organograma do projeto' }).getByText(`Diretoria ${run}`)).toBeVisible({ timeout: 10_000 });
  await b.ctx.close();
});

test('GIVEN a user of another client WHEN requesting the project THEN the server rejects access', async ({ request }) => {
  const id = projectUrl.split('/').pop()!;
  expect((await api(request, 'POST', '/api/v1/auth/login', { email: outsider, password: PW })).status).toBe(200);
  expect((await api(request, 'GET', `/api/v1/projects/${id}`)).status).toBe(404);
  const list = await api(request, 'GET', '/api/v1/projects');
  expect(list.body.projects.map((p: { project: { id: string } }) => p.project.id)).not.toContain(id);
  const put = await request.fetch(`${BASE}/api/v1/projects/${id}`, { method: 'PUT', data: { name: 'x' }, headers: { origin: BASE, 'if-match': '"1"' } });
  expect(put.status()).toBe(404);
});

test('history lists versions and restores an older one as a new version', async ({ browser }) => {
  const a = await loginUi(browser, consultant);
  await a.page.goto(projectUrl + '/historico');
  const rows = a.page.locator('tbody tr');
  await expect(rows.first()).toBeVisible({ timeout: 10_000 });
  const before = await rows.count();
  expect(before).toBeGreaterThan(1);
  await rows.last().getByRole('button', { name: 'Restaurar' }).click();
  await expect(a.page.getByText(/Versão 1 restaurada como versão/)).toBeVisible({ timeout: 10_000 });
  await expect(rows.first()).toContainText('Restaurada a versão 1');
  await expect(rows).toHaveCount(before + 1);
  await a.ctx.close();
});

test('admin screen creates an organization and adds a member', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(BASE + '/entrar');
  await page.getByLabel('E-mail').fill('admin-e2e@loop.test');
  await page.getByLabel('Senha').fill(PW);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByText('Conectado', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Administração' }).click();
  await page.getByLabel('Nova organização (cliente)').fill(`Cliente UI ${run}`);
  await page.getByRole('button', { name: 'Criar organização' }).click();
  await expect(page.getByText(`Organização Cliente UI ${run} criada.`)).toBeVisible();
  await expect(page.locator('#admin-org option:checked')).toHaveText(`Cliente UI ${run}`);
  await page.getByLabel('Nome', { exact: true }).fill('Pessoa UI');
  await page.getByLabel('E-mail', { exact: true }).fill(`pessoa-${run}@ui.test`);
  await page.getByLabel(/Senha inicial/).fill(PW);
  await page.getByRole('button', { name: 'Salvar membro' }).click();
  await expect(page.getByRole('cell', { name: `pessoa-${run}@ui.test` })).toBeVisible();
  await ctx.close();
});

test('setup page is closed once an administrator exists', async ({ page, request }) => {
  expect((await request.get(BASE + '/api/v1/auth/bootstrap')).ok()).toBe(true);
  expect((await (await request.get(BASE + '/api/v1/auth/bootstrap')).json()).open).toBe(false);
  await page.goto(BASE + '/configurar');
  await expect(page.getByRole('heading', { name: 'Configuração já concluída' })).toBeVisible();
});

test('without a session the API refuses and the app stays in demo mode', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  expect((await page.request.get(BASE + '/api/v1/projects')).status()).toBe(401);
  await page.goto(BASE + '/app/projetos');
  await expect(page.getByText('Modo demonstração')).toBeVisible();
  await ctx.close();
});

test('every unified route answers on the Worker', async ({ request }) => {
  for (const path of ['/', '/metodo', '/solucoes', '/demonstracao', '/app', '/app/projetos', '/studio', '/portal/demo', '/directory', '/entrar', '/api/v1/health']) {
    expect((await request.get(BASE + path)).status(), path).toBe(200);
  }
});
