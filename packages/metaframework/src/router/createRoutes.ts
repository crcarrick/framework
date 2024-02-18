import { join } from 'node:path'

import type { ComponentType } from 'react'
import type { F } from 'ts-toolbelt'

import type { PathParams } from './types.js'

interface RouteComponent<T extends string> {
  path: T
  component: F.NoInfer<ComponentType<PathParams<T>>>
}

export interface Page<T extends string> extends RouteComponent<T> {}
export interface Layout<T extends string> extends RouteComponent<T> {}

type Pages = Map<string, Page<string>>
type Layouts = Map<string, Layout<string>>

interface CreateRouteComponent {
  <T extends string>(route: RouteComponent<T>): void
}

interface CreateRoutesFn {
  (
    createPage: CreateRouteComponent,
    createLayout: CreateRouteComponent,
  ): void | Promise<void>
}

const getCreatePage = (store: Pages) => {
  const createPage = (<const Path extends string>(page: Page<Path>) => {
    store.set(page.path, page)
  }) satisfies CreateRouteComponent

  return createPage
}

const getCreateLayout = (store: Layouts) => {
  const createLayout = (<const Path extends string>(layout: Layout<Path>) => {
    store.set(layout.path, layout)
  }) satisfies CreateRouteComponent

  return createLayout
}

async function getUserCreateRoutes() {
  const entries = (await import(join(process.cwd(), 'src', 'entries.tsx'))) as {
    default: CreateRoutesFn
  }

  return entries.default
}

export async function createRoutes() {
  const pages: Pages = new Map()
  const layouts: Layouts = new Map()
  const userCreateRoutes = await getUserCreateRoutes()

  const createPage = getCreatePage(pages)
  const createLayout = getCreateLayout(layouts)

  await Promise.resolve(userCreateRoutes(createPage, createLayout))

  return {
    pages,
    layouts,
  }
}
