import type { MouseEventHandler, ReactNode } from 'react'

import { useNavigate } from '../hooks/useNavigate.js'

export interface LinkProps {
  to: string
  children: ReactNode
}

export function Link({ to, children }: LinkProps) {
  const navigate = useNavigate()
  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={handleClick}>
      {children}
    </a>
  )
}
