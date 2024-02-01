import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  type ComponentType,
  type ReactNode,
} from 'react'

import { matchPath, type MatchResult } from '../utils/matchPath.js'
import { useLocation } from '../hooks/useLocation.js'
import { useUpdateParams } from '../hooks/useUpdateParams.js'

export interface RouteComponentProps {
  match: MatchResult
  children?: ReactNode
}

export type RouteComponent = ComponentType<RouteComponentProps>

export interface RouteProps {
  path: string
  exact?: boolean
  children?: ReactNode
  component?: RouteComponent
}

export function Route({
  children,
  path,
  exact = false,
  component: Component,
}: RouteProps) {
  const location = useLocation()
  const updateParams = useUpdateParams()
  const pathname = location?.pathname ?? ''

  const match = useMemo(
    () =>
      matchPath(pathname, {
        exact,
        path,
      }),
    [exact, path, pathname],
  )

  useEffect(() => {
    if (match) {
      updateParams(match.params)
    }
  }, [match, updateParams])

  if (!match) {
    return null
  }

  const props: RouteComponentProps = { match }

  if (Component) {
    return <Component {...props} />
  }

  if (isValidElement<RouteComponentProps>(children)) {
    return cloneElement(children, props)
  }
}
