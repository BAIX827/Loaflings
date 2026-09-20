import { spawnSync } from 'node:child_process';

if (process.platform !== 'darwin') {
  console.log('[postinstall] skip Electron native rebuild: Loaflings packages on macOS');
  process.exit(0);
}

const command = process.platform === 'win32' ? 'electron-builder.cmd' : 'electron-builder';
const result = spawnSync(command, ['install-app-deps'], {
  stdio: 'inherit',
  shell: false,
});

if (result.error) {
  console.warn('[postinstall] native dependency rebuild could not start:', result.error.message);
} else if (result.status !== 0) {
  console.warn(`[postinstall] native dependency rebuild exited with ${result.status}; run npm run rebuild:sense on the target Mac if needed`);
}

// Keep install usable for docs/tests even when an optional native rebuild fails.
process.exit(0);
