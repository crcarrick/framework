import { readdir, writeFile } from 'node:fs/promises'
import { join, parse } from 'node:path'

import type { OnLoadResult, Plugin } from 'esbuild'
import { rimraf } from 'rimraf'

import { extractPageManifest } from './manifest/extractPageManifest.js'

type Component = 'page' | 'layout' | 'fallback'

const COMPONENTS: Record<Component, string> = {
  page: 'Page',
  layout: 'Layout',
  fallback: 'Fallback',
}

async function getComponents(path: string) {
  const files = await readdir(path)
  return files
    .reduce<Component[]>((acc, file) => {
      if (file.includes('page')) acc.push('page')
      if (file.includes('layout')) acc.push('layout')
      if (file.includes('fallback')) acc.push('fallback')

      return acc
    }, [])
    .sort()
}

export const FrameworkPlugin: Plugin = {
  name: 'FrameworkPlugin',
  async setup(build) {
    await rimraf('.framework')

    build.onResolve(
      { filter: /.*\/(page|layout|fallback)\.(js|ts|jsx|tsx)$/ },
      async ({ path, kind, importer }) => {
        switch (kind) {
          case 'entry-point': {
            const { dir, ext } = parse(path)
            console.log(dir)
            const result = {
              path: join(dir, `entry${ext}`),
              namespace: 'framework',
            }

            return result
          }
          case 'import-statement': {
            if (/.*\/entry\.(js|ts|jsx|tsx)$/.test(importer)) {
              const { dir, ext } = parse(importer)
              const { name } = parse(path)

              const resolved = await build.resolve(`./${name}${ext}`, {
                kind: 'import-statement',
                resolveDir: dir,
              })

              return { path: resolved.path, namespace: 'file' }
            } else {
              return undefined
            }
          }
          default:
            return undefined
        }
      },
    )

    build.onLoad({ filter: /.*/, namespace: 'framework' }, async (args) => {
      // by default, esbuild is only watching the entrypoints provided to it, in
      // this case the generated entry.tsx files we created. in order to watch the
      // actual source files, we need to tell esbuild to watch them here with watchFiles
      const { dir, ext } = parse(args.path)
      const components = await getComponents(dir)
      const contents = components.reduce(
        (str, component) => `${str}
export * from '${join(dir, component)}.js'
export { default as ${COMPONENTS[component]} } from '${join(dir, component)}.js'`,
        ``,
      )

      const loader = ext.includes('ts') ? 'tsx' : 'jsx'
      const result: OnLoadResult = {
        loader,
        contents,
      }

      return result
    })

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
