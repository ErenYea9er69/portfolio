import { DATA } from "@/data/resume";

export function PersonSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: DATA.name,
          alternateName: ["Rayen Ben Aissa", "ErenYea9er"],
          description: DATA.description,
          image: `${DATA.url}/me.png`,
          url: DATA.url,
          sameAs: [
            DATA.contact.social.GitHub.url,
            DATA.contact.social.X.url,
          ].filter(Boolean),
          jobTitle: DATA.description,
          worksFor: {
            "@type": "Organization",
            name: "Freelance"
          },
          alumniOf: {
            "@type": "CollegeOrUniversity",
            name: "B.Tech in CS & IT"
          },
          address: {
            "@type": "PostalAddress",
            addressCountry: "Tunisia"
          },
          email: DATA.contact.social.email.navbar ? DATA.contact.email : undefined,
          knowsAbout: DATA.skills.map((s) => s.name)
        })
      }}
    />
  );
}
