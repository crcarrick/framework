import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { Plugin } from 'esbuild'

import { extractPageManifest } from './manifest/extractPageManifest.js'

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
