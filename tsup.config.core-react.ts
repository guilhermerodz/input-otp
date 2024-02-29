import { defineConfig } from 'tsup';

const entryFiles = [
  'lib/index.ts',
  'lib/core/index.ts',
  'lib/react/index.ts',
]

export default defineConfig({
  clean: false,
  name: 'save input-otp core & react',
  tsconfig: './tsconfig.build.core-react.json',

  external: ['react'],
  entry: [
    '!lib/dist/package.json',
    ...entryFiles,
  ],
  dts: {
    entry: [
      ...entryFiles,
    ],
  },
  outDir: 'lib-dist',
  format: ['cjs', 'esm'],
  sourcemap: true,
  publicDir: false,
  // minify: true,
});
