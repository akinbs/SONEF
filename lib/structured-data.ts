import { companyProfile } from "@/content/company";
import { contactInfo, getSocialProfiles, mailtoHref, telHref } from "@/content/contact";
import { absoluteUrl } from "./metadata";
import { siteName, siteShortName, siteUrl } from "./site";

/**
 * Arama motorları için yapılandırılmış veri üreticileri.
 *
 * Mutlak URL gerektirdiğinden hepsi yalnızca NEXT_PUBLIC_SITE_URL tanımlıyken veri döner.
 * Yalnızca sitede görünen gerçek bilgiler yazılır: adres, telefon, e-posta ve sosyal profil
 * `content/contact.ts` içinden (İletişim sayfası ve footer ile aynı kaynak) gelir; puan, ürün gibi
 * alanlar SONEF sağlamadan eklenmez (bkz. docs/icerik-durumu.md).
 */

type JsonLdData = Record<string, unknown>;

const logoPath = "/brand/SONEF_Logo_Lacivert_300ppi.png";

/** Rota adresleri canonical ile aynı fonksiyondan (lib/metadata.ts → absoluteUrl) üretilir. */
const absolute = (path: string) => (path.startsWith("/") ? absoluteUrl(path as `/${string}`) : undefined);

/** Site geneli: kuruluş ve web sitesi kimliği. */
export function siteJsonLd(description: string): JsonLdData | undefined {
  const home = absolute("/");
  if (!home) return undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${home}#organization`,
        // Biz Kimiz sayfasında görünen doğrulanmış bilgilerle aynı kaynak (content/company.ts).
        name: companyProfile.brandName,
        alternateName: siteShortName,
        foundingDate: String(companyProfile.foundingYear),
        // Doğrulanmış kuruluş şehri (content/company.ts); adres ilçesi Ataşehir, il İstanbul.
        foundingLocation: { "@type": "Place", name: companyProfile.city },
        address: {
          "@type": "PostalAddress",
          streetAddress: contactInfo.address.street,
          postalCode: contactInfo.address.postalCode,
          addressLocality: contactInfo.address.locality,
          addressRegion: contactInfo.address.region,
          addressCountry: contactInfo.address.country,
        },
        ...(mailtoHref(contactInfo.email) ? { email: contactInfo.email } : {}),
        contactPoint: contactInfo.people
          .filter((person) => telHref(person.phone))
          .map((person) => ({
            "@type": "ContactPoint",
            name: person.name,
            telephone: person.phone.international,
            contactType: "customer service",
            areaServed: "TR",
            availableLanguage: "tr",
          })),
        sameAs: getSocialProfiles().map((profile) => profile.url),
        url: home,
        logo: absolute(logoPath),
        description,
      },
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        name: siteName,
        url: home,
        inLanguage: "tr-TR",
        publisher: { "@id": `${home}#organization` },
      },
    ],
  };
}

/** Görünür sayfa konumu (breadcrumb) ile aynı öğeler; son öğe bağlantısızdır. */
export function breadcrumbJsonLd(items: readonly { label: string; href?: string }[]): JsonLdData | undefined {
  if (!siteUrl || items.length < 2) return undefined;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absolute(item.href) } : {}),
    })),
  };
}
