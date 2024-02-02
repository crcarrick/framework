import React from 'react'

import { Header } from '../../components/Header'

export async function getServerSideProps() {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          title: 'About',
        }),
      1000,
    )
  })
}

export default function Component({ title }) {
  return <Header>{title}</Header>
}
