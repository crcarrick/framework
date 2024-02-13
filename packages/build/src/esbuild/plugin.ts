import { writeFile } from 'node:fs/promises'
import { join, parse } from 'node:path'

import type { Plugin } from 'esbuild'

import { extractPageManifest } from '../extractors/extractPageManifest.js'
import { getPageComponents } from '../utils/getPageComponents.js'

export const FrameworkPlugin: Plugin = {
  name: 'FrameworkPlugin',
  setup(build) {
    const COMPONENTS = {
      page: 'Page',
      layout: 'Layout',
      fallback: 'Fallback',
    }

    build.onResolve({ filter: /entry\.(js|ts|jsx|tsx)$/ }, (args) => {
      const { dir, ext } = parse(args.path)

      return {
        path: args.path,
        namespace: 'framework',
        watchFiles: ['page', 'layout', 'fallback'].map((component) =>
          join(dir, `${component}${ext}`),
        ),
      }
    })

    build.onLoad({ filter: /.*/, namespace: 'framework' }, async (args) => {
      const { dir, ext } = parse(args.path)
      const components = await getPageComponents(dir)
      const contents = components.reduce((content, component) => {
        return `${content}\nexport * from './${component}.js'\nexport { default as ${COMPONENTS[component]} } from './${component}.js'`
      }, ``)
      const loader = ext.includes('ts') ? 'tsx' : 'jsx'

      return {
        loader,
        contents,
        resolveDir: dir,
      }
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
