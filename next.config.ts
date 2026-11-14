import type { NextConfig } from "next";
import { indexingAllowed, noindexDirective } from "./lib/site";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // 85: arka plan fotoğrafları; 90: açılış ekranı görseli (yazı kenarları net kalsın);
    // diğer görseller varsayılan 75.
    qualities: [75, 85, 90],
  },
  async headers() {
    return [
      // Önizleme/yerel derleme: HTML dışındaki yanıtlar (görseller, sitemap, OG görseli) dahil
      // her adres `noindex` başlığı taşır. Canlı yayın derlemesinde bu kural hiç eklenmez.
      ...(indexingAllowed ? [] : [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: noindexDirective }] }]),
      {
        // Model ve poster dosya adları içerik değiştiğinde güncellenmeli;
        // o zamana kadar kısa ama yeniden doğrulanabilir bir önbellek kullanılır.
        source: "/models/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
