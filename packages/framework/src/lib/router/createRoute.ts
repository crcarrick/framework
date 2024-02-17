import type { ReactNode } from 'react'

export interface Component<T extends object> {
  (props: T): ReactNode
}

type PathParams<T extends string> =
  T extends `${infer _S}/[${infer P}]/${infer R}`
    ? P extends ''
      ? PathParams<R>
      : { [K in P | keyof PathParams<R>]: string }
    : T extends `${infer _S}/[${infer P}]`
      ? P extends ''
        ? {}
        : { [K in P]: string }
      : {}

export interface Route<T extends string> {
  path: T
  component: Component<PathParams<T>>
}

export function createRoute<const T extends string>(_route: Route<T>) {
  //  TODO: Implementation
  //
  //  This function needs to write the route to some internal router state
  //  which we can use to construct the express routes which render the
  //  correct component.
  //
  //  We could accomplish that using some kind of global state, but that
  //  would prevent us from supporting multiple routers in the same app.
  //  (Is this actually a problem?)
  //
  //  Alternatively, we could use some kind of dependency injection to either
  //  pass the router state to the createRoute function, or pass some kind
  //  of wrapped createRoute function to the consumer.
}
