/**
 * Site genelindeki tek bilgi kaynağı: marka adı, rotalar, alan adı ve indeksleme kararı.
 * Alan adı yalnızca ortam değişkeninden okunur; tanımlı değilse
 * canonical/sitemap gibi mutlak URL gerektiren çıktılar üretilmez.
 */

/** Title şablonu, `og:site_name`, footer ve yapılandırılmış veride kullanılan marka adı. */
export const siteName = "SONEF Teknoloji";
/** Logo ve kısa anılışlar için kısa marka adı (ör. Organization `alternateName`). */
export const siteShortName = "SONEF";

export type SiteRoute = {
  href: `/${string}`;
  label: string;
  /** Masaüstü menü gibi dar alanlarda kullanılan kısa etiket. */
  shortLabel?: string;
};

/**
 * Bölüm görünürlüğü. Bir bölüm `false` iken:
 * - menü, mobil menü ve footer bağlantısı üretilmez (`mainRoutes`),
 * - sitemap'e girmez (`app/sitemap.ts` `mainRoutes` kullanır),
 * - sayfası gerçek 404 döner (sayfa `notFound()` çağırır).
 * Veri ve bileşenler yerinde kalır; yeniden açmak için değeri `true` yapıp derlemek yeterlidir.
 */
export const siteSections: { readonly products: boolean } = {
  /** Ürünlerimiz (`/urunlerimiz`): gerçek ürün listesi gelene kadar geçici olarak kapalı. */
  products: false,
};

export const productsHref = "/urunlerimiz";

const allRoutes: readonly (SiteRoute & { visible?: boolean })[] = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hizmetler", label: "Hizmetlerimiz", shortLabel: "Hizmetler" },
  { href: productsHref, label: "Ürünlerimiz", visible: siteSections.products },
  { href: "/biz-kimiz", label: "Biz Kimiz" },
  { href: "/vizyon-ve-misyon", label: "Vizyon ve Misyon" },
  // Rota adresi Blok 07 öncesindeki adla kalır (bağlantılar kırılmasın); görünen ad sayfanın güncel adıdır.
  { href: "/referanslar-ve-musterilerimiz", label: "Referanslar ve İş Birlikleri", shortLabel: "Referanslar" },
  { href: "/iletisim", label: "İletişim" },
];

/** Yalnızca görünür bölümler; menü, footer ve sitemap bu listeden beslenir. */
export const mainRoutes: readonly SiteRoute[] = allRoutes
  .filter((route) => route.visible !== false)
  .map(({ href, label, shortLabel }) => ({ href, label, ...(shortLabel ? { shortLabel } : {}) }));

export const contactHref = "/iletisim";
export const servicesHref = "/hizmetler";
export const processSectionId = "uretim-sureci";

/**
 * Ana adres: yalnızca yol, sorgu ve kullanıcı bilgisi içermeyen bir `https://` kökü kabul edilir
 * (ör. `https://sonefteknoloji.com.tr`). Eksik veya geçersizse `undefined`: canonical, `og:url`,
 * sitemap girişleri ve JSON-LD üretilmez, site `noindex` kalır.
 */
function readSiteUrl(): URL | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    const bareOrigin = url.pathname === "/" && !url.search && !url.hash && !url.username && !url.password;
    return url.protocol === "https:" && bareOrigin ? new URL(url.origin) : undefined;
  } catch {
    return undefined;
  }
}

/** Tanımlı ve geçerli bir alan adı varsa döner; aksi halde `undefined`. */
export const siteUrl = readSiteUrl();

/**
 * Yayın hedefi (tek ortak ayar): `SITE_ENV=production` yalnızca canlı yayın derlemesinde verilir.
 * Karar DERLEME sırasında okunur; sayfalar statik üretildiği için metadata, robots.txt, sitemap
 * ve `X-Robots-Tag` başlığı o derlemenin ayarını taşır. `NODE_ENV=production` tek başına yetmez:
 * yerelde `next start` ile çalışan bir derleme de önizlemedir.
 *
 * İndeksleme yalnızca şu üç koşul birlikte sağlanırsa açıktır:
 * 1. `SITE_ENV=production`,
 * 2. Netlify'da derleniyorsa `CONTEXT=production` (Deploy Preview ve branch derlemeleri, ayar
 *    yanlışlıkla bütün bağlamlara verilse bile kapalı kalır),
 * 3. geçerli bir `https://` ana adres (`NEXT_PUBLIC_SITE_URL`).
 */
function readIndexing(): boolean {
  if (!siteUrl) return false;
  if (process.env.SITE_ENV?.trim() !== "production") return false;
  const netlifyContext = process.env.CONTEXT?.trim();
  if (netlifyContext && netlifyContext !== "production") return false;
  return true;
}

/** true: canlı yayın derlemesi, indeksleme açık. false: önizleme/yerel/eksik adres → `noindex`. */
export const indexingAllowed = readIndexing();

/** `noindex` derlemelerinde HTML meta etiketi ve HTTP başlığıyla aynı değer. */
export const noindexDirective = "noindex, nofollow";
