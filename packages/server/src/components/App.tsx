import type { ComponentType, PropsWithChildren } from 'react'

import { SSRShell } from './SSRShell.js'

interface AppProps {
  layout: ComponentType<PropsWithChildren> | null
  page: ComponentType
}

export function App({ layout: Layout, page: Page }: AppProps) {
  return (
    <SSRShell>
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
