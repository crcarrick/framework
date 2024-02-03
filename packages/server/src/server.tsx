import { createServer } from 'node:http'
import { join, parse } from 'node:path'

import register from '@babel/register'
import compression from 'compression'
import express from 'express'
import { Suspense } from 'react'
import { renderToPipeableStream } from 'react-dom/server'

import { findConfig, loadConfig } from '@framework/config'
import { createRouteDescriptors } from '@framework/router'

register({
  ignore: [/(node_modules)/],
  presets: ['@babel/preset-env', '@babel/preset-react'],
})

import { ServerSideData } from './components/ServerSideData.js'
import { Shell } from './components/Shell.js'
import { importPage } from './utils/importPage.js'

export async function runServer() {
  const app = express()

  const root = await findConfig()
  const path = join(parse(root).dir, 'pages')
  const config = await loadConfig(root)
  const routes = await createRouteDescriptors(path)

  app.use(compression())
  app.use(express.static(join(import.meta.dirname, '..', 'public')))
  app.use((req, res) => {
    const route = Array.from(routes.values()).find(({ matcher }) => {
      return matcher(req.path)
    })

    if (!route) {
      return res.status(404).send('Not found')
    }

    const { params } = route.matcher(req.path) || { params: {} }
    const { page, layout, fallback } = importPage(route, params, 'dev')

    try {
      const Page = page.Component
      const Layout = layout.Component
      const Fallback = fallback.Component

      if (!Page) {
        console.error('Page component (index) not found for route:', route.path)
        return res.status(404).send('Not found')
      }

      // TODO: we should only wrap in Suspense / ServerSideData if there's a resource
      const Component = (
        <Suspense fallback={Fallback ? <Fallback /> : <div>Loading...</div>}>
          <ServerSideData resource={page.resource}>
            <Page params={params} />
          </ServerSideData>
        </Suspense>
      )

      const { pipe } = renderToPipeableStream(
        <Shell>{Layout ? <Layout>{Component}</Layout> : Component}</Shell>,
        {
          // bootstrapModules: ['/main.mjs'],
          onShellReady() {
            res.setHeader('content-type', 'text/html')
            pipe(res)
          },
        },
      )
    } catch (err) {
      console.error(err)
      res.status(500).send('Internal server error')
    }
  })

  const port = config.port || 3000
  const server = createServer(app)
  server.listen(port, () =>
    console.log(`🚀 Server is running on http://localhost:${port}`),
  )

  return server
}
