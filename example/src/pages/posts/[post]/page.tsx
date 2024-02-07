import type {
  GetServerSideProps,
  FrameworkComponentProps,
} from '@framework/types'

import { Header } from '../../../components/Header.js'

interface Params {
  post: string
}

export const getServerSideProps = (({ params }) => {
  return new Promise<{ title: string }>((resolve) => {
    setTimeout(
      () =>
        resolve({
          title: params.post === 'imspecial' ? 'Best Post' : 'Post',
        }),
      1000,
    )
  })
}) satisfies GetServerSideProps<Params>

export default function Post({
  title,
  params,
}: FrameworkComponentProps<Params, typeof getServerSideProps>) {
  return (
    <Header>
      {title}: {params.post}
    </Header>
  )
}
