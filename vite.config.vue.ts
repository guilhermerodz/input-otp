import { defineConfig } from 'vite'
import * as path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

import viteDts from 'vite-plugin-dts'
import viteVue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    viteVue(),
    viteDts({
      include: './lib/vue/**',
    }),
  ],
  build: {
    emptyOutDir: false,
    outDir: path.resolve(__dirname, 'lib-dist'),
    copyPublicDir: false,
    minify: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      name: 'input-otp',
      // formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue'],
      input: {
        vue: 'lib/vue/index.ts',
      },
      output: [
        {
          format: 'cjs',
          entryFileNames: '[name]/index.[format]',
          globals: {
            vue: 'Vue',
          },
        },
        {
          format: 'esm',
          entryFileNames: '[name]/index.js',
          globals: {
            vue: 'Vue',
          },
        },
      ],
    },
  },
})
