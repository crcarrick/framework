import { readFile, writeFile } from 'node:fs/promises'
import { join, parse } from 'node:path'

import type { Plugin } from 'esbuild'
import { rimraf } from 'rimraf'

import { createTempEntries } from './entrypoints/createTempEntries.js'
import { extractPageManifest } from './manifest/extractPageManifest.js'
import { copySourceFiles } from './utils/copySourceFiles.js'

export const FrameworkPlugin: Plugin = {
  name: 'FrameworkPlugin',
  async setup(build) {
    await rimraf(join('.framework', 'temp'))

    async function createTemp() {
      await copySourceFiles()
      await createTempEntries()
    }

    await createTemp()

    // onStart can run multiple times
    let initialized = true

    build.onStart(async () => {
      if (!initialized) {
        initialized = true
        await createTemp()
      }
    })

    build.onLoad({ filter: /\/pages\/.*\.(js|ts|jsx|tsx)$/ }, async (args) => {
      const { dir, ext } = parse(args.path)
      const contents = await readFile(args.path)
      const loader = ext.includes('ts') ? 'tsx' : 'jsx'
      const source = dir.replace(join('.framework', 'temp'), 'src')

      return {
        loader,
        contents,
        watchFiles: ['page', 'layout', 'fallback'].map((file) =>
          join(source, `${file}${ext}`),
        ),
      }
    })

    build.onEnd(async (result) => {
      initialized = false
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
