import { join } from 'node:path'
import { cwd } from 'node:process'

import type { ComponentType } from 'react'
import type { F } from 'ts-toolbelt'

import { PageManifest } from '../lib/build/index.js'
import { loadConfig } from '../lib/config/index.js'

import type { PathParams } from './types.js'

interface RouteComponent<T extends string> {
  path: T
  component: F.NoInfer<ComponentType<PathParams<T>>>
}

interface AnyComponent {
  component: ComponentType<any>
}

export interface Page<T extends string> extends RouteComponent<T> {}
export interface Layout<T extends string> extends RouteComponent<T> {}

type Pages = Map<string, AnyComponent>
type Layouts = Map<string, Set<AnyComponent>>

interface CreatePage {
  <T extends string>(page: Page<T>): void
}

interface CreateLayout {
  <T extends string>(layout: Layout<T>): void
}

interface CreateRoutesFn {
  (createPage: CreatePage, createLayout: CreateLayout): void | Promise<void>
}

const getCreatePage = (store: Pages) => {
  const createPage = (<const Path extends string>(page: Page<Path>) => {
    store.set(page.path, { component: page.component })
  }) satisfies CreatePage

  return createPage
}

const getCreateLayout = (store: Layouts) => {
  const createLayout = (<const Path extends string>(layout: Layout<Path>) => {
    const layouts = store.get(layout.path) || new Set()
    layouts.add({ component: layout.component })
    store.set(layout.path, layouts)
  }) satisfies CreateLayout

  return createLayout
}

async function getUserCreateRoutes() {
  const entries = (await import(join(process.cwd(), 'src', 'entries.tsx'))) as {
    default: CreateRoutesFn
  }

  return entries.default
}

const fsCreateRoutes: CreateRoutesFn = async (createPage, createLayout) => {
  // 🤢
  const pageManifest = (
    (await import(join(cwd(), '.metaframework', 'page-manifest.json'), {
      with: { type: 'json' },
    })) as { default: PageManifest }
  ).default

  for (const { page, route } of Object.values(pageManifest)) {
    const { Page } = (await import(page.imports.server)) as {
      Page: ComponentType<{}>
    }

    createPage({
      path: route,
      component: Page,
    })

    for (const layout of page.layouts) {
      const { Layout } = (await import(layout.server)) as {
        Layout: ComponentType<{}>
      }

      createLayout({
        path: route,
        component: Layout,
      })
    }
  }
}

export async function createRoutes() {
  const config = await loadConfig()
  const pages: Pages = new Map()
  const layouts: Layouts = new Map()

  const createPage = getCreatePage(pages)
  const createLayout = getCreateLayout(layouts)

  if (config.routing === 'entries') {
    const userCreateRoutes = await getUserCreateRoutes()

    await Promise.resolve(userCreateRoutes(createPage, createLayout))
  } else {
    await fsCreateRoutes(createPage, createLayout)
  }

  return {
    pages,
    layouts,
  }
}
