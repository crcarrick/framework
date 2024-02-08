import { join } from 'node:path'

import type { RouteDescriptor } from '@framework/router'

export interface SSRComponent {
  type: string
  props: object
}

export interface SSRMetadata {
  page: SSRComponent
  layout: SSRComponent | null
  fallback: SSRComponent | null
}

function toType(path: string) {
  return join('/', path)
}

// this only works if the structure of our routes are consistent
export function createSSRMetadata<T extends object = {}>(
  route: RouteDescriptor,
  pageProps: T,
) {
  const metadata = {} as SSRMetadata

  if (!route.page) {
    throw new Error('Something weird happened')
  }

  metadata.page ??= {} as SSRComponent
  metadata.page.type = toType(route.page.clientPath)
  metadata.page.props = pageProps

  if (route.layout) {
    metadata.layout ??= {} as SSRComponent
    metadata.layout.type = toType(route.layout.clientPath)
    metadata.layout.props = {}
  }

  if (route.fallback) {
    metadata.fallback ??= {} as SSRComponent
    metadata.fallback.type = toType(route.fallback.clientPath)
    metadata.fallback.props = {}
  }

  return metadata
}
