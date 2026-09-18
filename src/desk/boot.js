/**
 * Packaged-app entry: register tsx so CORE/SENSE .ts modules load,
 * then hand off to the Electron companion (main.js).
 * Dev still uses `electron -r tsx/cjs .` (package.json scripts).
 */
try {
  require('tsx/cjs');
} catch (err) {
  console.error('[loaflings] tsx/cjs required for CORE/SENSE TypeScript', err);
  throw err;
}
require('./main.js');
