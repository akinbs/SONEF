import type { MetadataRoute } from "next";
import { serviceHref, services } from "@/content/services";
import { absoluteUrl } from "@/lib/metadata";
import { indexingAllowed, mainRoutes } from "@/lib/site";

/**
 * Yalnızca canlı yayın derlemesinde dolar (lib/site.ts → indexingAllowed); önizlemede boş
 * `urlset` döner. Adresler sayfaların canonical değeriyle aynı fonksiyondan üretilir
 * (`absoluteUrl`). Gizli bölümler (`siteSections`) `mainRoutes` içinde olmadığı için girmez.
 * `lastmod` yazılmaz: içerik değişiklik tarihi tutulmuyor, derleme zamanı gerçek bir değişiklik
 * bilgisi değildir.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexingAllowed) return [];
  const paths = [...mainRoutes.map((route) => route.href), ...services.map((service) => serviceHref(service.slug))];
  return paths.flatMap((path) => {
    const url = absoluteUrl(path);
    return url ? [{ url }] : [];
  });
}
