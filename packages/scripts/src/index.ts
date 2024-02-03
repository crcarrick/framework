#!/usr/bin/env node

import { join } from 'node:path'
import process from 'node:process'

import { rimraf } from 'rimraf'
import webpack from 'webpack'

import { runDevServer } from '@framework/dev-server'
import { runServer } from '@framework/server'
import { walk } from '@framework/utils'

async function runWebpack() {
  await rimraf(join(process.cwd(), '.framework'))
  const files: Record<string, string> = {}
  // const files: string[] = []
  for await (const file of walk(process.cwd(), {
    match: '.mjs',
    ignore: 'node_modules',
  })) {
    files[join(file.base, file.name)] = file.full
    // files.push(file.full)
  }

  return new Promise<void>((resolve, reject) => {
    const compiler = webpack({
      mode: 'development',
      entry: files,
      module: {
        rules: [
          {
            test: /\.mjs$/,
            use: {
              loader: 'babel-loader',
              options: {
                // plugins: [
                //   '@babel/plugin-transform-runtime',
                //   '@babel/plugin-transform-typescript',
                // ],
                presets: ['@babel/preset-env', '@babel/preset-react'],
              },
            },
          },
        ],
      },
      experiments: {
        outputModule: true,
      },
      output: {
        libraryTarget: 'module',
        path: join(process.cwd(), '.framework'),
        filename: '[name]',
      },
      optimization: {
        splitChunks: {
          chunks: 'all',
        },
      },
    })

    compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }

      console.log('\n\n\n')
      console.log(stats?.toJson().entrypoints)
      console.log('\n\n\n')
      resolve()
    })
  })
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
      return await runDevServer()
    }

    case 'start': {
      process.env.NODE_ENV = 'production'
      return await runServer()
    }

    case 'build': {
      process.env.NODE_ENV = 'production'
      return await runWebpack()
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
