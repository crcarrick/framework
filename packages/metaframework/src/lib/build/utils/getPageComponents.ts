import { readdir } from 'node:fs/promises'
import { parse } from 'node:path'

import { isPageComponent, type PageComponent } from './isPageComponent.js'

export async function getPageComponents(path: string) {
  const files = await readdir(path)

  return files.reduce<PageComponent[]>((acc, file) => {
    const { name } = parse(file)

    if (isPageComponent(name)) {
      acc.push(name)
    }

    return acc
  }, [])
}
