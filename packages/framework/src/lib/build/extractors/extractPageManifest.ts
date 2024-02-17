import { join, parse, sep } from 'node:path'
import { cwd } from 'node:process'

import type { Metafile } from 'esbuild'

import { isValidPageComponent } from '../utils/isPageComponent.js'
import { isPageExport, type PageExport } from '../utils/isPageExport.js'

interface Import {
  client: string
  server: string
}
export interface Page {
  route: string
  match: string
  page: {
    imports: Import
    exports: PageExport[]
    layouts: Import[]
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

function addLayoutsToPage({ route, page }: Page, manifest: PageManifest) {
  if (manifest['/'] && manifest['/'].page.exports.includes('Layout')) {
    page.layouts.push(manifest['/'].page.imports)
  }

  if (route === '/') return

  const segments = route.split(sep)
  for (let i = 0; i < segments.length; i++) {
    const currentPath = segments.slice(0, i + 1).join(sep)
    const currentPage = manifest[currentPath]

    if (currentPage && currentPage.page.exports.includes('Layout')) {
      page.layouts.push(currentPage.page.imports)
    }
  }
}

const PAGE_REGEX = /.*\.framework\/server\/pages(\/.*)/

export function extractPageManifest({ outputs = {} }: Metafile) {
  const manifest = Object.entries(outputs).reduce<PageManifest>(
    (acc, [path, output]) => {
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
            imports: {
              client: join('/public', 'pages', relPath),
              server: join(cwd(), path),
            },
            exports: output.exports.filter(isPageExport),
            layouts: [],
          }
        }
      }

      return acc
    },
    {},
  )

  Object.values(manifest).forEach((page) => addLayoutsToPage(page, manifest))

  return manifest
}
