import { cache, type ComponentType, type PropsWithChildren } from 'react'

import type { RouteDescriptor } from '@framework/router'

interface Params {
  params?: object
}

interface ImportedRouteComponent {
  Component: ComponentType<PropsWithChildren<Params>> | null
}

interface ImportedPageComponent<T = {}> {
  Component: ComponentType<PropsWithChildren<Params & T>> | null
  loader: () => Promise<T>
}

export interface ImportedRoute<T = {}> {
  page: ImportedPageComponent<T>
  layout: ImportedRouteComponent
  fallback: ImportedRouteComponent
}

interface GetServerSideProps<T extends object> {
  (args: { params: object }): Promise<T>
}

interface RouteImport<T extends object = {}> {
  default: ComponentType<PropsWithChildren<Params>>
  getServerSideProps?: GetServerSideProps<T>
}

export async function importPage(
  { page, layout, fallback }: RouteDescriptor,
  params: object,
): Promise<ImportedRoute> {
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

  const loader = cache(() =>
    pageModule && pageModule.getServerSideProps !== undefined
      ? pageModule?.getServerSideProps({ params })
      : Promise.resolve({}),
  )

  return {
    page: { Component: Page, loader },
    layout: { Component: Layout },
    fallback: { Component: Fallback },
  }
}
