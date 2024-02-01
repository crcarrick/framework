import { readdir, stat } from 'node:fs/promises'
import { join, parse } from 'node:path'

import { dynamicImport } from '@framework/utils'

import type { Component } from './createRoute.js'

type RouteMap = Map<string, Component<object>>

export interface CreateRouteMap {
  (dir: string, base?: string, routes?: RouteMap): Promise<RouteMap>
}

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
      const module = (await dynamicImport(fullPath)) as Component<object>
      routes.set(parse(route).dir, module)
    }
  }

  return routes
} satisfies CreateRouteMap
