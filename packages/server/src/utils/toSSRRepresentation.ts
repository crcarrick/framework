import { join } from 'node:path'

import type { RouteDescriptor } from '@framework/router'
import type { Metadata } from '@framework/types'

export interface SSRComponent {
  type: string
  props: object
}

export interface SSRRepresentation {
  page: SSRComponent
  layout: SSRComponent | null
  fallback: SSRComponent | null
  metadata: Metadata
}

function toType(path: string) {
  return join('/', path)
}

// this only works if the structure of our routes are consistent
export function toSSRRepresentation<T extends object = {}>(
  route: RouteDescriptor,
  metadata: Metadata,
  pageProps: T,
) {
  const representation = { metadata } as SSRRepresentation

  if (!route.page) {
    throw new Error('Something weird happened')
  }

  representation.page ??= {} as SSRComponent
  representation.page.type = toType(route.page.clientPath)
  representation.page.props = pageProps

  if (route.layout) {
    representation.layout ??= {} as SSRComponent
    representation.layout.type = toType(route.layout.clientPath)
    representation.layout.props = {}
  }

  if (route.fallback) {
    representation.fallback ??= {} as SSRComponent
    representation.fallback.type = toType(route.fallback.clientPath)
    representation.fallback.props = {}
  }

  return JSON.stringify(representation)
}
