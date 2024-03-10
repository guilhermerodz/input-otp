import { withHydrationOverlay } from '@builder.io/react-hydration-overlay/next'

/** @type {import('next').NextConfig} */
const nextProdConfig = {}

const nextDevConfig = withHydrationOverlay({
  appRootSelector: 'main',
})(nextProdConfig)

export default process.env.NODE_ENV === 'development'
  ? nextDevConfig
  : nextProdConfig
