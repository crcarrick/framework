import { readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join, parse, relative } from 'node:path'
import process from 'node:process'

import esbuild, { type BuildOptions } from 'esbuild'
import nodemon from 'nodemon'

import { FrameworkPlugin } from '@framework/build'

import { registerSignals } from './utils/registerSignals.js'

interface EntryPoint {
  in: string
  out: string
}

type Command = 'dev' | 'start' | 'build' | 'debug'

function isCommand(command: string): command is Command {
  return (
    command === 'dev' ||
    command === 'start' ||
    command === 'build' ||
    command === 'debug'
  )
}

async function getEntryPoints(
  initialEntryPoints: EntryPoint[],
): Promise<EntryPoint[]> {
  const pages = join(process.cwd(), 'src', 'pages')
  const files = await readdir(pages, { recursive: true, withFileTypes: true })
  const entries = files.reduce<EntryPoint[]>((acc, file) => {
    if (file.isFile() && /page\.(js|ts|jsx|tsx)$/.test(file.name)) {
      acc.push({
        in: join(file.path, `entry.tsx`),
        out: join('pages', relative(pages, file.path), 'page'),
      })
    }

    return acc
  }, [])

  return entries.concat(initialEntryPoints)
}

function getClientEntryPoints() {
  return getEntryPoints([
    {
      in: join(
        parse(createRequire(import.meta.url).resolve('@framework/server')).dir,
        'bootstrap.js',
      ),
      out: 'bootstrap',
    },
  ])
}

function getServerEntryPoints() {
  return getEntryPoints([
    {
      in: createRequire(import.meta.url).resolve('@framework/server'),
      out: 'index',
    },
  ])
}

const BASE_OPTIONS: BuildOptions = {
  bundle: true,
  format: 'esm',
  splitting: true,
  loader: {
    '.js': 'jsx',
    '.ts': 'tsx',
  },
}

async function getClientOptions(): Promise<BuildOptions> {
  return {
    ...BASE_OPTIONS,
    plugins: [FrameworkPlugin],
    platform: 'browser',
    outdir: join('.framework', 'public'),
    entryPoints: await getClientEntryPoints(),
  }
}

async function getServerOptions(): Promise<BuildOptions> {
  return {
    ...BASE_OPTIONS,
    plugins: [FrameworkPlugin],
    metafile: true,
    platform: 'node',
    packages: 'external',
    outdir: join('.framework', 'server'),
    entryPoints: await getServerEntryPoints(),
  }
}

async function buildClient() {
  const options = await getClientOptions()

  return esbuild.build(options)
}

async function buildServer() {
  const options = await getServerOptions()

  return esbuild.build(options)
}

async function build() {
  await Promise.all([buildClient(), buildServer()])
}

async function devServer(debug = false) {
  const clientOptions = await getClientOptions()
  const serverOptions = await getServerOptions()
  const clientContext = await esbuild.context(clientOptions)
  const serverContext = await esbuild.context(serverOptions)

  registerSignals(() => {
    Promise.all([clientContext.dispose(), serverContext.dispose()]).then(
      () => process.exit(0),
      () => process.exit(1),
    )
  })

  await Promise.all([clientContext.watch(), serverContext.watch()])

  const watch = [
    'src/**/*',
    'framework.config.js',
    'framework.config.cjs',
    'framework.config.json',
  ]
  // FIXME: little hack to help me while i'm developing this thing
  if (debug) {
    watch.push('.framework/server/index.js')
    watch.push('.framework/public/bootstrap.js')
  }

  const server = nodemon({
    ext: 'js,ts,jsx,tsx',
    delay: debug ? 2000 : 100,
    script: join('.framework', 'server', 'index.js'),
    ignore: ['node_modules'],
    nodeArgs: ['--no-warnings'],
    watch,
  })

  server.on('restart', (allFiles) => {
    const files =
      allFiles &&
      allFiles.filter((file) =>
        ['chunk', 'index', 'bootstrap'].every((name) => !file.includes(name)),
      )
    if (files && files.length > 0) {
      const changed = files.length === 1 ? files[0] : files.length
      const message =
        typeof changed === 'number'
          ? `${changed} files changed`
          : `${relative(process.cwd(), changed)} has changed`

      console.log(`\n${message}. Restarting server...\n`)
    } else {
      console.log('\nFile change detected. Restarting server...\n')
    }
  })
}

// TODO: how would we run this in a production ready way?
async function startServer() {
  await build()
  await import(join(process.cwd(), '.framework', 'server', 'index.js'))
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

  process.env.NODE_ENV =
    command === 'dev' || command === 'debug' ? 'development' : 'production'

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

    case 'debug': {
      return await devServer(true)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
