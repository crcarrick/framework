import { GenerateMetadata } from 'metaframework'

interface Params {
  post: string
}

export const generateMetadata = (({ params }) => {
  return {
    title: `Post: ${params.post}`,
  }
}) satisfies GenerateMetadata<Params>

interface PostLayoutProps {
  children: React.ReactNode
}

export default function PostLayout({ children }: PostLayoutProps) {
  return <div style={{ backgroundColor: 'red', padding: 10 }}>{children}</div>
}
