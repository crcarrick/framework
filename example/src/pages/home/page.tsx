import type { Metadata } from '@framework/types'

import { Header } from '../../components/Header.js'

export const metadata: Metadata = {
  title: 'Home Page',
}

export default function HomePage() {
  return <Header>Home</Header>
}
