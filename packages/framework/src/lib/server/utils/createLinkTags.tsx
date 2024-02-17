import type { Metadata } from '../../types/index.js'

type LinkAttrs = Omit<React.LinkHTMLAttributes<HTMLLinkElement>, 'children'>

function createLinkAttrs(metadata: Metadata): LinkAttrs[] {
  const authors = (metadata.authors ?? []).reduce<LinkAttrs[]>(
    (acc, { url }) => {
      if (url) acc.push({ rel: 'author', href: url })
      return acc
    },
    [],
  )

  return [...authors]
}

export function createLinkTags(metadata: Metadata) {
  return createLinkAttrs(metadata).map((attrs, index) => (
    <link key={index} {...attrs} />
  ))
}
