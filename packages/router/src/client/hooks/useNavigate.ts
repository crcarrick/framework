import { useContext } from 'react'

import { RouterContext } from '../contexts/Router.js'

export function useNavigate() {
  return useContext(RouterContext).navigate
}
