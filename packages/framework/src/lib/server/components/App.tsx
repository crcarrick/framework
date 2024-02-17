import type { ComponentType, PropsWithChildren } from 'react'

import type { Metadata } from '../../types/index.js'

import { Layout } from './Layout.js'
import { SSRShell } from './SSRShell.js'

interface AppProps {
  layouts: Array<ComponentType<PropsWithChildren>> | null
  page: ComponentType
  metadata: Metadata
}

export function App({ layouts, page: Page, metadata }: AppProps) {
  return (
    <SSRShell metadata={metadata}>
      {layouts && layouts.length ? (
        <Layout layouts={layouts}>
          <Page />
        </Layout>
      ) : (
        <Page />
      )}
    </SSRShell>
  )
}
