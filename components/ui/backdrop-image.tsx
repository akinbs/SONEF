import Image from "next/image";
import styles from "./backdrop-image.module.css";

/**
 * Bir yüzeyin arkasına yerleştirilen dekoratif fotoğraf.
 *
 * - `faint` (varsayılan): fotoğrafın üstüne yüzeyin kendi rengi (`--surface`) yarı saydam bir
 *   katman olarak biner; metin tarafında katman daha yoğundur.
 * - `clear`: fotoğraf net kalır; yalnızca metnin arkasında koyu lacivert bir geçiş vardır,
 *   geniş ekranda sağ taraf tamamen açıktır. Koyu tonlu (`data-tone="dark"`) bantlarda kullanılır.
 *
 * Kullanan öğe `position: relative; isolation: isolate; overflow: hidden` olmalı ve içeriği
 * bu katmanın üstünde durmalıdır (bkz. page-intro.module.css, cta-band.module.css).
 * Görsel dekoratiftir: boş `alt`, ekran okuyucudan gizli.
 */

/*
 * `object-fit: cover` görseli kutudan geniş çizer: dar ekranda bant uzun olduğundan geniş fotoğraf
 * ekranın 2–5 katı genişlikte çizilir. "100vw" denirse tarayıcı küçük sürümü indirip büyütür
 * (390 px @3x ekranda 1200 px indirilip 5 kat büyütülüyordu). Dar ekranda en büyük sürüm istenir;
 * geniş ekranda bant ekran genişliğindedir.
 */
const SIZES = "(max-width: 56rem) 500vw, 100vw";

export type BackdropVariant = "faint" | "clear";

export function BackdropImage({
  src,
  priority = false,
  variant = "faint",
  position = "center",
  className,
}: {
  src: string;
  priority?: boolean;
  variant?: BackdropVariant;
  /** `object-position` değeri; kadrajda kalması gereken bölge için (ör. "50% 30%"). */
  position?: string;
  /** Kutuyu veya katmanı bulunduğu yere göre ayarlamak için (ör. kenardan kenara bant). */
  className?: string;
}) {
  return (
    <div
      className={`${styles.backdrop} ${styles[variant]} ${className ?? ""}`}
      aria-hidden="true"
      data-backdrop={variant}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={SIZES}
        quality={85}
        priority={priority}
        className={styles.image}
        style={{ objectPosition: position }}
      />
    </div>
  );
}
