import {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  useMemo,
} from 'react'
import {
  createBrowserHistory,
  type BrowserHistory,
  type Location,
} from 'history'

export interface Navigate {
  (to: string): void
}

export interface UpdateParams<T extends object = object> {
  (params: T): void
}

export interface RouterContext<T extends object = object> {
  params: T
  history: BrowserHistory | undefined
  location: Location | undefined
  navigate: Navigate
  updateParams: UpdateParams<T>
}

export interface RouterProviderProps {
  children: ReactNode
}

export const RouterContext = createContext<RouterContext>({
  params: {},
  history: undefined,
  location: undefined,
  navigate: () => {},
  updateParams: () => {},
})

export function Router({ children }: RouterProviderProps) {
  const history = useRef<BrowserHistory>()
  const [params, setParams] = useState({})
  const [location, setLocation] = useState<Location>()

  const navigate = useCallback<Navigate>((to) => history.current?.push(to), [])
  const updateParams = useCallback<UpdateParams>(
    (nextParams) => setParams(nextParams),
    [],
  )

  useEffect(() => {
    if (!history.current) {
      history.current = createBrowserHistory()
    }

    return history.current.listen(({ location }) => setLocation(location))
  }, [])

  const value = useMemo(
    () => ({
      params,
      history: history.current,
      location,
      navigate,
      updateParams,
    }),
    [location, params, navigate, updateParams],
  )

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  )
}
