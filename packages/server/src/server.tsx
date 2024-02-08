import { createServer } from 'node:http'
import { join, parse } from 'node:path'

import compression from 'compression'
import express from 'express'

import { findConfig, loadConfig } from '@framework/config'
import { createRouteDescriptors } from '@framework/router'

import { render } from './render.js'
import { send404 } from './utils/send404.js'

export async function runServer() {
  const app = express()

  const root = await findConfig()
  const path = join(parse(root).dir, '.framework', 'server', 'pages')
  const config = await loadConfig(root)
  const routes = await createRouteDescriptors(path)

  app.use(compression())
  app.use(
    '/public',
    express.static(join(parse(root).dir, '.framework', 'public')),
  )
  app.use((req, res) => {
    const route = Array.from(routes.values()).find(({ matcher }) => {
      return matcher(req.path)
    })

    if (!route) return send404(res)

    const { params } = route.matcher(req.path) || { params: {} }
    render(route, params, res).catch((err) => {
      console.error(err)
      res.status(500).send('Internal server error')
    })
  })

  const port = config.port || 3000
  const server = createServer(app)
  server.listen(port, () =>
    console.log(`🚀 Server is running on http://localhost:${port}`),
  )

  return server
}
