/**
 * Test double for Cloudflare D1 built on node:sqlite (Node ≥ 22.5). It runs the real migrations from
 * apps/web/migrations, so the tests exercise the same SQL and constraints as production.
 */
import { DatabaseSync } from 'node:sqlite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Ctx, Db, Stmt } from '../infra/db';

const norm = (v: unknown) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v);

class SqliteStmt implements Stmt {
  constructor(private db: DatabaseSync, private sql: string, private args: unknown[] = []) {}
  bind(...values: unknown[]) { return new SqliteStmt(this.db, this.sql, values.map(norm)); }
  async first<T>() { return ((this.db.prepare(this.sql).get(...(this.args as never[])) as T | undefined) ?? null); }
  async all<T>() { return { results: this.db.prepare(this.sql).all(...(this.args as never[])) as T[] }; }
  async run() { const r = this.db.prepare(this.sql).run(...(this.args as never[])); return { meta: { changes: Number(r.changes) } }; }
  runSync() { return this.db.prepare(this.sql).run(...(this.args as never[])); }
}

export function sqliteDb(): Db & { raw: DatabaseSync } {
  const raw = new DatabaseSync(':memory:');
  raw.exec('PRAGMA foreign_keys = ON;');
  const dir = join(__dirname, '../../../migrations');
  for (const f of readdirSync(dir).filter(f => f.endsWith('.sql')).sort()) raw.exec(readFileSync(join(dir, f), 'utf8'));
  return {
    raw,
    prepare: (sql: string) => new SqliteStmt(raw, sql),
    async batch(stmts: Stmt[]) {
      raw.exec('BEGIN');
      try { const out = stmts.map(s => (s as SqliteStmt).runSync()); raw.exec('COMMIT'); return out; } catch (e) { raw.exec('ROLLBACK'); throw e; }
    }
  };
}

export function testCtx(opts: { now?: Date; bootstrapToken?: string } = {}): Ctx & { db: ReturnType<typeof sqliteDb> } {
  let t = opts.now ?? new Date('2026-11-11T12:00:00Z');
  return { db: sqliteDb(), now: () => (t = new Date(t.getTime() + 1000)), bootstrapToken: opts.bootstrapToken ?? 'test-bootstrap-token' };
}
