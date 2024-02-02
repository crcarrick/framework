import { createServer } from 'node:http'
import { join, parse } from 'node:path'

import compression from 'compression'
import express from 'express'
import { renderToPipeableStream } from 'react-dom/server'

import { findConfig, loadConfig } from '@framework/config'
import { createRouteMap } from '@framework/router'

import { Shell } from './Shell.js'

export async function runServer() {
  const app = express()

  const root = await findConfig()
  const config = await loadConfig(root)
  const routeMap = await createRouteMap(join(parse(root).dir, 'pages'))

  app.use(compression())
  app.use(express.static(join(import.meta.dirname, '..', 'public')))
  app.use((req, res) => {
    const Component = routeMap.get(req.path)
    if (!Component || typeof Component !== 'function') {
      return res.status(404).send('Not found')
    }

    const { pipe } = renderToPipeableStream(
      <Shell>
        <Component />
      </Shell>,
      {
        // bootstrapModules: ['/main.mjs'],
        onShellReady() {
          res.setHeader('content-type', 'text/html')
          pipe(res)
        },
      },
    )
  })

  const port = config.port || 3000
  const server = createServer(app)
  server.listen(port, () =>
    console.log(`🚀 Server is running on http://localhost:${port}`),
  )

  return server
}
