import { join } from 'node:path'
import { cwd } from 'node:process'

import type { BuildOptions } from 'esbuild'

import type { EntryPoint } from '../utils/getEntryPoints.js'

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
  outdir: join(cwd(), '.metaframework', 'public'),
}

export const SERVER_OPTIONS: BuildOptions = {
  ...BASE_OPTIONS,
  metafile: true,
  platform: 'node',
  packages: 'external',
  outdir: join(cwd(), '.metaframework', 'server'),
}

const SERVER_PATH = join(
  'node_modules',
  'metaframework',
  'dist',
  'lib',
  'server',
)
export const SERVER_ENTRY: EntryPoint = {
  in: join(SERVER_PATH, 'index.js'),
  out: 'index',
}
export const BOOTSTRAP_ENTRY: EntryPoint = {
  in: join(SERVER_PATH, 'bootstrap.js'),
  out: 'bootstrap',
}
