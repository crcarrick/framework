import { match } from 'path-to-regexp'

export interface MatchPathOptions {
  path: string
  exact?: boolean
  strict?: boolean
  sensitive?: boolean
}

export interface MatchResult<T extends object = object> {
  url: string
  path: string
  params: T
  isExact: boolean
}

export function matchPath<T extends object = object>(
  pathname: string,
  { path, exact = false, strict = false, sensitive = false }: MatchPathOptions,
): MatchResult<T> | null {
  const matchResult = match(path, {
    strict,
    sensitive,
    end: exact,
    decode: decodeURIComponent,
  })(pathname)

  if (!matchResult) {
    return null
  }

  return {
    path,
    url: matchResult.path,
    params: matchResult.params as T,
    isExact: pathname === matchResult.path,
  }
}
