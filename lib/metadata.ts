import type { Metadata } from "next";
import { siteName, siteUrl } from "./site";

type PageMetadataInput = {
  /** Sekmede görünen başlık; kök şablon " | SONEF Teknoloji" ekler. */
  title: string;
  description: string;
  path: `/${string}`;
  /**
   * true ise `title` marka ekiyle birlikte tam sekme başlığıdır (ör. "… | SONEF Teknoloji");
   * kök şablonun eki eklenmez, marka adı başlıkta bir kez görünür.
   */
  absoluteTitle?: boolean;
};

/** `app/opengraph-image.tsx` çıktısı; ölçü ve alt metni o dosyayla aynı tutulmalıdır. */
export const socialImageAlt = `${siteName} | Fikirden Üretime`;
const socialImage = { url: "/opengraph-image", width: 1200, height: 630, alt: socialImageAlt };

/**
 * Bir rotanın mutlak adresi (canonical, `og:url`, sitemap ve JSON-LD aynı değeri kullanır). Sorgu
 * ve parça eklenmez: `/iletisim?utm_source=test` sayfasının canonical değeri `/iletisim` adresidir.
 * Ana sayfa sondaki `/` olmadan yazılır (`https://alan.adi`); Next.js canonical değerini bu biçime
 * getirdiği için sitemap ve JSON-LD de aynı biçimi kullanır. Ana adres tanımlı değilse `undefined`.
 */
export function absoluteUrl(path: `/${string}`): string | undefined {
  if (!siteUrl) return undefined;
  return path === "/" ? siteUrl.origin : new URL(path, siteUrl).toString();
}

/**
 * Her sayfanın benzersiz başlık/açıklamasını tek biçimde üretir.
 * Canonical ve Open Graph URL'si yalnızca gerçek alan adı tanımlıysa eklenir; her sayfa kendi
 * rotasını verir, ana sayfanın canonical değeri alt sayfalara geçmez.
 */
export function createPageMetadata({ title, description, path, absoluteTitle = false }: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      title: absoluteTitle ? title : `${title} | ${siteName}`,
      description,
      locale: "tr_TR",
      siteName,
      type: "website",
      // Sayfa kendi `openGraph` nesnesini tanımladığında kök `app/opengraph-image.tsx`
      // devralınmaz; ortak paylaşım görseli bu yüzden burada açıkça verilir.
      images: [socialImage],
      ...(url ? { url } : {}),
    },
  };
}
