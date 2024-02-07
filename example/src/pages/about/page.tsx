import type {
  GetServerSideProps,
  FrameworkComponentProps,
} from '@framework/types'

import { Header } from '../../components/Header.js'

export const getServerSideProps = (() => {
  return new Promise<{ name: string; email: string }>((resolve) => {
    setTimeout(
      () =>
        resolve({
          name: 'Chris Carrick',
          email: 'chris@crcarrick.dev',
        }),
      1000,
    )
  })
}) satisfies GetServerSideProps

export default function AboutPage({
  name,
  email,
}: FrameworkComponentProps<{}, typeof getServerSideProps>) {
  return (
    <>
      <Header>{name}</Header>
      <a href={`mailto:${email}`}>Email: {email}</a>
    </>
  )
}
