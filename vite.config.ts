import { defineConfig } from 'vite'
import * as path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

import viteDts from 'vite-plugin-dts'
import viteVue from '@vitejs/plugin-vue'
import viteReact from '@vitejs/plugin-react'
import { svelte as viteSvelte } from '@sveltejs/vite-plugin-svelte';

import { dts as rollupDts } from "rollup-plugin-dts";
import rollupSvelte from 'rollup-plugin-svelte';
import rollupResolve from '@rollup/plugin-node-resolve';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    viteDts({
      include: './lib/**',
    }),
    viteVue(),
    viteReact(),
    viteSvelte(),
  ],
  build: {
    minify: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      name: 'input-otp',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react', 'vue', 'svelte'],
      input: {
        react: 'lib/react/index.ts',
        vue: 'lib/vue/index.ts',
        svelte: 'lib/svelte/index.ts',
      },
      output: {
        entryFileNames: '[name]/index.[format]',
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React',
          vue: 'Vue',
          svelte: 'Svelte',
        },
      },
      plugins: [
        rollupSvelte({
          include: 'lib/svelte/**',
          compilerOptions: {
            generate: 'dom',
            hydratable: true,
            customElement: false,
          }
        }),
        rollupResolve({
          browser: true,
          exportConditions: ['svelte'],
          extensions: ['.svelte'],
        }),
        // rollupDts(),
      ]
    },
    outDir: path.resolve(__dirname, 'lib-dist'),
    copyPublicDir: false,
  },
})
