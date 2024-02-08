import type { ComponentType, PropsWithChildren } from 'react'

import type { Metadata } from '@framework/types'

import { SSRShell } from './SSRShell.js'

interface AppProps {
  layout: ComponentType<PropsWithChildren> | null
  page: ComponentType
  metadata: Metadata
}

export function App({ layout: Layout, page: Page, metadata }: AppProps) {
  return (
    <SSRShell metadata={metadata}>
      {Layout ? (
        <Layout>
          <Page />
        </Layout>
      ) : (
        <Page />
      )}
    </SSRShell>
  )
}
