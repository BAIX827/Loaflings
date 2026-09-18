/**
 * Packaged-app entry. Uses precompiled CJS (npm run compile:runtime).
 * Do not load tsx/esbuild here — asar cannot spawn their workers (ENOTDIR).
 */
require('./main.js');
