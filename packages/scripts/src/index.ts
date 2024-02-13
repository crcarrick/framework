import { join, parse, relative } from 'node:path'
import process from 'node:process'

import esbuild, { type BuildOptions } from 'esbuild'
import nodemon from 'nodemon'

import {
  FrameworkPlugin,
  getEntryPoints,
  type EntryPoint,
} from '@framework/build'

import { registerSignals } from './utils/registerSignals.js'

type Command = 'dev' | 'start' | 'build' | 'debug'

function isCommand(command: string): command is Command {
  return (
    command === 'dev' ||
    command === 'start' ||
    command === 'build' ||
    command === 'debug'
  )
}

const SERVER_ROOT = new URL(import.meta.resolve('@framework/server')).pathname

const BOOTSTRAP_ENTRY_POINT: EntryPoint = {
  in: join(parse(SERVER_ROOT).dir, 'bootstrap.js'),
  out: 'bootstrap',
}
const SERVER_ENTRY_POINT: EntryPoint = {
  in: SERVER_ROOT,
  out: 'index',
}

const BASE_OPTIONS: BuildOptions = {
  bundle: true,
  format: 'esm',
  splitting: true,
  plugins: [FrameworkPlugin],
  loader: {
    '.js': 'jsx',
    '.ts': 'tsx',
  },
}

const CLIENT_OPTIONS: BuildOptions = {
  ...BASE_OPTIONS,
  platform: 'browser',
  outdir: join('.framework', 'public'),
}
const SERVER_OPTIONS: BuildOptions = {
  ...BASE_OPTIONS,
  metafile: true,
  platform: 'node',
  packages: 'external',
  outdir: join('.framework', 'server'),
}

async function buildClient(entryPoints: EntryPoint[]) {
  return esbuild.build({
    ...CLIENT_OPTIONS,
    entryPoints: entryPoints.concat([BOOTSTRAP_ENTRY_POINT]),
  })
}

async function buildServer(entryPoints: EntryPoint[]) {
  return esbuild.build({
    ...SERVER_OPTIONS,
    entryPoints: entryPoints.concat([SERVER_ENTRY_POINT]),
  })
}

async function build() {
  const entryPoints = await getEntryPoints()

  await Promise.all([buildClient(entryPoints), buildServer(entryPoints)])
}

interface DevServerOptions {
  debug?: boolean
}

async function devServer({ debug }: DevServerOptions = {}) {
  const entryPoints = await getEntryPoints()
  const clientContext = await esbuild.context({
    ...CLIENT_OPTIONS,
    entryPoints: entryPoints.concat([BOOTSTRAP_ENTRY_POINT]),
  })
  const serverContext = await esbuild.context({
    ...SERVER_OPTIONS,
    entryPoints: entryPoints.concat([SERVER_ENTRY_POINT]),
  })

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
    case 'debug':
    case 'dev': {
      return await devServer({ debug: command === 'debug' })
    }

    case 'start': {
      return await startServer()
    }

    case 'build': {
      return await build()
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
