import typescript from '@rollup/plugin-typescript';
import svelte from 'rollup-plugin-svelte';
import _svelteDts from 'svelte-dts';
import autoPreprocess from 'svelte-preprocess';

/** @type {typeof _svelteDts} */
const svelteDts = _svelteDts.default;

/** @type {import('rollup').RollupOptions} */
const options = [
  {
    input: 'lib/svelte',
    output: {
      dir: 'lib-dist/svelte',
    },
    external: ['svelte/internal'],
    plugins: [svelteDts(), svelte({ preprocess: autoPreprocess() }), typescript({
      tsconfig: 'tsconfig.build.svelte.json'
    })],
  },
];

export default options