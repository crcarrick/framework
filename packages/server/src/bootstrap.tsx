import type { ComponentType, ReactNode } from 'react'
import { hydrateRoot } from 'react-dom/client'

import { Shell } from './components/Shell.js'
import type { JSONComponent } from './utils/createSSRMetadata.js'

declare global {
  interface Window {
    __SSR_DEBUG: string
    __SSR_METADATA: JSONComponent
  }
}

async function importComponent(path: string) {
  const module = (await import(path)) as {
    default: ComponentType<{ children: ReactNode }>
  }
  return module.default
}

async function renderComponent(representation: JSONComponent) {
  if (
    typeof representation === 'string' ||
    typeof representation === 'number'
  ) {
    return representation
  }

  const { type, props } = representation
  const { children, ...restProps } = props
  const Component = await importComponent(type)
  const renderedChildren = await Promise.all(children.map(renderComponent))

  return (
    <Component key={type} {...restProps}>
      {renderedChildren}
    </Component>
  )
}

async function hydrate() {
  const data = window.__SSR_METADATA || {}
  const tree = await renderComponent(data)

  hydrateRoot(document, <Shell>{tree}</Shell>)
}

hydrate().catch((err) => {
  console.error(err)
  console.log('Hydration failed')
})
