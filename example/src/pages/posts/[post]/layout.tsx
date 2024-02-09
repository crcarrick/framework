import { GenerateMetadata } from '@framework/types'

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
  return children
}
