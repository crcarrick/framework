import { join, relative } from 'node:path'
import { cwd } from 'node:process'

import type { BuildOptions } from 'esbuild'

import type { TempEntry } from './createTempEntries.js'

export type EntryPoints = Extract<BuildOptions['entryPoints'], Array<object>>

export function getPageEntryPoints(tempEntries: TempEntry[]): EntryPoints {
  const pages = join(cwd(), '.framework', 'temp', 'pages')

  return tempEntries.map(({ path }) => ({
    in: join(path, 'entry.tsx'),
    out: join('pages', relative(pages, path), 'page'),
  }))
}
