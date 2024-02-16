import esbuild from 'esbuild'

import { registerSignals } from '@framework/utils'

import { getEntryPoints, type EntryPoint } from '../utils/getEntryPoints.js'

import {
  BOOTSTRAP_ENTRY,
  CLIENT_OPTIONS,
  SERVER_ENTRY,
  SERVER_OPTIONS,
} from './options.js'

export async function buildClient(entryPoints: EntryPoint[]) {
  return esbuild.build({
    ...CLIENT_OPTIONS,
    entryPoints: entryPoints.concat([BOOTSTRAP_ENTRY]),
  })
}

export async function buildServer(entryPoints: EntryPoint[]) {
  return esbuild.build({
    ...SERVER_OPTIONS,
    entryPoints: entryPoints.concat([SERVER_ENTRY]),
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
    entryPoints: entryPoints.concat([BOOTSTRAP_ENTRY]),
  })
  const serverContext = await esbuild.context({
    ...SERVER_OPTIONS,
    entryPoints: entryPoints.concat([SERVER_ENTRY]),
  })

  registerSignals(() => {
    Promise.all([clientContext.dispose(), serverContext.dispose()]).then(
      () => process.exit(0),
      () => process.exit(1),
    )
  })

  await Promise.all([clientContext.watch(), serverContext.watch()])
}
