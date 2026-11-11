/**
 * Backend acceptance tests (services + Route Handlers) against the real migrations on node:sqlite.
 * Covers: bootstrap and login, sessions, tenant isolation, role limits, optimistic concurrency,
 * persistence across sessions ("another device"), history, contact rate limit, same-origin writes.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { newProject } from '@/domain/model';
import { setCtxOverride } from '@/server/infra/env';
import { testCtx } from '@/server/testing/sqlite-db';
import { bootstrap, currentUser, login } from '@/server/services/auth';
import { addMember, createOrg } from '@/server/services/orgs';
import { createProject, getProject, projectHistory, saveProject, listProjects } from '@/server/services/projects';
import { submitContact } from '@/server/services/contact';
import * as loginRoute from '@/app/api/v1/auth/login/route';
import * as meRoute from '@/app/api/v1/auth/me/route';
import * as projectRoute from '@/app/api/v1/projects/[id]/route';
import * as projectsRoute from '@/app/api/v1/projects/route';

const PW = 'senha-muito-segura-123';
type T = ReturnType<typeof testCtx>;

async function world() {
  const ctx = testCtx();
  const adminS = await bootstrap(ctx, { email: 'admin@loop.test', name: 'Admin', password: PW, token: 'test-bootstrap-token' }, null);
  const admin = (await currentUser(ctx, adminS.token))!;
  const acme = await createOrg(ctx, admin, { name: 'Acme Portos' });
  const other = await createOrg(ctx, admin, { name: 'Outra Empresa' });
  await addMember(ctx, admin, acme.id, { email: 'consultor@loop.test', name: 'Consultor', role: 'consultant', password: PW });
  await addMember(ctx, admin, acme.id, { email: 'cliente@acme.test', name: 'Cliente', role: 'client_member', password: PW });
  await addMember(ctx, admin, acme.id, { email: 'leitor@acme.test', name: 'Leitor', role: 'viewer', password: PW });
  await addMember(ctx, admin, other.id, { email: 'estranho@outra.test', name: 'Estranho', role: 'client_admin', password: PW });
  const as = async (email: string) => (await currentUser(ctx, (await login(ctx, { email, password: PW }, null)).token))!;
  return { ctx, admin, acme, other, as };
}

describe('autenticação', () => {
  it('bootstrap só funciona uma vez e exige o token', async () => {
    const ctx = testCtx();
    await expect(bootstrap(ctx, { email: 'a@b.test', name: 'A', password: PW, token: 'errado' }, null)).rejects.toMatchObject({ status: 403 });
    await bootstrap(ctx, { email: 'a@b.test', name: 'A', password: PW, token: 'test-bootstrap-token' }, null);
    await expect(bootstrap(ctx, { email: 'c@d.test', name: 'C', password: PW, token: 'test-bootstrap-token' }, null)).rejects.toMatchObject({ status: 409 });
  });

  it('bootstrap desativado sem segredo configurado', async () => {
    const ctx = { ...testCtx(), bootstrapToken: undefined };
    await expect(bootstrap(ctx, { email: 'a@b.test', name: 'A', password: PW, token: 'x' }, null)).rejects.toMatchObject({ status: 403 });
  });

  it('senha errada é recusada e bloqueia após 5 tentativas', async () => {
    const { ctx } = await world();
    for (let i = 0; i < 5; i++) await expect(login(ctx, { email: 'cliente@acme.test', password: 'errada' }, null)).rejects.toMatchObject({ status: 401 });
    await expect(login(ctx, { email: 'cliente@acme.test', password: PW }, null)).rejects.toMatchObject({ status: 429 });
  });

  it('senha é guardada como hash PBKDF2, nunca em texto', async () => {
    const { ctx } = await world();
    const row = await ctx.db.prepare('SELECT password_hash FROM users WHERE email = ?').bind('cliente@acme.test').first<{ password_hash: string }>();
    expect(row!.password_hash.startsWith('pbkdf2$100000$')).toBe(true);
    expect(row!.password_hash).not.toContain(PW);
  });

  it('sessão expirada não autentica', async () => {
    const ctx = testCtx();
    const s = await bootstrap(ctx, { email: 'a@b.test', name: 'A', password: PW, token: 'test-bootstrap-token' }, null);
    const later = { ...ctx, now: () => new Date('2026-12-30T00:00:00Z') };
    expect(await currentUser(later, s.token)).toBeNull();
  });
});

describe('projetos e permissões', () => {
  let w: Awaited<ReturnType<typeof world>>;
  beforeEach(async () => { w = await world(); });

  it('GIVEN um projeto WHEN aberto em outra sessão (outro dispositivo) THEN os dados vêm do backend', async () => {
    const consultor = await w.as('consultor@loop.test');
    const created = await createProject(w.ctx, consultor, { organizationId: w.acme.id, project: newProject('Porto piloto') });
    const outraSessao = await w.as('consultor@loop.test');
    const got = await getProject(w.ctx, outraSessao, created.project.id);
    expect(got.project.name).toBe('Porto piloto');
    expect(got.version).toBe(1);
  });

  it('GIVEN usuário de outro cliente WHEN pede o projeto THEN o servidor recusa (404, sem revelar existência)', async () => {
    const consultor = await w.as('consultor@loop.test');
    const p = await createProject(w.ctx, consultor, { organizationId: w.acme.id, project: newProject('Sigiloso') });
    const estranho = await w.as('estranho@outra.test');
    await expect(getProject(w.ctx, estranho, p.project.id)).rejects.toMatchObject({ status: 404 });
    expect(await listProjects(w.ctx, estranho)).toHaveLength(0);
    await expect(saveProject(w.ctx, estranho, p.project.id, 1, p.project)).rejects.toMatchObject({ status: 404 });
  });

  it('GIVEN um diagrama WHEN editado e salvo THEN a alteração persiste e entra no histórico', async () => {
    const consultor = await w.as('consultor@loop.test');
    const p = await createProject(w.ctx, consultor, { organizationId: w.acme.id, project: newProject('Fluxo') });
    const doc = { ...p.project, people: [{ id: 'p1', name: 'Diretoria', role: 'Direção', kind: 'area' as const, reportsTo: 'top' }], activities: [{ id: 'a1', label: 'Receber pedido', type: 'task' as const, ownerId: 'p1' }] };
    const saved = await saveProject(w.ctx, consultor, p.project.id, 1, doc);
    expect(saved.version).toBe(2);
    const reread = await getProject(w.ctx, await w.as('consultor@loop.test'), p.project.id);
    expect(reread.project.activities[0].label).toBe('Receber pedido');
    const hist = await projectHistory(w.ctx, consultor, p.project.id);
    expect(hist.map(h => h.version)).toEqual([2, 1]);
    expect(hist[0].summary).toContain('organograma');
    expect(hist[0].summary).toContain('processos');
  });

  it('conflito de versão devolve 409 e não sobrescreve', async () => {
    const consultor = await w.as('consultor@loop.test');
    const p = await createProject(w.ctx, consultor, { organizationId: w.acme.id, project: newProject('Concorrência') });
    await saveProject(w.ctx, consultor, p.project.id, 1, { ...p.project, name: 'Versão A' });
    await expect(saveProject(w.ctx, consultor, p.project.id, 1, { ...p.project, name: 'Versão B' })).rejects.toMatchObject({ status: 409 });
    expect((await getProject(w.ctx, consultor, p.project.id)).project.name).toBe('Versão A');
  });

  it('cliente só registra a validação do portal; leitor não altera nada', async () => {
    const consultor = await w.as('consultor@loop.test');
    const p = await createProject(w.ctx, consultor, { organizationId: w.acme.id, project: newProject('Portal') });
    const cliente = await w.as('cliente@acme.test');
    await expect(saveProject(w.ctx, cliente, p.project.id, 1, { ...p.project, name: 'Invadido' })).rejects.toMatchObject({ status: 403 });
    const ok = await saveProject(w.ctx, cliente, p.project.id, 1, { ...p.project, portalReview: 'ok' });
    expect(ok.project.portalReview).toBe('ok');
    const leitor = await w.as('leitor@acme.test');
    await expect(saveProject(w.ctx, leitor, p.project.id, 2, { ...ok.project, portalReview: 'adjust' })).rejects.toMatchObject({ status: 403 });
    await expect(createProject(w.ctx, cliente, { organizationId: w.acme.id, project: newProject('X') })).rejects.toMatchObject({ status: 403 });
  });

  it('id de projeto excluído não é reutilizado e documento gigante é recusado', async () => {
    const admin = w.admin;
    const p = await createProject(w.ctx, admin, { organizationId: w.acme.id, project: { ...newProject('Antigo'), id: 'prj_fixo' } });
    const { deleteProject } = await import('@/server/services/projects');
    await deleteProject(w.ctx, admin, p.project.id);
    const again = await createProject(w.ctx, admin, { organizationId: w.acme.id, project: { ...newProject('Novo'), id: 'prj_fixo' } });
    expect(again.project.id).not.toBe('prj_fixo');
    const big = { ...newProject('Grande'), people: Array.from({ length: 12000 }, (_, i) => ({ id: `p${i}`, name: 'x'.repeat(80), role: 'r', kind: 'pessoa' as const, reportsTo: 'top' })) };
    await expect(createProject(w.ctx, admin, { organizationId: w.acme.id, project: big })).rejects.toMatchObject({ status: 413 });
  });

  it('restaurar uma versão cria versão nova com o conteúdo antigo; cliente não restaura', async () => {
    const { restoreRevision } = await import('@/server/services/projects');
    const consultor = await w.as('consultor@loop.test');
    const p = await createProject(w.ctx, consultor, { organizationId: w.acme.id, project: newProject('Original') });
    await saveProject(w.ctx, consultor, p.project.id, 1, { ...p.project, name: 'Alterado' });
    const cliente = await w.as('cliente@acme.test');
    await expect(restoreRevision(w.ctx, cliente, p.project.id, 1, 2)).rejects.toMatchObject({ status: 403 });
    await expect(restoreRevision(w.ctx, consultor, p.project.id, 1, 1)).rejects.toMatchObject({ status: 409 });
    await expect(restoreRevision(w.ctx, consultor, p.project.id, 99, 2)).rejects.toMatchObject({ status: 404 });
    const r = await restoreRevision(w.ctx, consultor, p.project.id, 1, 2);
    expect(r.version).toBe(3);
    expect(r.project.name).toBe('Original');
    const hist = await projectHistory(w.ctx, consultor, p.project.id);
    expect(hist[0]).toMatchObject({ version: 3, summary: 'Restaurada a versão 1' });
    expect(hist).toHaveLength(3);
  });

  it('documento inválido é recusado com a lista de problemas', async () => {
    const consultor = await w.as('consultor@loop.test');
    await expect(createProject(w.ctx, consultor, { organizationId: w.acme.id, project: { name: '' } })).rejects.toMatchObject({ status: 422 });
  });

  it('consultor não concede papel de owner; cliente admin só concede papéis de cliente', async () => {
    const consultor = await w.as('consultor@loop.test');
    await expect(addMember(w.ctx, consultor, w.acme.id, { email: 'x@y.test', name: 'X', role: 'owner', password: PW })).rejects.toMatchObject({ status: 403 });
    const estranho = await w.as('estranho@outra.test');
    await expect(addMember(w.ctx, estranho, w.other.id, { email: 'z@y.test', name: 'Z', role: 'consultant', password: PW })).rejects.toMatchObject({ status: 403 });
    await expect(addMember(w.ctx, estranho, w.acme.id, { email: 'z@y.test', name: 'Z', role: 'viewer', password: PW })).rejects.toMatchObject({ status: 404 });
  });
});

describe('contato', () => {
  it('grava a mensagem e limita 10 por hora por IP', async () => {
    const ctx: T = testCtx();
    const msg = { nome: 'Ana', email: 'ana@x.test', empresa: 'X', msg: 'Quero conhecer o método.' };
    for (let i = 0; i < 10; i++) await submitContact(ctx, msg, 'ip1');
    await expect(submitContact(ctx, msg, 'ip1')).rejects.toMatchObject({ status: 429 });
    await expect(submitContact(ctx, { ...msg, website: 'spam' }, 'ip2')).rejects.toMatchObject({ status: 422 });
  });
});

describe('Route Handlers /api/v1', () => {
  const origin = 'http://loop.test';
  const req = (path: string, init: { method?: string; body?: unknown; cookie?: string; origin?: string | null; headers?: Record<string, string> } = {}) =>
    new NextRequest(origin + path, {
      method: init.method ?? 'GET',
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      headers: { host: 'loop.test', 'content-type': 'application/json', ...(init.origin === null ? {} : { origin: init.origin ?? origin }), ...(init.cookie ? { cookie: init.cookie } : {}), ...init.headers }
    });
  const params = (id: string) => ({ params: Promise.resolve({ id }) });

  it('login define cookie HttpOnly; me e projetos exigem sessão; PUT exige If-Match; escrita de outra origem é recusada', async () => {
    const w = await world();
    setCtxOverride(w.ctx);
    try {
      expect((await meRoute.GET(req('/api/v1/auth/me'))).status).toBe(401);
      const bad = await loginRoute.POST(req('/api/v1/auth/login', { method: 'POST', body: { email: 'consultor@loop.test', password: PW }, origin: 'https://evil.test' }));
      expect(bad.status).toBe(403);
      const res = await loginRoute.POST(req('/api/v1/auth/login', { method: 'POST', body: { email: 'consultor@loop.test', password: PW } }));
      expect(res.status).toBe(200);
      const setCookie = res.headers.get('set-cookie') ?? '';
      expect(setCookie).toMatch(/loop_session=/);
      expect(setCookie.toLowerCase()).toContain('httponly');
      expect(setCookie.toLowerCase()).toContain('samesite=lax');
      const cookie = setCookie.split(';')[0];
      const me = (await (await meRoute.GET(req('/api/v1/auth/me', { cookie }))).json()) as { organizations: { slug: string }[] };
      expect(me.organizations.map((o: { slug: string }) => o.slug)).toContain('acme-portos');

      const created = await projectsRoute.POST(req('/api/v1/projects', { method: 'POST', cookie, body: { organizationId: w.acme.id, project: newProject('Via API') } }));
      expect(created.status).toBe(201);
      const dto = (await created.json()) as { project: ReturnType<typeof newProject> };
      const noVersion = await projectRoute.PUT(req(`/api/v1/projects/${dto.project.id}`, { method: 'PUT', cookie, body: dto.project }), params(dto.project.id));
      expect(noVersion.status).toBe(428);
      const put = await projectRoute.PUT(req(`/api/v1/projects/${dto.project.id}`, { method: 'PUT', cookie, body: { ...dto.project, name: 'Renomeado' }, headers: { 'if-match': '"1"' } }), params(dto.project.id));
      expect(put.status).toBe(200);
      expect(put.headers.get('etag')).toBe('"2"');
      expect(put.headers.get('cache-control')).toBe('no-store');
    } finally {
      setCtxOverride(null);
    }
  });
});
