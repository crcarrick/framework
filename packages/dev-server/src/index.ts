import type { FSWatcher } from 'chokidar'

import { runServer } from '@framework/server'

import { createCloser } from './createCloser.js'
import { registerSignals } from './registerSignals.js'
import { registerWatcher } from './registerWatcher.js'

const watchers = new Set<FSWatcher>()
async function* watchServer() {
  while (true) {
    yield await registerWatcher(watchers)
  }
}

function terminate(closer: () => Promise<void>) {
  Promise.all([
    closer(),
    Array.from(watchers).map((watcher) => watcher.close()),
  ]).then(
    () => process.exit(0),
    (err) => {
      console.error(err)
      process.exit(1)
    },
  )
}

export async function runDevServer() {
  let server = await runServer()
  let closer = createCloser(server)
  registerSignals(() => terminate(closer))

  for await (const _ of watchServer()) {
    await closer()
    server = await runServer()
    closer = createCloser(server)
  }
}
