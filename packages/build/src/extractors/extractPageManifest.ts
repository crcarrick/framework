import { join, parse, sep } from 'node:path'
import { cwd } from 'node:process'

import type { Metafile } from 'esbuild'

import { isValidPageComponent } from '../utils/isPageComponent.js'
import { isPageExport, type PageExport } from '../utils/isPageExport.js'

export interface Page {
  route: string
  match: string
  page: {
    exports: PageExport[]
    imports: {
      client: string
      server: string
    }
  }
}

export interface PageManifest {
  [routePath: string]: Page
}

function isParamSegment(segment: string) {
  return (
    segment.startsWith('[') &&
    segment.endsWith(']') &&
    !segment.slice(1, -1).includes('[') &&
    !segment.slice(1, -1).includes(']')
  )
}

function convertParams(path: string) {
  return path
    .split(sep)
    .map((segment) =>
      isParamSegment(segment)
        ? segment.replace(/\[(.*?)\]/, (_match, param) => `:${param}`)
        : segment,
    )
    .join(sep)
}

const PAGE_REGEX = /.*\.framework\/server\/pages(\/.*)/

export function extractPageManifest({ outputs = {} }: Metafile) {
  return Object.entries(outputs).reduce<PageManifest>((acc, [path, output]) => {
    const match = path.match(PAGE_REGEX)

    if (match !== null) {
      const [, relPath] = match
      const { dir, name } = parse(relPath)
      const routePath = dir === '' ? '/' : dir

      if (isValidPageComponent(name, output.exports)) {
        acc[routePath] ??= {} as Page
        acc[routePath].route = routePath
        acc[routePath].match = convertParams(routePath)
        acc[routePath].page = {
          exports: output.exports.filter(isPageExport),
          imports: {
            client: join('/public', 'pages', relPath),
            server: join(cwd(), path),
          },
        }
      }
    }

    return acc
  }, {})
}
