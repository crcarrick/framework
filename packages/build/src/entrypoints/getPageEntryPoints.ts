import { readdir } from 'node:fs/promises'
import { join, parse, relative } from 'node:path'
import { cwd } from 'node:process'

import type { BuildOptions } from 'esbuild'

export type EntryPoints = Extract<BuildOptions['entryPoints'], Array<object>>
export type EntryPoint = EntryPoints[number]

function replace(path: string) {
  return path.replace('src', join('.framework', 'temp'))
}

export async function getPageEntryPoints(): Promise<EntryPoints> {
  const pages = join(cwd(), 'src', 'pages')
  const files = await readdir(pages, { recursive: true, withFileTypes: true })
  const paths = files.reduce<string[]>((acc, dirent) => {
    if (!dirent.isFile()) return acc

    acc.push(join(dirent.path, dirent.name))

    return acc
  }, [])

  const entryMap: Record<string, EntryPoint> = {}

  for (const path of paths) {
    const { dir } = parse(path)
    entryMap[dir] = {
      in: replace(join(dir, 'entry.tsx')),
      out: replace(join('pages', relative(pages, dir), 'page')),
    }
  }

  return Object.values(entryMap)
}
