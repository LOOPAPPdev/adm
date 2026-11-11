/**
 * Minimal database port. Cloudflare D1 implements it in production; tests use a node:sqlite adapter
 * (src/server/testing/sqlite-db.ts). Only these methods are used, so any SQLite driver can stand in.
 */
export interface Stmt {
  bind(...values: unknown[]): Stmt;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes?: number } }>;
}
export interface Db {
  prepare(sql: string): Stmt;
  batch(stmts: Stmt[]): Promise<unknown[]>;
}

export interface Ctx {
  db: Db;
  now: () => Date;
  bootstrapToken?: string;
}
