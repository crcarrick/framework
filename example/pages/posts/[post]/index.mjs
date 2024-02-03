import React from 'react'

import { Header } from '../../../components/Header'

export async function getServerSideProps({ params }) {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          title: params.post === 'imspecial' ? 'Best Post' : 'Post',
        }),
      1000,
    )
  })
}

export default function Post({ title, params }) {
  return (
    <Header>
      {title}: {params.post}
    </Header>
  )
}
