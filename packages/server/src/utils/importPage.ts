import { createRequire } from 'node:module'

import type { ComponentType, PropsWithChildren } from 'react'

import type { RouteDescriptor } from '@framework/router'

import { createResource, type Resource } from './createResource.js'

interface Params {
  params?: object
}

interface ImportedRouteComponent {
  Component: ComponentType<PropsWithChildren<Params>> | null
}

interface ImportedPageComponent extends ImportedRouteComponent {
  resource: Resource
}

interface ImportedRoute {
  page: ImportedPageComponent
  layout: ImportedRouteComponent
  fallback: ImportedRouteComponent
}

interface GetServerSideProps<T extends object> {
  (args: { params: object }): Promise<T>
}

interface RouteImport<T extends object = object> {
  default: ComponentType<PropsWithChildren<Params>>
  getServerSideProps?: GetServerSideProps<T>
}

const require = createRequire(import.meta.url)

function invalidate(url: string) {
  if (require.cache[url]) {
    delete require.cache[url]
  }
}

export function importPage(
  { page, layout, fallback }: RouteDescriptor,
  params: object,
  mode: 'dev' | 'prod' = 'prod',
): ImportedRoute {
  if (mode === 'dev') {
    for (const url of [page, layout].filter(
      (url): url is Exclude<typeof url, null> => Boolean(url),
    )) {
      invalidate(url)
    }
  }

  const pageModule = page ? (require(page) as RouteImport) : null
  const layoutModule = layout ? (require(layout) as RouteImport) : null
  const fallbackModule = fallback ? (require(fallback) as RouteImport) : null

  const Page = pageModule?.default ?? null
  const Layout = layoutModule?.default ?? null
  const Fallback = fallbackModule?.default ?? null

  const resource =
    pageModule && pageModule.getServerSideProps
      ? createResource(pageModule.getServerSideProps({ params }))
      : createResource(Promise.resolve({}))

  return {
    page: { Component: Page, resource },
    layout: { Component: Layout },
    fallback: { Component: Fallback },
  }
}
