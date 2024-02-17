import { join, relative } from 'node:path'
import process from 'node:process'

import nodemon from 'nodemon'

import { build, watch } from './lib/build/index.js'

type Command = 'dev' | 'start' | 'build' | 'debug'

function isCommand(command: string): command is Command {
  return (
    command === 'dev' ||
    command === 'start' ||
    command === 'build' ||
    command === 'debug'
  )
}

interface DevServerOptions {
  debug?: boolean
}

async function devServer({ debug }: DevServerOptions = {}) {
  await watch()

  const files = [
    'src/**/*',
    'metaframework.config.js',
    'metaframework.config.cjs',
    'metaframework.config.json',
  ]
  // FIXME: little hack to help me while i'm developing this thing
  if (debug) {
    files.push('.metaframework/server/index.js')
    files.push('.metaframework/public/bootstrap.js')
  }

  const server = nodemon({
    ext: 'js,ts,jsx,tsx',
    delay: debug ? 2000 : 100,
    script: join('.metaframework', 'server', 'index.js'),
    ignore: ['node_modules'],
    nodeArgs: ['--no-warnings'],
    watch: files,
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
  await import(join(process.cwd(), '.metaframework', 'server', 'index.js'))
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Usage: metaframework <command> [options]')
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
