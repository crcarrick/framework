import { join } from 'node:path'
import { cwd } from 'node:process'

import type { BuildOptions } from 'esbuild'

import { FrameworkPlugin } from './plugin.js'

const BASE_OPTIONS: BuildOptions = {
  bundle: true,
  format: 'esm',
  splitting: true,
  plugins: [FrameworkPlugin],
  loader: {
    '.js': 'jsx',
    '.ts': 'tsx',
  },
}

export const CLIENT_OPTIONS: BuildOptions = {
  ...BASE_OPTIONS,
  platform: 'browser',
  outdir: join(cwd(), '.framework', 'public'),
}

export const SERVER_OPTIONS: BuildOptions = {
  ...BASE_OPTIONS,
  metafile: true,
  platform: 'node',
  packages: 'external',
  outdir: join(cwd(), '.framework', 'server'),
}
