
await Promise.all([
   Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'browser',
    format: 'iife',
    minify: true,
    sourcemap: 'linked',
    naming: 'country-coder.iife.[ext]'  // .iife.js
  }),

  Bun.build({
    entrypoints: ['./src/country-coder.ts'],
    outdir: './dist',
    target: 'node',
    format: 'cjs',
    sourcemap: 'linked',
    external: ['which-polygon'],
    naming: 'country-coder.c[ext]'  // .cjs
  }),

  Bun.build({
    entrypoints: ['./src/country-coder.ts'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
    sourcemap: 'linked',
    external: ['which-polygon'],
    naming: 'country-coder.m[ext]'  // .mjs
  })
]);
