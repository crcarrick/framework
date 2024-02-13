import { join, parse } from 'node:path'

import esbuild from 'esbuild'

import { registerSignals } from '@framework/utils'

import { getEntryPoints, type EntryPoint } from '../utils/getEntryPoints.js'

import { CLIENT_OPTIONS, SERVER_OPTIONS } from './options.js'

function bootstrapEntry() {
  const serverPath = new URL(import.meta.resolve('@framework/server')).pathname
  return { in: join(parse(serverPath).dir, 'bootstrap.js'), out: 'bootstrap' }
}
function serverEntry() {
  const serverPath = new URL(import.meta.resolve('@framework/server')).pathname
  return {
    in: serverPath,
    out: 'index',
  }
}

export async function buildClient(entryPoints: EntryPoint[]) {
  return esbuild.build({
    ...CLIENT_OPTIONS,
    entryPoints: entryPoints.concat([bootstrapEntry()]),
  })
}

export async function buildServer(entryPoints: EntryPoint[]) {
  return esbuild.build({
    ...SERVER_OPTIONS,
    entryPoints: entryPoints.concat([serverEntry()]),
  })
}

export async function build() {
  const entryPoints = await getEntryPoints()

  await Promise.all([buildClient(entryPoints), buildServer(entryPoints)])
}

export async function watch() {
  const entryPoints = await getEntryPoints()
  const clientContext = await esbuild.context({
    ...CLIENT_OPTIONS,
    entryPoints: entryPoints.concat([bootstrapEntry()]),
  })
  const serverContext = await esbuild.context({
    ...SERVER_OPTIONS,
    entryPoints: entryPoints.concat([serverEntry()]),
  })

  registerSignals(() => {
    Promise.all([clientContext.dispose(), serverContext.dispose()]).then(
      () => process.exit(0),
      () => process.exit(1),
    )
  })

  await Promise.all([clientContext.watch(), serverContext.watch()])
}
