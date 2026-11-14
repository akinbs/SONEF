import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { socialImageAlt } from "@/lib/metadata";

/**
 * Bağlantı paylaşıldığında görünen ortak görsel (1200×630). Derleme sırasında bir kez üretilir.
 * Yalnızca sağlanan logo ve sitedeki mevcut ifadeler kullanılır; ESP32 modeli SONEF ürünü
 * olmadığı için burada yer almaz.
 */
export const alt = socialImageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/SONEF_Logo_Transparan_300ppi.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "#1B365D",
          color: "#FFFFFF",
        }}
      >
        {/* Logo dosyasının üst/alt şeffaf boşluğu kırpılır (3000×1200 → 5:1 görünür alan). */}
        <div style={{ display: "flex", width: 400, height: 80, overflow: "hidden", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse yalnızca <img> destekler */}
          <img src={logoSrc} alt="" width={400} height={160} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, letterSpacing: -2, lineHeight: 1.05 }}>Fikirden Üretime</div>
          <div style={{ marginTop: 28, fontSize: 38, color: "#FCF1D0" }}>
            SMD dizgi · PCB tedariki · Komponent tedariki
          </div>
        </div>

        <div style={{ display: "flex", width: 160, height: 6, borderRadius: 3, background: "#60C1E5" }} />
      </div>
    ),
    size,
  );
}
