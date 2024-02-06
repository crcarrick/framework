#!/usr/bin/env node

import { join } from 'node:path'
import process from 'node:process'

import esbuild, { type BuildOptions } from 'esbuild'
import { rimraf } from 'rimraf'

import { runDevServer } from '@framework/dev-server'
import { runServer } from '@framework/server'
import { walk } from '@framework/utils'

async function runEsbuild(watch = false) {
  await rimraf(join(process.cwd(), '.framework'))
  const entryPoints: string[] = []
  for await (const file of walk(join(process.cwd(), 'pages'), {
    match: '(.mjs|.js|.jsx|.ts|.tsx)',
    ignore: 'node_modules',
  })) {
    entryPoints.push(file.full)
  }

  const options: BuildOptions = {
    entryPoints,
    bundle: true,
    // minify: true,
    outdir: join(process.cwd(), '.framework'),
    format: 'esm',
    splitting: true,
    sourcemap: watch,
    loader: {
      '.js': 'jsx',
      '.ts': 'tsx',
      '.jsx': 'jsx',
      '.tsx': 'tsx',
      '.mjs': 'jsx',
    },
  }

  if (watch) {
    const context = await esbuild.context(options)
    await context.watch()
  } else {
    await esbuild.build(options)
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
      process.env.NODE_ENV = 'development'
      return await Promise.all([runEsbuild(true), runDevServer()])
    }

    case 'start': {
      process.env.NODE_ENV = 'production'
      await runEsbuild()
      return await runServer()
    }

    case 'build': {
      process.env.NODE_ENV = 'production'
      return await runEsbuild()
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
