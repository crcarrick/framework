import { join, parse, sep } from 'node:path'
import { cwd } from 'node:process'

import type { Metafile } from 'esbuild'

import {
  isValidPageComponent,
  pageComponentExportSet,
  type Page,
  type PageComponentExport,
  type PageManifest,
} from '../types.js'

function filterExports(exports: string[]): PageComponentExport[] {
  return exports.filter((exp): exp is PageComponentExport => {
    return pageComponentExportSet.has(exp as PageComponentExport)
  })
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

const PAGE_REGEX = /.*\.framework\/server\/pages\/(.*page\.js)/

export function extractPageManifest({ outputs = {} }: Metafile) {
  return Object.entries(outputs).reduce<PageManifest>((acc, [path, output]) => {
    const match = path.match(PAGE_REGEX)

    if (match !== null) {
      const [, relPath] = match
      const { dir } = parse(relPath)
      const routePath = join('/', dir)

      if (isValidPageComponent(output.exports)) {
        acc[routePath] ??= {} as Page
        acc[routePath].route = routePath
        acc[routePath].match = convertParams(routePath)
        acc[routePath].page = {
          exports: filterExports(output.exports),
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
