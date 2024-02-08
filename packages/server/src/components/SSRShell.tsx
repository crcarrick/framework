import type { ReactNode } from 'react'

interface SSRShellProps {
  children: ReactNode
}

export function SSRShell({ children }: SSRShellProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Framework</title>
      </head>
      <body>{children}</body>
    </html>
  )
}
