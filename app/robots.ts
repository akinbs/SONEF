import type { MetadataRoute } from "next";
import { indexingAllowed, siteUrl } from "@/lib/site";

/**
 * Taramaya her ortamda izin verilir: önizlemede sayfaların `noindex` işareti (meta etiketi ve
 * X-Robots-Tag) ancak tarayıcı sayfayı okuyabilirse görülür; `Disallow` bu işareti gizlerdi.
 * Sitemap satırı yalnızca canlı yayın derlemesinde yazılır (lib/site.ts → indexingAllowed).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(indexingAllowed && siteUrl ? { sitemap: new URL("/sitemap.xml", siteUrl).toString() } : {}),
  };
}
