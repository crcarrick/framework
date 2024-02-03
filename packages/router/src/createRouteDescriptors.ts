import type { MatchFunction } from 'path-to-regexp'

import { walk } from '@framework/utils'

import { createMatcher } from './createMatcher.js'

export interface RouteDescriptor {
  path: string
  page: string | null
  layout: string | null
  matcher: MatchFunction
}

type RouteDescriptors = Map<string, RouteDescriptor>

const LAYOUT_RE = /^layout\.((c|m)?js)$/
const PAGE_RE = /^index\.((c|m)?js)$/

export async function createRouteDescriptors(dir: string) {
  const routes: RouteDescriptors = new Map()
  const walker = walk(dir, {
    base: '/',
    match: /\.(js|jsx|ts|tsx|cjs|mjs|)$/,
    ignore: /node_modules/,
  })

  for await (const { base, full, name } of walker) {
    if (!routes.has(base)) {
      routes.set(base, {
        path: base,
        page: null,
        layout: null,
        matcher: createMatcher(base),
      })
    }

    if (LAYOUT_RE.test(name)) {
      const curr = routes.get(base)
      if (curr) {
        routes.set(base, {
          ...curr,
          layout: full,
        })
      }
    }

    if (PAGE_RE.test(name)) {
      const curr = routes.get(base)
      if (curr) {
        routes.set(base, {
          ...curr,
          page: full,
        })
      }
    }
  }

  return routes
}
