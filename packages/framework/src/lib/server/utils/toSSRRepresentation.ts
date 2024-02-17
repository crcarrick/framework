import { join } from 'node:path'

import { Page } from '../../build/index.js'
import type { Metadata } from '../../types/index.js'

export interface SSRComponent {
  type: string
  props: object
  layouts: string[]
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
  representation.page.layouts = route.page.layouts.map(({ client }) => client)

  return JSON.stringify(representation)
}
