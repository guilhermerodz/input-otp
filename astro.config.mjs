import react from '@astrojs/react'
import svelte from '@astrojs/svelte'
import tailwind from '@astrojs/tailwind'
import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    vue(),
    react(),
    svelte(),
  ],
})
