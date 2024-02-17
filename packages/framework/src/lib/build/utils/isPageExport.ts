export const PAGE_EXPORTS = [
  'Page',
  'Layout',
  'Fallback',
  'getServerSideProps',
  'getStaticProps',
  'metadata',
  'generateMetadata',
] as const

export type PageExport = (typeof PAGE_EXPORTS)[number]

export function isPageExport(key: string): key is PageExport {
  return Array.prototype.includes.call(PAGE_EXPORTS, key)
}
