import { parse } from 'node:path'

import { findUp } from 'find-up'

import type { DefaultImport } from '../../types.js'

export interface Config {
  port: number
  routing?: 'filesystem' | 'entries'
}

const defaultConfig: Config = {
  port: 3000,
  routing: 'filesystem',
}

type ConfigExt = '.js' | '.cjs' | '.json'
type ImportedConfig<T extends ConfigExt> = T extends '.json'
  ? Config
  : Config | (() => Config)

function isConfig(obj: unknown): obj is Config {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.prototype.hasOwnProperty.call(obj, 'port')
  )
}

function isJsConfig(obj: unknown): obj is Config | (() => Config) {
  return isConfig(typeof obj === 'function' ? obj() : obj)
}

async function findConfig(): Promise<string> {
  const root = await findUp([
    'metaframework.config.js',
    'metaframework.config.cjs',
    'metaframework.config.json',
  ])

  if (!root) {
    throw new Error('Could not find a metaframework config')
  }

  return root
}

async function importConfig<T extends ConfigExt>(
  path: string,
  ext: T,
): Promise<ImportedConfig<T>>
async function importConfig(
  path: string,
  ext: ConfigExt,
): Promise<ImportedConfig<typeof ext>> {
  if (ext === '.json') {
    const config = (await import(path, { with: { type: 'json' } })) as unknown

    if (!isConfig(config)) {
      throw new Error('Invalid metaframework config')
    }

    return config
  }

  const config = ((await import(path)) as DefaultImport<unknown>).default

  if (!isJsConfig(config)) {
    throw new Error('Invalid metaframework config')
  }

  return config
}

export async function loadConfig(): Promise<Config> {
  const root = await findConfig()
  const { ext } = parse(root)

  if (ext !== '.js' && ext !== '.cjs' && ext !== '.json') {
    throw new Error('Metaframework config must be a .js, .cjs, or .json file')
  }

  if (ext === '.json') {
    const config = await importConfig(root, ext)

    return Promise.resolve({
      ...defaultConfig,
      ...config,
    })
  }

  const config = await importConfig(root, ext)
  const resolved = typeof config === 'function' ? config() : config
  return Promise.resolve({
    ...defaultConfig,
    ...resolved,
  })
}
