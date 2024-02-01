import { useContext } from 'react'

import { RouterContext } from '../contexts/Router.js'

export function useUpdateParams() {
  return useContext(RouterContext).updateParams
}
