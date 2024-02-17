import type { ReactNode } from 'react'

import type { Metadata } from '../../types/index.js'
import { createLinkTags } from '../utils/createLinkTags.js'
import { createMetaTags } from '../utils/createMetaTags.js'

interface SSRShellProps {
  children: ReactNode
  metadata: Metadata
}

export function SSRShell({ children, metadata }: SSRShellProps) {
  const title = metadata.title ?? 'metaframework'
  const metaTags = createMetaTags(metadata)
  const linkTags = createLinkTags(metadata)

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {metaTags}
        {linkTags}
        <title>{title}</title>
      </head>
      <body>{children}</body>
    </html>
  )
}
