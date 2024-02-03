import { sep } from 'node:path'

import { match } from 'path-to-regexp'

function isParamSegment(segment: string) {
  return (
    segment.startsWith('[') &&
    segment.endsWith(']') &&
    !segment.slice(1, -1).includes('[') &&
    !segment.slice(1, -1).includes(']')
  )
}

function convertParams(path: string) {
  return path
    .split(sep)
    .map((segment) =>
      isParamSegment(segment)
        ? segment.replace(/\[(.*?)\]/, (_match, param) => `:${param}`)
        : segment,
    )
    .join(sep)
}

export function createMatcher<T extends object = object>(path: string) {
  return match<T>(convertParams(path), {
    sensitive: true,
  })
}
