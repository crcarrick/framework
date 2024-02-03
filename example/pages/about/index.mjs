import React from 'react'

import { Header } from '../../components/Header.mjs'

export async function getServerSideProps() {
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          name: 'Chris Carrick',
          email: 'chris@crcarrick.dev',
        }),
      1000,
    )
  })
}

export default function AboutPage({ name, email }) {
  return (
    <>
      <Header>{name}</Header>
      <a href={`mailto:${email}`}>{email}</a>
    </>
  )
}
