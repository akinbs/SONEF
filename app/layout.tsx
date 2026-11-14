import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { indexingAllowed, siteName, siteUrl } from "@/lib/site";
import { siteJsonLd } from "@/lib/structured-data";
import "./globals.css";

const siteDescription =
  "SONEF Teknoloji: PCB ve komponent tedariki, kendi üretim bandımızda SMD dizgi ve fırınlama, dizgi sonrası kontrol, Ar-Ge ve yazılım. Fikirden üretime, İstanbul.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: `${siteName} | Fikirden Üretime`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  // Yayın hedefi lib/site.ts → indexingAllowed (derleme sırasında okunur). Önizleme, yerel derleme
  // ve eksik ana adreste bütün sayfalar `noindex, nofollow`; aynı değer X-Robots-Tag başlığında da var.
  robots: indexingAllowed ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#1b365d",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const jsonLd = siteJsonLd(siteDescription);
  return (
    // suppressHydrationWarning: açılış ekranının boyama öncesi betiği (splash-screen.tsx) bu
    // oturumda gösterildiyse <html>'e `data-splash-seen` ekler; yalnızca bu öğenin öznitelikleri.
    <html lang="tr" suppressHydrationWarning>
      <body>
        <a href="#icerik" className="skip-link">
          İçeriğe geç
        </a>
        <SiteHeader />
        <main id="icerik" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        {jsonLd ? <JsonLd data={jsonLd} /> : null}
      </body>
    </html>
  );
}
