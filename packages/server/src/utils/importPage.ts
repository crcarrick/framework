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
  layouts: Array<ComponentType<PropsWithChildren<{}>>>
  fallback: ImportedRouteComponent
}

interface RouteImport<T extends object = {}> {
  Page: ComponentType<PropsWithChildren<Params>>
  Layout: ComponentType<PropsWithChildren<Params>>
  Fallback: ComponentType<PropsWithChildren<Params>>
  getServerSideProps?: GetServerSideProps<T>
  generateMetadata?: GenerateMetadata<T>
  metadata?: Metadata
}

export async function importPage(
  { page, route }: Route,
  params: object,
): Promise<ImportedRoute> {
  const pageModule = page
    ? ((await import(page.imports.server)) as RouteImport)
    : null

  const Page = pageModule?.Page ?? null
  const Fallback = pageModule?.Fallback ?? null

  const layouts: Array<ComponentType<PropsWithChildren<{}>>> = []
  for (const layout of page.layouts) {
    const layoutModule = (await import(layout.server)) as RouteImport
    layouts.push(layoutModule.Layout)
  }

  if (
    page.exports.includes('metadata') &&
    page.exports.includes('generateMetadata')
  ) {
    console.warn(
      `Route ${route} has both a \`generateMetadata\` and a \`metadata\` export. Using \`generateMetadata\`.`,
    )
  }

  const metadata: Metadata =
    pageModule && pageModule.generateMetadata !== undefined
      ? await Promise.resolve(pageModule.generateMetadata({ params }))
      : pageModule?.metadata ?? {}

  // what is `cache()` actually doing for us here?
  const loader = cache(() =>
    pageModule && pageModule.getServerSideProps !== undefined
      ? Promise.resolve(pageModule?.getServerSideProps({ params }))
      : Promise.resolve({}),
  )

  return {
    page: { Component: Page, loader, metadata },
    layouts,
    fallback: { Component: Fallback },
  }
}
