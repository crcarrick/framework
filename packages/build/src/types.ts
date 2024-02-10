export const pageComponentExportSet = new Set([
  'Page',
  'Layout',
  'Fallback',
  'getServerSideProps',
  'getStaticProps',
  'metadata',
  'generateMetadata',
] as const)

export type PageComponentExport =
  typeof pageComponentExportSet extends Set<infer T> ? T : never
export interface PageOut {
  exports: PageComponentExport[]
  imports: {
    client: string
    server: string
  }
}
export type Page = {
  page: PageOut
  route: string
  match: string
}
export interface PageManifest {
  [routePath: string]: Page
}

export function isValidPageComponent(exports: string[]) {
  return exports.some((exp) => exp === 'Page' || exp === 'Layout')
}
