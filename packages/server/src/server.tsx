import { createServer } from 'node:http'
import { join } from 'node:path'
import { cwd } from 'node:process'

import compression from 'compression'
import express from 'express'

import { findConfig, loadConfig } from '@framework/config'
import { createMatcher, getRoutes } from '@framework/router'

import { render } from './render.js'
import { send404 } from './utils/send404.js'

export async function runServer() {
  const app = express()

  const root = await findConfig()
  const config = await loadConfig(root)
  const routes = await getRoutes(config)

  app.use(compression())
  app.use('/public', express.static(join(cwd(), '.framework', 'public')))

  Object.values(routes).forEach((route) => {
    console.log('Creating route for ' + route.match)

    app.get(route.match, (req, res) => {
      const matcher = createMatcher(route.match)
      const { params } = matcher(req.path) || { params: {} }
      render(route, params, res).catch((err) => {
        console.error(err)
        res.status(500).send('Internal server error')
      })
    })
  })

  app.get('*', (_, res) => send404(res))

  const port = config.port || 3000
  const server = createServer(app)
  server.listen(port, () =>
    console.log(`🚀 Server is running on http://localhost:${port}`),
  )

  return server
}
