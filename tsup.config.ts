import { defineConfig } from 'tsup';

import esbuildVue from 'unplugin-vue/esbuild'
// import esbuildVue from 'esbuild-plugin-vue3'

export default defineConfig({
  clean: true,
  name: 'save input-otp',
  tsconfig: './tsconfig.build.json',

  external: ['react', 'vue'],
  entry: [
    '!lib/dist/package.json',
    'lib/index.ts',
    'lib/react/index.ts',
    'lib/vue/index.ts',
    'lib/svelte/index.ts'
  ],
  dts: {
    entry: [
      'lib/index.ts',
      'lib/react/index.ts',
      // 'lib/vue/index.ts', // Doesn't work
    ],
  },
  outDir: 'lib-dist',
  format: ['cjs', 'esm'],
  sourcemap: true,
  publicDir: false,
  // minify: true,

  esbuildPlugins: [
    esbuildVue({
      isProduction: true,
    }),
  ]
});
