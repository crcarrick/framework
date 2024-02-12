import { join } from 'node:path'

import { Page } from '@framework/build'
import type { Metadata } from '@framework/types'

export interface SSRComponent {
  type: string
  props: object
}

export interface SSRRepresentation {
  page: SSRComponent
  metadata: Metadata
}

function toType(path: string) {
  return join('/', path)
}

// this only works if the structure of our routes are consistent
export function toSSRRepresentation<T extends object = {}>(
  route: Page,
  metadata: Metadata,
  pageProps: T,
) {
  const representation = { metadata } as SSRRepresentation

  if (!route.page) {
    throw new Error('Something weird happened')
  }

  representation.page ??= {} as SSRComponent
  representation.page.type = toType(route.page.imports.client)
  representation.page.props = pageProps

  return JSON.stringify(representation)
}
