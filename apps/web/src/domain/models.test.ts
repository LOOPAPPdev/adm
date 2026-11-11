/**
 * Keeps /models in sync with the domain. Regenerate with: UPDATE_MODELS=1 npx vitest run models
 */
import { describe, expect, it } from 'vitest';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { Project } from './schema';
import { exportEnvelope, seedCleanSea, seedDemo } from './model';

const dir = resolve(__dirname, '../../models');
const stable = <T extends { createdAt: string; updatedAt: string; id: string }>(p: T, id: string) => ({ ...p, id, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' });
const files: Record<string, unknown> = {
  'loop.project.schema.json': z.toJSONSchema(Project, { io: 'input', unrepresentable: 'any' }),
  'example-demo.loop.json': { ...exportEnvelope(stable(seedDemo(), 'demo')), exportedAt: '2026-01-01T00:00:00.000Z' },
  'template-cleansea.loop.json': { ...exportEnvelope(stable(seedCleanSea(), 'cleansea-template')), exportedAt: '2026-01-01T00:00:00.000Z' }
};

describe('models/ estão sincronizados com o domínio', () => {
  for (const [name, data] of Object.entries(files)) {
    it(name, () => {
      const text = JSON.stringify(data, null, 2) + '\n', path = resolve(dir, name);
      if (process.env.UPDATE_MODELS || !existsSync(path)) writeFileSync(path, text);
      expect(readFileSync(path, 'utf8')).toBe(text);
    });
  }
});
