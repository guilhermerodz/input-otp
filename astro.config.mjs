import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@astrojs/react'
import svelte from '@astrojs/svelte'
import tailwind from '@astrojs/tailwind'
import vue from '@astrojs/vue'
import vercel from '@astrojs/vercel/serverless';
import { defineConfig } from 'astro/config'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    build: {
      rollupOptions: {
        external: [
          path.resolve(__dirname, 'src', 'pages', 'example'),
          path.resolve(__dirname, 'src', 'pages', 'test')
        ]
      }
    },
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    vue(),
    react(),
    svelte(),
  ],
})
