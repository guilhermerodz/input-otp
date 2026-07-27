/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep `next dev` out of `.next` so a concurrent `next build` (`pnpm build`)
  // can't delete the server chunks this process is still serving — that's what
  // causes `Cannot find module './52.js'` on hot reload.
  ...(process.env.NODE_ENV === 'development' ? { distDir: '.next-dev' } : {}),
};

export default nextConfig;
