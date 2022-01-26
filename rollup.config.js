import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';

const rollupConfig = [
  // modern bundle
  {
    input: './index.ts',
    output: {
      file: './dist/index.esm.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      resolve({ extensions: ['.ts'], modulesOnly: true }),
      babel({
        babelrc: false,
        configFile: false,
        targets: 'defaults and not IE 11',
        presets: [
          ['@babel/preset-env', { targets: 'defaults and not IE 11' }],
          '@babel/preset-typescript',
        ],
        babelHelpers: 'bundled',
        extensions: ['.ts'],
      }),
    ],
    external: ['react'],
  },
  // cjs node 12 bundle
  {
    input: './index.ts',
    output: {
      file: './dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    plugins: [
      resolve({ extensions: ['.ts'], modulesOnly: true }),
      babel({
        babelrc: false,
        configFile: false,
        targets: 'node 12',
        presets: [
          ['@babel/preset-env', { targets: 'node 12' }],
          '@babel/preset-typescript',
        ],
        babelHelpers: 'bundled',
        extensions: ['.ts'],
      }),
    ],
    external: ['react'],
  },
  // umd bundle
  {
    input: './index.umd.ts',
    output: {
      file: './dist/index.js',
      format: 'umd',
      name: 'PromiseSuspender',
      sourcemap: true,
      globals: {
        react: 'React',
      },
    },
    plugins: [
      resolve({ extensions: ['.ts'] }),
      babel({
        babelrc: false,
        configFile: false,
        targets: 'defaults and IE 11',
        presets: [
          ['@babel/preset-env', { targets: 'defaults and IE 11' }],
          '@babel/preset-typescript',
        ],
        babelHelpers: 'bundled',
        extensions: ['.ts'],
      }),
    ],
    external: ['react'],
  },
];

export default rollupConfig;
