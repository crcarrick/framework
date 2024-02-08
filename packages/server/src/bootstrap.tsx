import { Suspense, type ComponentType, type ReactNode } from 'react'
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

async function importComponent(path: string) {
  const module = (await import(path)) as {
    default: ComponentType<{ children?: ReactNode }>
  }
  return module.default
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

async function renderComponent({ page, layout, fallback }: SSRRepresentation) {
  const Page = await importComponent(page.type)
  const Layout = layout ? await importComponent(layout.type) : null
  const Fallback = fallback ? await importComponent(fallback.type) : null

  const PageComponent = () => (
    <Suspense fallback={Fallback ? <Fallback /> : <Loading />}>
      <GSSPResolver resource={resource()}>
        <Page {...page.props} />
      </GSSPResolver>
    </Suspense>
  )

  return <App layout={Layout} page={PageComponent} />
}

async function hydrate() {
  const App = await renderComponent(window.__SSR || {})

  hydrateRoot(document, App)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
hydrate()
