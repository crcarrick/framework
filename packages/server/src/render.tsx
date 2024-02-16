import type { Response } from 'express'
import { Suspense, type ComponentProps } from 'react'
import { renderToPipeableStream } from 'react-dom/server'

import type { Page } from '@framework/build'

import { App } from './components/App.js'
import { GSSPResolver } from './components/GSSPResolver.js'
import { Loading } from './components/Loading.js'
import { FrameworkResponse } from './utils/FrameworkResponse.js'
import { importPage } from './utils/importPage.js'
import { send404 } from './utils/send404.js'
import { toSSRRepresentation } from './utils/toSSRRepresentation.js'

export async function render<T extends object>(
  route: Page,
  params: T,
  res: Response,
) {
  const { page, layouts, fallback } = await importPage(route, params)

  const Page = page.Component
  const Fallback = fallback.Component

  if (!Page) {
    console.error(`Found no default export at ${route.route}`)
    return send404(res)
  }

  const metadata = page.metadata
  const resource = page.loader()
  const response = new FrameworkResponse(res, resource)
  const pageProps: ComponentProps<typeof Page> = { params }
  const appProps: ComponentProps<typeof App> = {
    metadata,
    layouts,
    page: () => (
      <Suspense fallback={Fallback ? <Fallback /> : <Loading />}>
        <GSSPResolver resource={resource}>
          <Page {...pageProps} />
        </GSSPResolver>
      </Suspense>
    ),
  }

  const stream = renderToPipeableStream(<App {...appProps} />, {
    bootstrapModules: ['/public/bootstrap.js'],
    bootstrapScriptContent: `__SSR = ${toSSRRepresentation(route, metadata, pageProps)};`,
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
  })
}
