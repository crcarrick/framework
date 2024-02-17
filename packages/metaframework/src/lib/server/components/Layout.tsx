import type { ComponentType, PropsWithChildren } from 'react'

interface LayoutProps {
  layouts: Array<ComponentType<PropsWithChildren<{}>>>
}

export function Layout({ children, layouts }: PropsWithChildren<LayoutProps>) {
  return layouts.reduceRight((acc, Layout) => {
    return Layout ? <Layout>{acc}</Layout> : acc
  }, children)
}
