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
    __SSP_EMITTER: SSPEmitter
  }
}

class SSPEmitter extends EventTarget {
  emit() {
    this.dispatchEvent(new Event('__SSP'))
  }
}

window.__SSP_EMITTER = new SSPEmitter()

async function importComponent(path: string) {
  const { Page, Fallback } = (await import(path)) as {
    Page: ComponentType<PropsWithChildren<{}>>
    Fallback: ComponentType<PropsWithChildren<{}>>
  }

  return {
    Page,
    Fallback,
  }
}

async function importLayouts(paths: string[]) {
  const layouts = await Promise.all(
    paths.map(
      (path) =>
        import(path) as Promise<{
          Layout: ComponentType<PropsWithChildren<{}>>
        }>,
    ),
  )

  return layouts.map((module) => module.Layout)
}

async function resource() {
  return new Promise<Window['__SSP']>((resolve) => {
    window.__SSP_EMITTER.addEventListener('__SSP', () => resolve(window.__SSP))
  })
}

async function renderComponent({ page, metadata }: SSRRepresentation) {
  const { Page, Fallback } = await importComponent(page.type)
  const layouts = await importLayouts(page.layouts)
  const appProps: ComponentProps<typeof App> = {
    metadata,
    layout: ({ children }: PropsWithChildren<{}>) => {
      return layouts.reduceRight((acc, Layout) => {
        return Layout ? <Layout>{acc}</Layout> : acc
      }, children)
    },
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
