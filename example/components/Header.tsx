interface HeaderProps {
  children: React.ReactNode
}

export function Header({ children }: HeaderProps) {
  return <h1>{children}</h1>
}
