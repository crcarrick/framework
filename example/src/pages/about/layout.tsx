interface AboutLayoutProps {
  children: React.ReactNode
}

export default function AboutLayout({ children }: AboutLayoutProps) {
  return <div style={{ backgroundColor: 'lightgray' }}>{children}</div>
}
