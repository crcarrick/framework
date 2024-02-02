import { createRequire } from 'node:module'

import type { ComponentType } from 'react'

import type { RouteDescriptor } from '@framework/router'

interface ImportedRouteComponent<T extends object = object> {
  Component: ComponentType<T> | null
  serverSideProps: T
}

interface ImportedRoute<
  TPage extends object = object,
  TLayout extends object = object,
> {
  page: ImportedRouteComponent<TPage>
  layout: ImportedRouteComponent<TLayout>
}

interface GetServerSideProps<T extends object> {
  (): Promise<T>
}

interface RouteImport<T extends object = object> {
  default: ComponentType<T>
  getServerSideProps?: GetServerSideProps<T>
}

const require = createRequire(import.meta.url)

function invalidate(url: string) {
  if (require.cache[url]) {
    delete require.cache[url]
  }
}

export async function importPage(
  { page, layout }: RouteDescriptor,
  mode: 'dev' | 'prod' = 'prod',
): Promise<ImportedRoute> {
  if (mode === 'dev') {
    for (const url of [page, layout].filter(
      (url): url is Exclude<typeof url, null> => Boolean(url),
    )) {
      invalidate(url)
    }
  }

  const pageModule = page ? (require(page) as RouteImport) : null
  const layoutModule = layout ? (require(layout) as RouteImport) : null

  const Page = pageModule?.default ?? null
  const Layout = layoutModule?.default ?? null

  const pageProps = pageModule?.getServerSideProps
    ? await pageModule.getServerSideProps()
    : {}
  const layoutProps = layoutModule?.getServerSideProps
    ? await layoutModule.getServerSideProps()
    : {}

  return {
    page: {
      Component: Page,
      serverSideProps: pageProps,
    },
    layout: {
      Component: Layout,
      serverSideProps: layoutProps,
    },
  }
}
