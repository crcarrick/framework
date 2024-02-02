import { join, relative } from 'node:path'

import chokidar, { type FSWatcher } from 'chokidar'

export async function registerWatcher(watchers: Set<FSWatcher>) {
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
          `\nFile change detected. ${relative(process.cwd(), path)} has changed. Restarting server...\n`,
        )

        watcher.close().then(resolve, reject)
      })

    watchers.add(watcher)
  })
}
