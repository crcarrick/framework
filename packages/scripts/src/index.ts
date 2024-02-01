#!/usr/bin/env node

import type { Server } from 'node:http'
import { join, relative } from 'node:path'
import process from 'node:process'

import { runServer } from '@framework/server'
import chokidar from 'chokidar'

function close(server: Server) {
  return new Promise((resolve) => server.close(resolve))
}

async function watch() {
  return new Promise<void>((resolve, reject) => {
    const paths = [
      join(process.cwd(), 'framework.config.{js,cjs,mjs,json}'),
      join(process.cwd(), '**', '*.{,c,m}js{,x}'),
      join(process.cwd(), '**', '*.{,c,m}ts{,x}'),
    ]
    const watcher = chokidar
      .watch(paths, { ignored: /node_modules/ })
      .on('change', (path) => {
        console.log(
          `File change detected. ${relative(process.cwd(), path)} has changed. Restarting server...`,
        )

        watcher.close().then(resolve, reject)
      })
  })
}

async function watchServer() {
  let watching = true

  process.on('SIGINT', () => {
    watching = false
  })

  while (watching) {
    const server = await runServer()
    await watch()
    await close(server)
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.error('Usage: framework <command> [options]')
    process.exit(1)
  }

  const command = args[0]

  switch (command) {
    case 'dev': {
      return await watchServer()
    }

    case 'start': {
      return await runServer()
    }

    default: {
      console.error(`Unknown command: ${command}`)
      process.exit(1)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
