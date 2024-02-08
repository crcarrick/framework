import {
  cloneElement,
  isValidElement,
  use,
  type ReactNode,
  type Usable,
} from 'react'

interface ServerSidePropsProps<T = {}> {
  children: ReactNode
  resource: Usable<T>
}

export function ServerSideProps({ children, resource }: ServerSidePropsProps) {
  const data = use(resource)

  if (!isValidElement(children)) {
    throw new Error('`ServerSideProps` children must be a valid React element')
  }

  return cloneElement(children, data)
}
