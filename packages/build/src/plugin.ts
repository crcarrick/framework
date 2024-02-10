import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { Plugin } from 'esbuild'

import { extractPageManifest } from './manifest/extractPageManifest.js'

export const FrameworkPlugin: Plugin = {
  name: 'FrameworkPlugin',
  setup(build) {
    // the ultimate goal here is:
    //
    // 1. do not have to copy the entire src directory
    // 2. only create the /temp entry.tsx files
    // 3. only bundle and output the temp entry.tsx files
    //
    // I'm not sure if this is possible?
    //
    // * Watching just the /src directory would be great
    // * Copying the entire /src directory feels bad
    //
    // The idea would be to pass the contents of /src/pages as the entryPoints
    // and then redirect any imports to individual files in subdirectories to the
    // /temp/**/entry.tsx file that we create.  TBD how esbuild will handle this.
    // It's possible it will create a single file for the entry.tsx file, but also
    // possible it will create a file for each individual file in the subdirectories.
    //
    // Will have to try?

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
