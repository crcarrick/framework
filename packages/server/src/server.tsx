import { createServer } from 'node:http'
import { join, parse } from 'node:path'

import compression from 'compression'
import express from 'express'
import { Suspense } from 'react'
import { renderToPipeableStream } from 'react-dom/server'

import { findConfig, loadConfig } from '@framework/config'
import { createRouteDescriptors } from '@framework/router'

import { ServerSideProps } from './components/ServerSideProps.js'
import { Shell } from './components/Shell.js'
import { FrameworkResponse } from './utils/FrameworkResponse.js'
import { createSSRMetadata } from './utils/createSSRMetadata.js'
import { importPage } from './utils/importPage.js'

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

    if (!route) {
      return res.status(404).send('Not found')
    }

    const { params } = route.matcher(req.path) || { params: {} }
    importPage(route, params)
      .then((importedRoute) => {
        const { page, layout, fallback } = importedRoute

        const Page = page.Component
        const Layout = layout.Component
        const Fallback = fallback.Component

        if (!Page) {
          console.error(
            'Page component (page.{j,t}s{,x}) not found for route:',
            route.path,
          )
          return res.status(404).send('Not found')
        }

        const FallbackComponent = Fallback ? (
          <Fallback />
        ) : (
          <div>Loading...</div>
        )

        const resource = page.loader()
        const props = { params }
        const PageComponent = (
          <Suspense fallback={FallbackComponent}>
            <ServerSideProps resource={resource}>
              <Page {...props} />
            </ServerSideProps>
          </Suspense>
        )

        const LayoutComponent = Layout ? (
          <Layout>{PageComponent}</Layout>
        ) : (
          PageComponent
        )

        const response = new FrameworkResponse(res, resource)
        const stream = renderToPipeableStream(
          <Shell>{LayoutComponent}</Shell>,
          {
            bootstrapModules: ['/public/bootstrap.js'],
            bootstrapScriptContent: `
            window.__SSR_METADATA = ${JSON.stringify(createSSRMetadata(route, props))}
          `,
            onShellReady() {
              response.shellReady = true
              res.setHeader('content-type', 'text/html')
              // @ts-expect-error idk
              stream.pipe(response)
            },
            onShellError(err) {
              console.error(err)
            },
            onError(err) {
              console.error(err)
            },
          },
        )
      })
      .catch((err) => {
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
