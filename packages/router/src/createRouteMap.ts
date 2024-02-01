import { createRequire } from 'node:module'
import { readdir, stat } from 'node:fs/promises'
import { join, parse } from 'node:path'

import type { Component } from './createRoute.js'

type RouteMap = Map<string, Component<object>>

export interface CreateRouteMap {
  (dir: string, base?: string, routes?: RouteMap): Promise<RouteMap>
}

const require = createRequire(import.meta.url)

export const createRouteMap = async function createRouteMap(
  dir,
  base = '/',
  routes = new Map(),
) {
  const files = await readdir(dir)

  for (const file of files) {
    const fullPath = join(dir, file)
    const route = join(base, parse(file).name)
    if ((await stat(fullPath)).isDirectory()) {
      await createRouteMap(fullPath, route, routes)
    } else {
      try {
        if (require.cache[fullPath]) {
          delete require.cache[fullPath]
        }
        const module = require(fullPath) as Component<object>
        routes.set(parse(route).dir, module)
      } catch {
        const module = (
          (await import(`${fullPath}?invalidate=${Date.now()}`)) as {
            default: Component<object>
          }
        ).default
        routes.set(parse(route).dir, module)
      }
    }
  }

  return routes
} satisfies CreateRouteMap
