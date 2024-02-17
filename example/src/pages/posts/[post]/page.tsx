import type { GetServerSideProps, FrameworkComponentProps } from 'metaframework'

import { Header } from '../../../components/Header.js'

interface Params {
  post: string
}

export const getServerSideProps = (({ params }) => {
  return new Promise<{ description: string }>((resolve) => {
    setTimeout(
      () =>
        resolve({
          description:
            params.post === 'veryspecialpost' ? 'Best Post' : 'Okay Post',
        }),
      1000,
    )
  })
}) satisfies GetServerSideProps<Params>

export default function Post({
  description,
  params,
}: FrameworkComponentProps<Params, typeof getServerSideProps>) {
  return (
    <div>
      <Header>{params.post}</Header>
      <p>{description}</p>
    </div>
  )
}
