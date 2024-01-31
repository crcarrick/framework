import { join, parse } from 'node:path'

import express from 'express'

import { findConfig, loadConfig } from '@framework/config'
import { createRouteMap } from '@framework/router'
import { createElement } from 'react'
import { renderToPipeableStream } from 'react-dom/server'

export async function runServer() {
  const app = express()

  const root = await findConfig()
  const config = await loadConfig(root)
  // TODO: ensure pages directory exists
  const routeMap = await createRouteMap(join(parse(root).dir, 'pages'))

  console.log(routeMap)

  app.use((req, res) => {
    const Component = routeMap.get(req.path)
    if (!Component || typeof Component !== 'function') {
      return res.status(404).send('Not found')
    }

    return renderToPipeableStream(createElement(Component, {})).pipe(res)
  })

  const port = config.port || 3000
  app.listen(port, () =>
    console.log(`🚀 Server is running on http://localhost:${port}`),
  )
}
