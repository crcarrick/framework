import { access } from 'node:fs/promises'
import { join, parse, type ParsedPath } from 'node:path'

export async function dynamicImport(
  path: ParsedPath | string,
): Promise<unknown> {
  if (typeof path === 'string') {
    path = parse(path)
  }

  const file = join(path.dir, path.base)

  if (path.ext === '.json') {
    return ((await import(file)) as { default: unknown }).default
  }

  try {
    return ((await import(file)) as { default: unknown }).default
  } catch {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(file) as unknown
    } catch {
      return null
    }
  }
}

export async function exists(path: string) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}
