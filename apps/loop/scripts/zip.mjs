// Builds release/loop-v1.0.zip: source code + production build (dist/) + docs. Requires the `zip` CLI.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
if (!existsSync(resolve(root, 'dist/index.html'))) { console.error('dist/ ausente: rode "npm run build" antes.'); process.exit(1); }
mkdirSync(resolve(root, 'release'), { recursive: true });
const out = resolve(root, 'release/loop-v1.0.zip');
rmSync(out, { force: true });
const include = ['README.md', 'RELATORIO.md', 'package.json', 'index.html', 'tsconfig.json', 'vite.config.ts', 'playwright.config.ts', '.gitignore', 'src', 'e2e', 'public', 'models', 'scripts', 'dist'];
execFileSync('zip', ['-rq', '-X', out, ...include.filter(f => existsSync(resolve(root, f))), '-x', '*.DS_Store'], { cwd: root, stdio: 'inherit' });
console.log('Gerado:', out);
