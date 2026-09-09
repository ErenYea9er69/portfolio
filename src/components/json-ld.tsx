import { DATA } from "@/data/resume";

export function JsonLd() {
  const structuredData = [{
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${DATA.url}/#person`,
    name: DATA.name,
    givenName: 'Rayen',
    familyName: 'Ben Aissa',
    url: DATA.url,
    image: `${DATA.url}${DATA.avatarUrl}`,
    jobTitle: DATA.description,
    nationality: {
      '@type': 'Country',
      name: 'Tunisia'
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'B.Tech in CS & IT',
    },
    worksFor: {
      '@type': 'Organization',
      name: 'Freelance'
    },
    sameAs: [
      DATA.contact.social.GitHub.url,
      DATA.contact.social.X.url,
    ].filter(Boolean),
    knowsAbout: DATA.skills.map((s) => s.name),
    description: `${DATA.name} — Full Stack Developer specializing in React, Next.js, TypeScript, and Node.js.`
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${DATA.url}/#website`,
    name: `${DATA.name} - Full Stack Developer`,
    url: DATA.url,
    description: `Portfolio of ${DATA.name} - Full Stack Developer specializing in React, Next.js, and TypeScript`,
    publisher: {
      '@id': `${DATA.url}/#person`
    }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Site Sections',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Projects',
        description: 'Web applications and open source projects',
        url: `${DATA.url}/projects`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        description: 'Technical articles and guides',
        url: `${DATA.url}/blog`
      }
    ]
  }];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
