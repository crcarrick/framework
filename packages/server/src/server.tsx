import { createServer } from 'node:http'
import { join, parse } from 'node:path'

import register from '@babel/register'
import compression from 'compression'
import express from 'express'
import { renderToPipeableStream } from 'react-dom/server'

import { findConfig, loadConfig } from '@framework/config'
import { createRouteDescriptors } from '@framework/router'

register({
  ignore: [/(node_modules)/],
  presets: ['@babel/preset-env', '@babel/preset-react'],
})

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
    const route = routes.get(req.path)
    if (!route) {
      return res.status(404).send('Not found')
    }

    importPage(route, 'dev')
      .then(({ page, layout }) => {
        const Page = page.Component
        const Layout = layout.Component

        if (!Page) {
          return res.status(404).send('Not found')
        }

        const { pipe } = renderToPipeableStream(
          <Shell>
            {Layout ? (
              <Layout {...layout.serverSideProps}>
                <Page {...page.serverSideProps} />
              </Layout>
            ) : (
              <Page />
            )}
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
