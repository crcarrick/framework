import { createRequire } from 'node:module'

import type { ComponentType, PropsWithChildren } from 'react'

import type { RouteDescriptor } from '@framework/router'

interface ImportedRoute {
  Page: ComponentType | null
  Layout: ComponentType<PropsWithChildren> | null
}

interface RouteImport {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ComponentType<any>
}

const require = createRequire(import.meta.url)

function invalidate(url: string) {
  if (require.cache[url]) {
    delete require.cache[url]
  }
}

export function importPage(
  { page, layout }: RouteDescriptor,
  mode: 'dev' | 'prod' = 'prod',
): ImportedRoute {
  if (mode === 'dev') {
    for (const url of [page, layout].filter(
      (url): url is Exclude<typeof url, null> => Boolean(url),
    )) {
      invalidate(url)
    }
  }

  return {
    Page: page ? (require(page) as RouteImport).default : null,
    Layout: layout ? (require(layout) as RouteImport).default : null,
  }
}
