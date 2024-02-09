import type { Prettify } from '@framework/types'

export type PageComponent = 'page' | 'layout' | 'fallback'
export type PageComponentExport =
  | 'default'
  | 'getServerSideProps'
  | 'getStaticProps'
  | 'metadata'
  | 'generateMetadata'
export interface PageOut {
  exports: PageComponentExport[]
  imports: {
    client: string
    server: string
  }
}
export type Page = Prettify<
  Record<PageComponent, PageOut> & {
    route: string
    match: string
  }
>
export interface PageManifest {
  [routePath: string]: Page
}

function isPageComponent(key: string) {
  return ['page', 'layout', 'fallback'].includes(key)
}

export function isValidPageComponent(
  key: string,
  exports: string[],
): key is PageComponent {
  return isPageComponent(key) && exports.includes('default')
}
