import { cache, type ComponentType, type PropsWithChildren } from 'react'

import type { Page as Route } from '@framework/build'
import type {
  GenerateMetadata,
  GetServerSideProps,
  Metadata,
} from '@framework/types'

interface Params {
  params?: object
}

interface ImportedRouteComponent {
  Component: ComponentType<PropsWithChildren<Params>> | null
}

interface ImportedPageComponent<T = {}> {
  Component: ComponentType<PropsWithChildren<Params & T>> | null
  loader: () => Promise<T>
  metadata: Metadata
}

export interface ImportedRoute<T = {}> {
  page: ImportedPageComponent<T>
  layout: ImportedRouteComponent
  fallback: ImportedRouteComponent
}

interface RouteImport<T extends object = {}> {
  default: ComponentType<PropsWithChildren<Params>>
  getServerSideProps?: GetServerSideProps<T>
  generateMetadata?: GenerateMetadata<T>
  metadata?: Metadata
}

export async function importPage(
  { page, layout, fallback }: Route,
  params: object,
): Promise<ImportedRoute> {
  const pageModule = page
    ? ((await import(page.imports.server)) as RouteImport)
    : null
  const layoutModule = layout
    ? ((await import(layout.imports.server)) as RouteImport)
    : null
  const fallbackModule = fallback
    ? ((await import(fallback.imports.server)) as RouteImport)
    : null

  const Page = pageModule?.default ?? null
  const Layout = layoutModule?.default ?? null
  const Fallback = fallbackModule?.default ?? null

  if (
    layout?.exports.includes('metadata') &&
    layout?.exports.includes('generateMetadata')
  ) {
    console.warn(
      `Layout ${layout.imports.client} has both a \`generateMetadata\` and a \`metadata\` export. Using \`generateMetadata\`.`,
    )
  }

  const metadata: Metadata =
    layoutModule && layoutModule.generateMetadata !== undefined
      ? await Promise.resolve(layoutModule.generateMetadata({ params }))
      : layoutModule?.metadata ?? {}

  // what is `cache()` actually doing for us here?
  const loader = cache(() =>
    pageModule && pageModule.getServerSideProps !== undefined
      ? Promise.resolve(pageModule?.getServerSideProps({ params }))
      : Promise.resolve({}),
  )

  return {
    page: { Component: Page, loader, metadata },
    layout: { Component: Layout },
    fallback: { Component: Fallback },
  }
}
