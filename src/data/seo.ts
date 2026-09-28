import { site } from "./site";
import type { Stay } from "./stays";

const isPlaceholderPhone = /^\+?910+$/.test(site.contact.phone.tel);

/** "2:00 pm" -> "14:00" */
function to24h(time: string) {
  const m = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!m) return time;
  let h = Number(m[1]) % 12;
  if (m[3].toLowerCase() === "pm") h += 12;
  return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`;
}

function organization(origin: string) {
  return {
    "@type": "Organization",
    "@id": `${origin}/#org`,
    name: site.name,
    legalName: site.legalName,
    url: `${origin}/`,
    logo: `${origin}/icon-512.png`,
    slogan: site.tagline,
    email: site.contact.email,
    ...(isPlaceholderPhone ? {} : { telephone: site.contact.phone.tel }),
    areaServed: { "@type": "City", name: "Kochi" },
    sameAs: [site.social.instagram, site.social.facebook].filter(Boolean),
  };
}

function lodging(stay: Stay, origin: string) {
  const locality = stay.areaShort === "Airport" ? "Nedumbassery" : "Manjummal";
  return {
    "@type": stay.slug === "bohom-stayora" ? "Hotel" : "LodgingBusiness",
    "@id": `${origin}/stays/${stay.slug}/#lodging`,
    name: stay.name,
    description: stay.summary,
    url: `${origin}/stays/${stay.slug}/`,
    image: `${origin}/og/${stay.slug}.jpg`,
    // TODO: add streetAddress, postalCode and geo once Hovato confirms them.
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      addressRegion: "Kerala",
      addressCountry: "IN",
    },
    numberOfRooms: stay.unit.count,
    checkinTime: to24h(site.policies.checkIn),
    checkoutTime: to24h(site.policies.checkOut),
    amenityFeature: stay.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a.label, value: true })),
    parentOrganization: { "@id": `${origin}/#org` },
    ...(isPlaceholderPhone ? {} : { telephone: site.contact.phone.tel }),
  };
}

export function homeJsonLd(origin: string, stays: Stay[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(origin),
      { "@type": "WebSite", "@id": `${origin}/#website`, url: `${origin}/`, name: site.name, publisher: { "@id": `${origin}/#org` } },
      ...stays.map((s) => lodging(s, origin)),
    ],
  };
}

export function stayJsonLd(origin: string, stay: Stay) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(origin),
      lodging(stay, origin),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
          { "@type": "ListItem", position: 2, name: stay.name, item: `${origin}/stays/${stay.slug}/` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: stay.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}
