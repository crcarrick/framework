import { join, resolve } from 'node:path'

import type { MatchFunction } from 'path-to-regexp'

import { walk } from '@framework/utils'

import { createMatcher } from './createMatcher.js'

export interface RoutePath {
  clientPath: string
  serverPath: string
}

export interface RouteDescriptor {
  path: string
  page: RoutePath | null
  layout: RoutePath | null
  fallback: RoutePath | null
  matcher: MatchFunction
}

type RouteDescriptors = Map<string, RouteDescriptor>

const PAGE_RE = /^page\.((c|m)?js)$/
const LAYOUT_RE = /^layout\.((c|m)?js)$/
const FALLBACK_RE = /^fallback\.((c|m)?js)$/

export async function createRouteDescriptors(dir: string) {
  const routes: RouteDescriptors = new Map()
  const walker = walk(dir, {
    base: '/',
    match: /\.(js|jsx|ts|tsx)$/,
    ignore: /node_modules/,
  })

  for await (const { base, full, name } of walker) {
    const isPage = PAGE_RE.test(name)
    const isLayout = LAYOUT_RE.test(name)
    const isFallback = FALLBACK_RE.test(name)
    const isRouteComponent = isPage || isLayout || isFallback

    if (!routes.has(base) && isRouteComponent) {
      routes.set(base, {
        path: base,
        page: null,
        layout: null,
        fallback: null,
        matcher: createMatcher(base),
      })
    }

    const route = routes.get(base)
    if (!route) {
      throw new Error('Something went really wrong')
    }

    const key: keyof RouteDescriptor = isPage
      ? 'page'
      : isLayout
        ? 'layout'
        : 'fallback'
    route[key] = {
      clientPath: join('/public', 'pages', resolve(base, name)),
      serverPath: full,
    }
  }

  return routes
}
