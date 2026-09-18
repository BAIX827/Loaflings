/**
 * Build-time only: compile CORE/SENSE TypeScript into CJS for Electron.
 * Never load tsx/esbuild at app runtime (asar spawn ENOTDIR).
 */
import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

async function build(entry, outfile) {
  await esbuild.build({
    entryPoints: [path.join(root, entry)],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: path.join(root, outfile),
    logLevel: 'info',
  });
}

await build('src/core/index.ts', 'src/desk/runtime/core.cjs');
await build('src/sense/profile.ts', 'src/desk/runtime/sense-profile.cjs');
console.log('[compile-runtime] ok');
