import Image from "next/image";
import styles from "./brand-logo.module.css";

/**
 * Sağlanan PNG logo, yeniden çizilmeden kullanılır. Dosyanın üst/alt şeffaf
 * boşluğu (tuvalin %25'i) 5:1 bir kutu ve `object-fit: cover` ile kırpılır;
 * logonun kendi oranı değişmez.
 *
 * `variant`: "cream" koyu zemin içindir (lacivert navbar). "navy" açık zemin içindir (beyaz navbar, beyaz footer):
 * aynı dosyanın renkleri ters çevrilmiş kopyası — harfler #1B365D, merkezdeki nokta krem.
 */
const sources = {
  cream: "/brand/SONEF_Logo_Transparan_300ppi.png",
  navy: "/brand/SONEF_Logo_Lacivert_300ppi.png",
} as const;

export function BrandLogo({ className, variant = "cream" }: { className?: string; variant?: keyof typeof sources }) {
  return (
    <span className={[styles.frame, className].filter(Boolean).join(" ")}>
      <Image
        src={sources[variant]}
        alt="SONEF"
        width={3000}
        height={1200}
        sizes="(min-width: 48rem) 160px, 128px"
        className={styles.image}
      />
    </span>
  );
}
