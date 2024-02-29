import { defineConfig } from 'tsup';

import esbuildVue from 'unplugin-vue/esbuild'
// import esbuildVue from 'esbuild-plugin-vue3'
import esbuildSvelte from 'esbuild-svelte'

import sveltePreprocess from "svelte-preprocess";

export default defineConfig({
  clean: true,
  name: 'save input-otp',
  tsconfig: './tsconfig.build.json',

  external: ['react', 'vue', 'svelte'],
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
      // 'lib/svelte/index.ts', // Doesn't work
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
    esbuildSvelte({
      preprocess: sveltePreprocess({
        typescript: {
          tsconfigDirectory: './',
          tsconfigFile: './tsconfig.build.json',
          // compilerOptions: {
          //   "preserveValueImports": false,
          //   "verbatimModuleSyntax": false,
          // }
          // handleMixedImports: false,
        }
      }),
    })
  ]
});
