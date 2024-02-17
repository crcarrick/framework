import type { Metadata } from '../../types/index.js'

type MetaAttrs = Omit<React.MetaHTMLAttributes<HTMLMetaElement>, 'children'>

function createMetaAttrs(metadata: Metadata): MetaAttrs[] {
  const authors = (metadata.authors ?? []).reduce<MetaAttrs[]>(
    (acc, { name, url }) => {
      if (!url) acc.push({ rel: 'author', content: name })
      return acc
    },
    [],
  )

  return [
    { name: 'description', content: metadata.description },
    { name: 'generator', content: metadata.generator },
    { name: 'application-name', content: metadata.applicationName },
    { name: 'referrer', content: metadata.referrer },
    { name: 'keywords', content: metadata.keywords?.join(', ') },
    { name: 'creator', content: metadata.creator },
    { name: 'publisher', content: metadata.publisher },
    ...authors,
  ].filter(({ content }) => Boolean(content))
}

export function createMetaTags(metadata: Metadata) {
  return createMetaAttrs(metadata).map((attrs, index) => (
    <meta key={index} {...attrs} />
  ))
}
