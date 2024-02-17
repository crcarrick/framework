import { createRequire } from 'node:module'
import { parse } from 'node:path'

import { findUp } from 'find-up'

export interface Config {
  port: number
  routing?: 'filesystem' | 'entries'
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

const require = createRequire(import.meta.url)

export async function loadConfig(): Promise<Config> {
  const root = await findConfig()
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

  throw new Error('Invalid metaframework config')
}
