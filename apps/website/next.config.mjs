import { withHydrationOverlay } from '@builder.io/react-hydration-overlay/next'

/** @type {import('next').NextConfig} */
const nextProdConfig = {}

const nextDevConfig = withHydrationOverlay({
  appRootSelector: 'main',
})({
  ...nextProdConfig,
  // Keep `next dev` out of `.next` so a concurrent `next build` (`pnpm build`,
  // `pnpm build:website`) can't delete the server chunks this process is still
  // serving — that's what causes `Cannot find module './52.js'` on hot reload.
  distDir: '.next-dev',
})

export default process.env.NODE_ENV === 'development'
  ? nextDevConfig
  : nextProdConfig
