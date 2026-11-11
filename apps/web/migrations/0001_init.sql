-- LOOP · schema inicial (Cloudflare D1 / SQLite). Aplicar com: npx wrangler d1 migrations apply loop-db --remote
-- Regras: toda tabela de negócio tem organization_id; datas em ISO-8601 UTC; ids são texto (prefixo + aleatório).

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  platform_role TEXT CHECK (platform_role IN ('admin')),
  disabled      INTEGER NOT NULL DEFAULT 0 CHECK (disabled IN (0, 1)),
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE sessions (
  id           TEXT PRIMARY KEY,
  token_hash   TEXT NOT NULL UNIQUE,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TEXT NOT NULL,
  expires_at   TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  ip_hash      TEXT
);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE INDEX sessions_expires ON sessions(expires_at);

CREATE TABLE organizations (
  id         TEXT PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('consultancy', 'client')),
  created_at TEXT NOT NULL
);

CREATE TABLE memberships (
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('owner', 'consultant', 'client_admin', 'client_member', 'viewer')),
  created_at      TEXT NOT NULL,
  PRIMARY KEY (organization_id, user_id)
);
CREATE INDEX memberships_user ON memberships(user_id);

-- Projeto = documento LOOP (validado pelo schema Zod em src/domain/schema.ts) + colunas de controle.
CREATE TABLE projects (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  name            TEXT NOT NULL,
  version         INTEGER NOT NULL CHECK (version >= 1),
  archived        INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1)),
  data_json       TEXT NOT NULL,
  created_by      TEXT NOT NULL REFERENCES users(id),
  created_at      TEXT NOT NULL,
  updated_by      TEXT NOT NULL REFERENCES users(id),
  updated_at      TEXT NOT NULL,
  deleted_at      TEXT
);
CREATE INDEX projects_org ON projects(organization_id, updated_at);

-- Histórico: uma linha por versão gravada (snapshot completo; documentos são pequenos).
CREATE TABLE project_revisions (
  project_id TEXT NOT NULL REFERENCES projects(id),
  version    INTEGER NOT NULL,
  data_json  TEXT NOT NULL,
  user_id    TEXT NOT NULL REFERENCES users(id),
  summary    TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (project_id, version)
);

CREATE TABLE audit_log (
  id              TEXT PRIMARY KEY,
  organization_id TEXT,
  user_id         TEXT,
  action          TEXT NOT NULL,
  target          TEXT NOT NULL,
  meta_json       TEXT NOT NULL DEFAULT '{}',
  created_at      TEXT NOT NULL
);
CREATE INDEX audit_org ON audit_log(organization_id, created_at);

CREATE TABLE contact_messages (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  company    TEXT NOT NULL,
  message    TEXT NOT NULL,
  ip_hash    TEXT,
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TEXT NOT NULL
);

CREATE TABLE rate_limits (
  key          TEXT PRIMARY KEY,
  window_start TEXT NOT NULL,
  count        INTEGER NOT NULL
);
