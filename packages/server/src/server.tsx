import { createServer } from 'node:http'
import { join, parse } from 'node:path'

import compression from 'compression'
import express from 'express'
import { Suspense } from 'react'
import { renderToPipeableStream } from 'react-dom/server'

import { findConfig, loadConfig } from '@framework/config'
import { createRouteDescriptors } from '@framework/router'

import { Shell } from './components/Shell.js'
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

        // TODO: this stinks because we have to wait for the ssr data before we can
        //       even start rendering the page
        page.loader
          .then((data) => {
            const props = {
              ...params,
              ...data,
            }

            const PageComponent = (
              <Suspense
                fallback={Fallback ? <Fallback /> : <div>Loading...</div>}
              >
                <Page {...props} />
              </Suspense>
            )
            const App = (
              <Shell>
                {Layout ? <Layout>{PageComponent}</Layout> : PageComponent}
              </Shell>
            )

            const { pipe } = renderToPipeableStream(App, {
              bootstrapModules: ['/public/bootstrap.js'],
              bootstrapScriptContent: `
                window.__SSR_METADATA = ${JSON.stringify(createSSRMetadata(route, props))}
              `,
              onShellReady() {
                res.setHeader('content-type', 'text/html')
                pipe(res)
              },
            })
          })
          .catch((err) => {
            console.error(err)
            res.status(500).send('Internal server error')
          })
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
