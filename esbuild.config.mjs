import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  platform: 'browser',
  mainFields: ['browser', 'module', 'main'],
  external: ['obsidian'],
  format: 'cjs',
  outfile: 'main.js',
});
