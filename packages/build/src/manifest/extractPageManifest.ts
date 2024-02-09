import { join, parse, sep } from 'node:path'
import { cwd } from 'node:process'

import type { Metafile } from 'esbuild'

import {
  isValidPageComponent,
  type Page,
  type PageComponent,
  type PageComponentExport,
  type PageManifest,
} from '../types.js'

function filterExports(
  key: PageComponent,
  exports: string[],
): PageComponentExport[] {
  return exports.filter((exp): exp is PageComponentExport => {
    if (exp === 'default') {
      return true
    }

    switch (key) {
      case 'page': {
        return ['getServerSideProps', 'getStaticProps'].includes(exp)
      }

      case 'layout': {
        return ['metadata', 'generateMetadata'].includes(exp)
      }

      case 'fallback':
      default: {
        return false
      }
    }
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

const PAGE_REGEX =
  /.*\.framework\/server\/pages\/(.*(page|layout|fallback)-(.*)\.js)/

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
        acc[routePath][name] = {
          exports: filterExports(name, output.exports),
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
