import type { ComponentType, PropsWithChildren } from 'react'

import type { RouteDescriptor, RoutePath } from '@framework/router'

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

function invalidate(routePath: RoutePath | null) {
  return routePath
    ? {
        ...routePath,
        fullPath: `${routePath.serverPath}?t=${Date.now()}`,
      }
    : null
}

export async function importPage(
  { page, layout, fallback }: RouteDescriptor,
  params: object,
): Promise<ImportedRoute> {
  if (process.env.NODE_ENV === 'development') {
    page = invalidate(page)
    layout = invalidate(layout)
    fallback = invalidate(fallback)
  }

  const pageModule = page
    ? ((await import(page.serverPath)) as RouteImport)
    : null
  const layoutModule = layout
    ? ((await import(layout.serverPath)) as RouteImport)
    : null
  const fallbackModule = fallback
    ? ((await import(fallback.serverPath)) as RouteImport)
    : null

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
