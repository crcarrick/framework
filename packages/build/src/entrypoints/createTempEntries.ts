import { readdir } from 'node:fs/promises'
import { join, parse } from 'node:path'
import { cwd } from 'node:process'

import { outputFile } from 'fs-extra/esm'

export interface TempEntry {
  path: string
  file: string
}

const COMPONENT_MAP: Record<string, string> = {
  page: 'Page',
  layout: 'Layout',
  fallback: 'Fallback',
}

export async function createTempEntries() {
  const pages = join(cwd(), '.framework', 'temp', 'pages')
  const dirents = await readdir(pages, { recursive: true, withFileTypes: true })
  const outputs: Record<string, string[]> = {}

  for (const dirent of dirents) {
    if (!dirent.isFile()) continue
    if (
      dirent.name.includes('page') ||
      dirent.name.includes('layout') ||
      dirent.name.includes('fallback')
    ) {
      outputs[dirent.path] ??= []
      outputs[dirent.path].push(dirent.name)
    }
  }

  const tempEntries = Object.entries(outputs).map<TempEntry>(
    ([path, files]) => ({
      path,
      file: files.reduce((str, file) => {
        const { name } = parse(file)
        return `${str}export * from './${name}.js'\nexport { default as ${COMPONENT_MAP[name]} } from './${name}.js'\n`
      }, ``),
    }),
  )

  await Promise.all(
    tempEntries.map(({ path, file }) =>
      outputFile(join(path, 'entry.tsx'), file),
    ),
  )

  return tempEntries
}
