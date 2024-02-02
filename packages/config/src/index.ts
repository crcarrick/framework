import { parse } from 'node:path'
import { createRequire } from 'node:module'

import { findUp } from 'find-up'

export interface Config {
  port: number
  routing?: 'filesystem' | 'manual'
}

const defaultConfig: Config = {
  port: 3000,
  routing: 'filesystem',
}

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

export async function findConfig(): Promise<string> {
  const root = await findUp([
    'framework.config.js',
    'framework.config.cjs',
    'framework.config.mjs',
    'framework.config.json',
  ])

  if (!root) {
    throw new Error('Could not find a framework config')
  }

  return root
}

const require = createRequire(import.meta.url)

export async function loadConfig(root: string): Promise<Config> {
  if (require.cache[root]) {
    delete require.cache[root]
  }

  const parsed = parse(root)
  const config = require(root) as Config | (() => Config)

  if (parsed.ext === '.json' && isConfig(config)) {
    return Promise.resolve({
      ...defaultConfig,
      ...config,
    })
  }

  if (parsed.ext.match(/\.c?js$/) && isJsConfig(config)) {
    const resolved = typeof config === 'function' ? config() : config
    return Promise.resolve({
      ...defaultConfig,
      ...resolved,
    })
  }

  throw new Error('Invalid framework config')
}
