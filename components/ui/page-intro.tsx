import type { ReactNode } from "react";
import { BackdropImage, type BackdropVariant } from "./backdrop-image";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";
import styles from "./page-intro.module.css";

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  breadcrumb?: readonly BreadcrumbItem[];
  /** Girişin altında CTA'lar. */
  actions?: ReactNode;
  /** Sağ sütunda (geniş ekranda) gösterilen gerçek görsel veya kısa özet. */
  aside?: ReactNode;
  /** Bandın arkasına yerleştirilen dekoratif fotoğraf (`public/` yolu). */
  background?: string;
  /**
   * `faint` (varsayılan): taş grisi bant, fotoğraf silik. `clear`: koyu (lacivert) bant, fotoğraf
   * net; yalnızca metnin arkasında koyu geçiş vardır.
   */
  backgroundMode?: BackdropVariant;
  /** Fotoğrafın kadrajda kalacak bölgesi (`object-position`, ör. "50% 30%"). */
  backgroundPosition?: string;
  /** Daha kısa alt boşluk: girişin hemen altındaki içerik ilk ekranda görünsün (ör. İletişim). */
  compact?: boolean;
};

/**
 * İç sayfaların tek H1'ini taşıyan giriş bandı: varsayılan açık taş grisi (#E3DFD7);
 * `backgroundMode="clear"` ile net fotoğraflı koyu bant.
 */
export function PageIntro({
  eyebrow,
  title,
  children,
  breadcrumb,
  actions,
  aside,
  background,
  backgroundMode = "faint",
  backgroundPosition,
  compact = false,
}: PageIntroProps) {
  const clear = Boolean(background) && backgroundMode === "clear";
  const backdropClass = background ? (clear ? styles.withClearBackdrop : styles.withBackdrop) : "";
  return (
    <section
      className={`${styles.intro} band ${backdropClass} ${compact ? styles.compact : ""}`}
      data-tone={clear ? "dark" : "stone"}
      aria-labelledby="sayfa-basligi"
    >
      {background ? (
        <BackdropImage
          src={background}
          priority
          variant={clear ? "clear" : "faint"}
          position={backgroundPosition}
        />
      ) : null}
      <div className={`container ${aside ? styles.split : ""}`}>
        <div className={styles.main}>
          {breadcrumb ? <Breadcrumb items={breadcrumb} /> : null}
          {eyebrow ? <p className={`eyebrow ${styles.eyebrow}`}>{eyebrow}</p> : null}
          <h1 id="sayfa-basligi" className={styles.title}>
            {title}
          </h1>
          {children ? <div className={styles.lead}>{children}</div> : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
        {aside ? <div className={styles.aside}>{aside}</div> : null}
      </div>
    </section>
  );
}
