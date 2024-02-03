import React from 'react'
import ReactDOMClient from 'react-dom/client'

async function importComponent(path) {
  const module = await import(/* webpackIgnore: true */ path)
  return module
}

async function renderComponent(representation) {
  if (
    typeof representation === 'string' ||
    typeof representation === 'number'
  ) {
    return representation
  }

  const { type, props } = representation
  const Component = await importComponent(type)
  const children = await Promise.all(
    (props.children ?? []).map(renderComponent),
  )

  return React.createElement(Component, props, children)
}

async function hydrate() {
  const data = __SSR_METADATA || {}
  const tree = await renderComponent(data)

  ReactDOMClient.hydrateRoot(document, tree)
}

hydrate()
