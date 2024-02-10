import type { ComponentType, PropsWithChildren } from 'react'

import type { Metadata } from '@framework/types'

import { SSRShell } from './SSRShell.js'

interface AppProps {
  page: ComponentType
  layout: ComponentType<PropsWithChildren> | undefined
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
