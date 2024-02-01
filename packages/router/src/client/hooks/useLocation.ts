import { useContext } from 'react'

import { RouterContext } from '../contexts/Router.js'

export function useLocation() {
  return useContext(RouterContext).location
}
