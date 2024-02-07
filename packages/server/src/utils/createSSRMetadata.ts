import { join } from 'node:path'

import type { RouteDescriptor } from '@framework/router'

export interface JSONComponent {
  type: string
  props: {
    children: JSONComponent[]
  } & {
    [key: string]: unknown
  }
}

function toType(path: string) {
  return join('/', path)
}
/**
 * TODO: This is a naive implementation, we need to come up with a more robust solution
 */
export function createSSRMetadata(route: RouteDescriptor, pageProps: object) {
  const tree = {} as JSONComponent

  if (route.layout) {
    tree.type = toType(route.layout.clientPath)
    tree.props = {
      children: [],
    }
  }

  if (route.page) {
    const page: JSONComponent = {
      type: toType(route.page.clientPath),
      props: {
        children: [],
        ...pageProps,
      },
    }
    if (route.layout) {
      tree.props.children.push(page)
    } else {
      return page
    }
  }

  return tree
}
