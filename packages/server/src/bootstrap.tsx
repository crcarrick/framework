import { Suspense, type ComponentType, type ReactNode } from 'react'
import { hydrateRoot } from 'react-dom/client'

import { Shell } from './components/Shell.js'
import type { SSRMetadata } from './utils/createSSRMetadata.js'

declare global {
  interface Window {
    __SSR_METADATA: SSRMetadata
  }
}

async function importComponent(path: string) {
  const module = (await import(path)) as {
    default: ComponentType<{ children?: ReactNode }>
  }
  return module.default
}

async function renderComponent(metadata: SSRMetadata) {
  const { page, layout, fallback } = metadata

  const Page = await importComponent(page.type)
  const Layout = layout ? await importComponent(layout.type) : null
  const Fallback = fallback ? await importComponent(fallback.type) : null

  const FallbackComponent = Fallback ? <Fallback /> : <div>Loading...</div>
  const PageComponent = (
    <Suspense fallback={FallbackComponent}>
      <Page {...page.props} />
    </Suspense>
  )

  return Layout ? <Layout>{PageComponent}</Layout> : PageComponent
}

async function hydrate() {
  const data = window.__SSR_METADATA || {}
  const tree = await renderComponent(data)

  hydrateRoot(document, <Shell>{tree}</Shell>)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
hydrate()
