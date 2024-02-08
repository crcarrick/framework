import type { ReactNode } from 'react'

import type { Metadata } from '@framework/types'

interface SSRShellProps {
  children: ReactNode
  metadata: Metadata
}

export function SSRShell({ children, metadata }: SSRShellProps) {
  const title = metadata.title ?? 'Framework'

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
      </head>
      <body>{children}</body>
    </html>
  )
}
