export type PageComponent = 'page' | 'layout' | 'fallback'

export function isPageComponent(key: string): key is PageComponent {
  return ['page', 'layout', 'fallback'].includes(key)
}

export function isValidPageComponent(
  key: string,
  exports: string[],
): key is PageComponent {
  return (
    isPageComponent(key) &&
    ['Page', 'Layout'].some((exp) => exports.includes(exp))
  )
}
