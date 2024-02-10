import {
  Suspense,
  type ComponentProps,
  type ComponentType,
  type PropsWithChildren,
} from 'react'
import { hydrateRoot } from 'react-dom/client'

import { App } from './components/App.js'
import { GSSPResolver } from './components/GSSPResolver.js'
import { Loading } from './components/Loading.js'
import type { SSRRepresentation } from './utils/toSSRRepresentation.js'

declare global {
  interface Window {
    __SSP: object
    __SSR: SSRRepresentation
  }
}

interface RouteComponents {
  Page: ComponentType<PropsWithChildren>
  Layout?: ComponentType<PropsWithChildren>
  Fallback?: ComponentType<PropsWithChildren>
}

async function importComponent(path: string) {
  return (await import(path)) as RouteComponents
}

async function resource() {
  return new Promise<Window['__SSP']>((resolve) => {
    // nice hack
    const interval = setInterval(() => {
      if (window.__SSP) {
        clearInterval(interval)
        resolve(window.__SSP)
      }
    }, 10)
  })
}

async function renderComponent({ page, metadata }: SSRRepresentation) {
  const { Page, Layout, Fallback } = await importComponent(page.type)
  const appProps: ComponentProps<typeof App> = {
    metadata,
    layout: Layout,
    page: () => (
      <Suspense fallback={Fallback ? <Fallback /> : <Loading />}>
        <GSSPResolver resource={resource()}>
          <Page {...page.props} />
        </GSSPResolver>
      </Suspense>
    ),
  }

  return <App {...appProps} />
}

async function hydrate() {
  const App = await renderComponent(window.__SSR || {})

  hydrateRoot(document, App)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
hydrate()
