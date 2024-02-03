import { join } from 'node:path'

import type { RouteDescriptor } from '@framework/router'

interface JSONComponent {
  type: string
  props: {
    children: JSONComponent[]
  } & {
    [key: string]: unknown
  }
}

// yikes
function toType(path: string) {
  return join('/', 'pages', path)
}

/**
 * TODO: This is an extremely naive implementation, we need to come up with a more robust solution
 */
export function createSSRMetadata(
  route: RouteDescriptor,
  pageProps: object,
): JSONComponent {
  const tree = {} as JSONComponent

  if (route.layout) {
    tree.type = toType(route.layout.relativePath)
    tree.props = {
      children: [],
    }
  }

  if (route.page) {
    const page: JSONComponent = {
      type: toType(route.page.relativePath),
      props: {
        ...pageProps,
        children: [],
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
