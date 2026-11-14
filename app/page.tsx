import type { Metadata } from "next";
import { JourneySection } from "@/components/journey/journey-section";
import { SplashScreen } from "@/components/splash/splash-screen";
import { createPageMetadata } from "@/lib/metadata";
import { siteName } from "@/lib/site";

const pageMetadata = createPageMetadata({
  title: "Fikirden Üretime",
  description:
    "Fikrinizi projeye, projenizi üretime taşıyoruz: PCB ve komponent tedariki, kendi üretim bandımızda SMD dizgi, kontrol, paketleme ve ürün sonrası destek.",
  path: "/",
});

const homeTitle = `${siteName} | Fikirden Üretime`;

export const metadata: Metadata = {
  ...pageMetadata,
  title: { absolute: homeTitle },
  // Paylaşım başlığı sekme başlığıyla aynı sırada olsun (marka önde).
  openGraph: { ...pageMetadata.openGraph, title: homeTitle },
};

export default function HomePage() {
  return (
    <>
      <SplashScreen />
      <JourneySection />
    </>
  );
}
