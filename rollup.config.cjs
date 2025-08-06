import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json' assert { type: 'json ' };

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'bin',
        format: 'cjs',
        banner: '#!/usr/bin/env node',
      },
    ],
    plugins: [
      replace({
        __PACKAGE_NAME: pkg?.name,
        __PACKAGE_VERSION: pkg?.version,
      }),
      typescript({
        clean: true,
        useTsconfigDeclarationDir: true,
      }),
      terser(),
    ],
  },
];
