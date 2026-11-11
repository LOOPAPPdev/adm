import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/metodo', '/contato', '/app/projetos', '/app/projetos/demo', '/app/projetos/demo/descoberta', '/app/projetos/demo/processos', '/app/projetos/demo/cenarios', '/portal/demo'];

test('no horizontal page scroll at phone width', async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  for (const r of ROUTES) {
    await page.goto(r);
    await expect(page.locator('main')).toBeVisible();
    await page.waitForTimeout(300);
    const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    expect(sw, `overflow on ${r}`).toBeLessThanOrEqual(cw);
  }
});
