import { readdir } from 'node:fs/promises'
import { join, relative } from 'node:path'

import type { BuildOptions } from 'esbuild'

export type EntryPoint = Extract<
  BuildOptions['entryPoints'],
  Array<object>
>[number]

export async function getEntryPoints(): Promise<EntryPoint[]> {
  const pages = join(process.cwd(), 'src', 'pages')
  const files = await readdir(pages, { recursive: true, withFileTypes: true })
  const entries = files.reduce<Record<string, EntryPoint>>((acc, file) => {
    if (acc[file.path]) return acc
    if (file.isFile() && /(page|layout)\.(js|ts|jsx|tsx)$/.test(file.name)) {
      acc[file.path] = {
        in: join(file.path, 'entry.tsx'),
        out: join('pages', relative(pages, file.path), 'page'),
      }
    }

    return acc
  }, {})

  return Object.values(entries)
}
