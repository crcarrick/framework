import { readdirSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

interface Options {
  base?: string
  match?: RegExp | string
  ignore?: RegExp | string
}

interface Result {
  base: string
  full: string
  name: string
  path: string
}

export async function* walk(
  start: string,
  { base = '/', match = /./, ignore = /\b\B/ }: Options = {},
): AsyncGenerator<Result> {
  const dirents = await readdir(start, { withFileTypes: true })
  const matcher = match instanceof RegExp ? match : new RegExp(match)
  const ignorer = ignore instanceof RegExp ? ignore : new RegExp(ignore)

  for (const dirent of dirents) {
    if (ignorer.test(dirent.name)) {
      continue
    }

    const path = join(base, dirent.name)
    if (dirent.isDirectory()) {
      yield* walk(join(start, dirent.name), {
        base: path,
        match,
        ignore,
      })
    } else if (matcher.test(dirent.name)) {
      yield {
        base: base,
        full: join(start, dirent.name),
        name: dirent.name,
        path: dirent.path,
      }
    }
  }
}

export function* walkSync(
  start: string,
  { base = '/', match = /./, ignore = /\b\B/ }: Options = {},
): Generator<Result> {
  const dirents = readdirSync(start, { withFileTypes: true })
  const matcher = match instanceof RegExp ? match : new RegExp(match)
  const ignorer = ignore instanceof RegExp ? ignore : new RegExp(ignore)

  for (const dirent of dirents) {
    if (ignorer.test(dirent.name)) {
      continue
    }

    const path = join(base, dirent.name)
    if (dirent.isDirectory()) {
      yield* walkSync(join(start, dirent.name), {
        base: path,
        match,
        ignore,
      })
    } else if (matcher.test(dirent.name)) {
      yield {
        base: base,
        full: join(start, dirent.name),
        name: dirent.name,
        path: join(base, dirent.name),
      }
    }
  }
}
