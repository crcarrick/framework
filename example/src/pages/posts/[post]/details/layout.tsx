interface PostDetailsLayoutProps {
  children: React.ReactNode
}

export const metadata = {
  title: 'Post Details',
}

export default function PostDetailsLayout({
  children,
}: PostDetailsLayoutProps) {
  return <div style={{ backgroundColor: 'blue', padding: 10 }}>{children}</div>
}
