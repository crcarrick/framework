import { createRequire } from 'node:module'

import { walk } from '@framework/utils'

import type { Component } from './createRoute.js'

type RouteMap = Map<string, Component<object>>

export interface CreateRouteMap {
  (dir: string, mode?: 'dev' | 'prod'): Promise<RouteMap>
}

const require = createRequire(import.meta.url)

export const createRouteMap: CreateRouteMap = async function createRouteMap(
  dir,
  mode = 'prod',
) {
  const routes: RouteMap = new Map()
  const walker = walk(dir, {
    base: '/',
    match: /\.(js|jsx|ts|tsx|cjs|mjs|)$/,
    ignore: /node_modules/,
  })

  for await (const { base, full } of walker) {
    try {
      if (mode === 'dev' && require.cache[full]) {
        delete require.cache[full]
      }
      const module = require(full) as Component<object>
      routes.set(base, module)
    } catch {
      const specifier =
        mode === 'dev' ? `${full}?invalidate=${Date.now()}` : full
      const module = (
        (await import(specifier)) as {
          default: Component<object>
        }
      ).default
      routes.set(base, module)
    }
  }

  return routes
}
