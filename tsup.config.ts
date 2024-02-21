import { defineConfig } from 'tsup';

export default defineConfig({
  name: 'save input-otp',
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  outDir: 'dist',
  clean: true,
  sourcemap: true,
});
