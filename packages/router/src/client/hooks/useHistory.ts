import { useContext } from 'react'

import { RouterContext } from '../contexts/Router.js'

export function useHistory() {
  return useContext(RouterContext).history
}
