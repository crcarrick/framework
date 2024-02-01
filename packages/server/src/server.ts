import { join, parse } from 'node:path'
import { createServer } from 'node:http'

import express from 'express'
import compression from 'compression'

import { findConfig, loadConfig } from '@framework/config'
import { createRouteMap } from '@framework/router'
import { createElement } from 'react'
import { renderToPipeableStream } from 'react-dom/server'

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

    const { pipe } = renderToPipeableStream(createElement(Component, {}), {
      // bootstrapModules: ['/main.mjs'],
      onShellReady() {
        res.setHeader('content-type', 'text/html')
        pipe(res)
      },
    })
  })

  const port = config.port || 3000
  const server = createServer(app)
  server.listen(port, () =>
    console.log(`🚀 Server is running on http://localhost:${port}`),
  )

  return server
}
