import { readdir } from 'node:fs/promises'
import { join, parse, relative } from 'node:path'
import { cwd } from 'node:process'

import type { BuildOptions } from 'esbuild'

export type EntryPoints = Extract<BuildOptions['entryPoints'], Array<object>>
export type EntryPoint = EntryPoints[number]

export async function getPageEntryPoints(): Promise<EntryPoints> {
  const pages = join(cwd(), 'src', 'pages')
  const files = await readdir(pages, { recursive: true, withFileTypes: true })
  const paths = files.reduce<string[]>((acc, dirent) => {
    if (!dirent.isFile()) return acc

    acc.push(join(dirent.path, dirent.name))

    return acc
  }, [])

  const entryPoints: EntryPoints = []

  for (const path of paths) {
    const { dir } = parse(path)
    entryPoints.push({
      // should probably handle other file extensions
      in: path,
      out: join('pages', relative(pages, dir), 'page'),
    })
  }

  return entryPoints
}
