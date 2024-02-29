import { defineConfig } from 'tsup';

import esbuildVue from 'esbuild-plugin-vue3'
import esbuildSvelte from 'esbuild-svelte'

import sveltePreprocess from "svelte-preprocess";

export default defineConfig({
  clean: true,
  name: 'save input-otp',
  tsconfig: './tsconfig.build.json',

  external: ['react', 'vue', 'svelte'],
  entry: ['!lib/dist/package.json', 'lib/index.ts', 'lib/react/index.ts'],
  outDir: 'lib-dist',
  format: ['cjs', 'esm'],
  sourcemap: true,
  publicDir: false,
  dts: true, // Fails with vue
  // minify: true,

  esbuildPlugins: [
    esbuildVue(),
    esbuildSvelte({
      preprocess: sveltePreprocess({
        typescript: {
          tsconfigFile: './tsconfig.build',
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
