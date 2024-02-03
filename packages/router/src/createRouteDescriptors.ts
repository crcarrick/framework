import type { MatchFunction } from 'path-to-regexp'

import { walk } from '@framework/utils'

import { createMatcher } from './createMatcher.js'

export interface RouteDescriptor {
  path: string
  page: string | null
  layout: string | null
  fallback: string | null
  matcher: MatchFunction
}

type RouteDescriptors = Map<string, RouteDescriptor>

const PAGE_RE = /^index\.((c|m)?js)$/
const LAYOUT_RE = /^layout\.((c|m)?js)$/
const FALLBACK_RE = /^fallback\.((c|m)?js)$/

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
        fallback: null,
        matcher: createMatcher(base),
      })
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

    if (LAYOUT_RE.test(name)) {
      const curr = routes.get(base)
      if (curr) {
        routes.set(base, {
          ...curr,
          layout: full,
        })
      }
    }

    if (FALLBACK_RE.test(name)) {
      const curr = routes.get(base)
      if (curr) {
        routes.set(base, {
          ...curr,
          fallback: full,
        })
      }
    }
  }

  return routes
}
