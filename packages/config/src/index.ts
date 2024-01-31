import { parse } from 'node:path'

import { dynamicImport, findUp } from '@framework/utils'

export interface Config {
  port: number
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
  const root = await findUp(['framework.config.js', 'framework.config.json'])

  if (!root) {
    throw new Error('Could not find a framework config')
  }

  return root
}

export async function loadConfig(root: string): Promise<Config> {
  const parsed = parse(root)
  const config = await dynamicImport(parsed)

  if (parsed.ext === '.json' && isConfig(config)) {
    return config
  }

  if (parsed.ext === '.js' && isJsConfig(config)) {
    return typeof config === 'function' ? config() : config
  }

  throw new Error('Invalid framework config')
}
