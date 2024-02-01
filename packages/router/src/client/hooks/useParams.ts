import { useContext } from 'react'

import { RouterContext } from '../contexts/Router.js'

export function useParams<T extends object = object>() {
  return useContext(RouterContext).params as T
}
