import Image from "next/image";
import type { ServiceMedia } from "@/content/services";
import styles from "./media-slot.module.css";

/**
 * Ölçüsü baştan ayrılmış görsel alanı. `aspect-ratio` alanı sayfa ilk çizildiğinde
 * ayırır; fotoğraf yüklenirken veya yer tutucu gerçek fotoğrafla değiştirildiğinde başlık
 * ve CTA yer değiştirmez.
 *
 * - `image` yoksa: CSS ile çizilen, görünür etiketli yer tutucu. Dekoratiftir; ekran
 *   okuyucuya "fotoğraf alanı" gibi anlamsız bir bilgi verilmez.
 * - `image` varsa: aynı alanda `next/image` (`fill`, `object-fit: cover`). `alt` metni
 *   içerik verisinde fotoğrafa göre yazılır.
 */
export function MediaSlot({
  media,
  sizes,
  className,
  priority = false,
}: {
  media: ServiceMedia;
  sizes: string;
  className?: string;
  /** Sayfanın ilk ekranındaki (giriş bandı) fotoğraf: tembel yüklenmez, önceden istenir. */
  priority?: boolean;
}) {
  const { image, placeholderLabel, ratio } = media;
  return (
    <div
      className={[styles.slot, className].filter(Boolean).join(" ")}
      style={{ aspectRatio: ratio }}
      data-media-slot={image ? "image" : "placeholder"}
    >
      {image ? (
        <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className={styles.image} />
      ) : (
        <div className={styles.placeholder} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="10" r="1.75" />
            <path d="m21 16-5-5-8 8" />
          </svg>
          <span className={styles.label}>{placeholderLabel}</span>
        </div>
      )}
    </div>
  );
}
