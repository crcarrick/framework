import { cloneElement, isValidElement } from 'react'

import type { Resource } from '../utils/createResource.js'

interface ServerSideDataProps {
  children: React.ReactNode
  resource: Resource
}

export function ServerSideData({ children, resource }: ServerSideDataProps) {
  const data = resource.read()

  if (isValidElement(children)) {
    return cloneElement(children, data)
  }
}
