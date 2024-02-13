export const metadata = {
  title: 'Example App',
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

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return <div>{children}</div>
}
