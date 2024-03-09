import { withHydrationOverlay } from '@builder.io/react-hydration-overlay/next'

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default withHydrationOverlay({
  appRootSelector: 'main',
})(nextConfig)
