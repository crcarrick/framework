// import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'

import type { PageManifest } from '@framework/build'
import type { Config } from '@framework/config'

interface ManifestImport {
  default: PageManifest
}

export async function getRoutes(config: Config) {
  if (config.routing === 'entries') {
    // TODO: import the entries file and pass it some kind of context
  }

  const manifest = (await import(
    join(cwd(), '.framework', 'page-manifest.json'),
    {
      with: { type: 'json' },
    }
  )) as ManifestImport

  return manifest.default
}
