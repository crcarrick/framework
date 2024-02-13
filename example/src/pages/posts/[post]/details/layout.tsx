interface PostDetailsLayoutProps {
  children: React.ReactNode
}

export default function PostDetailsLayout({
  children,
}: PostDetailsLayoutProps) {
  return <div style={{ backgroundColor: 'blue', padding: 10 }}>{children}</div>
}
