import type { Metadata } from '@framework/types'

export const metadata: Metadata = {
  title: 'Home Page',
  description: 'The home page of our example app.',
  applicationName: 'Example App',
  generator: 'Framework',
  keywords: ['Framework', 'Example App'],
  referrer: 'origin-when-cross-origin',
  creator: 'Chris Carrick',
  publisher: 'Chris Carrick',
  authors: [
    { name: 'Chris Carrick' },
    { name: 'Chris Carrick', url: 'https://crcarrick.dev' },
  ],
}

interface HomeLayoutProps {
  children: React.ReactNode
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return children
}
