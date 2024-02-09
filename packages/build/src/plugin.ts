import { writeFile } from 'node:fs/promises'
import { join, parse, sep } from 'node:path'
import { cwd } from 'node:process'

import type { Plugin, Metafile } from 'esbuild'

const PAGE_REGEX = /.*\.framework\/server\/pages(\/.*)/

type PageComponent = 'page' | 'layout' | 'fallback'
type PageComponentExport =
  | 'default'
  | 'getServerSideProps'
  | 'getStaticProps'
  | 'metadata'
  | 'generateMetadata'
interface PageOut {
  exports: PageComponentExport[]
  imports: {
    client: string
    server: string
  }
}
export interface Page extends Partial<Record<PageComponent, PageOut>> {
  route: string
  match: string
}

function isPageComponent(key: string) {
  return ['page', 'layout', 'fallback'].includes(key)
}

function isValidPageComponent(
  key: string,
  exports: string[],
): key is PageComponent {
  return isPageComponent(key) && exports.includes('default')
}

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

function extractPageManifest({ outputs = {} }: Metafile) {
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

export const FrameworkPlugin: Plugin = {
  name: 'FrameworkPlugin',
  setup(build) {
    build.onEnd(async (result) => {
      if (result.metafile) {
        const manifest = extractPageManifest(result.metafile)
        await writeFile(
          join('.framework', 'page-manifest.json'),
          JSON.stringify(manifest, null, 2),
        )
      }
    })
  },
}
