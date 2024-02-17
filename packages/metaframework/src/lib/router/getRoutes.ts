// import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'

import type { PageManifest } from '../build/index.js'
import type { Config } from '../config/index.js'

interface ManifestImport {
  default: PageManifest
}

export async function getRoutes(config: Config) {
  if (config.routing === 'entries') {
    // TODO: import the entries file and pass it some kind of context
  }

  const manifest = (await import(
    join(cwd(), '.metaframework', 'page-manifest.json'),
    {
      with: { type: 'json' },
    }
  )) as ManifestImport

  return manifest.default
}
