import { createRequire } from 'node:module'
import { join, parse } from 'node:path'
import process from 'node:process'

import esbuild, { type BuildOptions } from 'esbuild'

import { walk } from '@framework/utils'

interface EntryPoint {
  in: string
  out: string
}

type Command = 'dev' | 'start' | 'build'

function isCommand(command: string): command is Command {
  return command === 'dev' || command === 'start' || command === 'build'
}

async function getServerEntryPoints(): Promise<EntryPoint[]> {
  const pages = join(process.cwd(), 'pages')
  const files: EntryPoint[] = [
    {
      in: createRequire(import.meta.url).resolve('@framework/server'),
      out: 'index',
    },
  ]

  const walker = walk(pages, { match: /\.(js|ts)x?$/, ignore: /node_modules/ })
  for await (const file of walker) {
    const { name } = parse(file.full)
    files.push({
      in: file.full,
      out: join('pages', file.base, name),
    })
  }

  return files
}

async function getClientEntryPoints(): Promise<EntryPoint[]> {
  const pages = join(process.cwd(), 'pages')
  const files: EntryPoint[] = [
    {
      in: join(
        parse(createRequire(import.meta.url).resolve('@framework/server')).dir,
        'bootstrap.js',
      ),
      out: 'bootstrap',
    },
  ]

  const walker = walk(pages, { match: /\.(js|ts)x?$/, ignore: /node_modules/ })
  for await (const file of walker) {
    const { name } = parse(file.full)
    files.push({
      in: file.full,
      out: join('pages', file.base, name),
    })
  }

  return files
}

const commonOptions: BuildOptions = {
  bundle: true,
  format: 'esm',
  splitting: true,
  loader: {
    '.js': 'jsx',
    '.ts': 'tsx',
  },
}

async function devServer() {
  const serverEntries = await getServerEntryPoints()

  await build()

  const context = await esbuild.context({
    ...commonOptions,
    platform: 'node',
    entryPoints: serverEntries,
  })

  await context.serve()
}

async function startServer() {}

async function build() {
  await Promise.all([
    esbuild.build({
      ...commonOptions,
      platform: 'browser',
      outdir: join('.framework', 'public'),
      entryPoints: await getClientEntryPoints(),
    }),
    esbuild.build({
      ...commonOptions,
      platform: 'node',
      packages: 'external',
      outdir: join('.framework', 'server'),
      entryPoints: await getServerEntryPoints(),
    }),
  ])
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Usage: framework <command> [options]')
    process.exit(1)
  }

  const command = process.argv[2]

  if (!isCommand(command)) {
    console.error(`Unknown command: ${command}`)
    process.exit(1)
  }

  process.env.NODE_ENV = command === 'dev' ? 'development' : 'production'

  switch (command) {
    case 'dev': {
      return await devServer()
    }

    case 'start': {
      return await startServer()
    }

    case 'build': {
      return await build()
    }
  }

  return Promise.resolve()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
