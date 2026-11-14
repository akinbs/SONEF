import type { ReactNode } from "react";
import { contactHref } from "@/lib/site";
import { BackdropImage, type BackdropVariant } from "./backdrop-image";
import { ButtonLink } from "./button-link";
import styles from "./cta-band.module.css";

type CtaLink = { href: string; label: string };

type CtaBandProps = {
  id: string;
  title: string;
  children?: ReactNode;
  primary?: CtaLink;
  secondary?: CtaLink;
  /** Düğmelerin yanında gösterilen ek öğe (ör. e-posta bağlantısı); dar ekranda alt satıra geçer. */
  extraActions?: ReactNode;
  /** Panelin arkasındaki fotoğraf; `null` verilirse düz yüzey kalır. */
  background?: string | null;
  /**
   * `clear` (varsayılan): koyu panel, fotoğraf net (footer üstü banner). `faint`: açık taş panel,
   * fotoğraf silik.
   */
  backgroundMode?: BackdropVariant;
};

/** Sayfa sonundaki (footer üstü) çağrı paneli; varsayılan hedef iletişim sayfasıdır. */
export function CtaBand({
  id,
  title,
  children,
  primary = { href: contactHref, label: "Projenizi Konuşalım" },
  secondary,
  extraActions,
  background = "/backgrounds/kapanis-hd.webp",
  backgroundMode = "clear",
}: CtaBandProps) {
  const clear = Boolean(background) && backgroundMode === "clear";
  return (
    <section className={styles.band} aria-labelledby={id}>
      <div className={`container ${styles.inner}`}>
        <div
          className={`${styles.panel} ${clear ? styles.clearPanel : ""} band`}
          data-tone={clear ? "dark" : "stone"}
        >
          {background ? (
            <BackdropImage
              src={background}
              variant={clear ? "clear" : "faint"}
              className={clear ? styles.clearBackdrop : undefined}
            />
          ) : null}
          <div className={styles.text}>
            <h2 id={id} className={styles.title}>
              {title}
            </h2>
            {children ? <div className={styles.body}>{children}</div> : null}
          </div>
          <div className={styles.actions}>
            <ButtonLink href={primary.href} variant="primary">
              {primary.label}
            </ButtonLink>
            {secondary ? (
              <ButtonLink href={secondary.href} variant="secondary">
                {secondary.label}
              </ButtonLink>
            ) : null}
            {extraActions}
          </div>
        </div>
      </div>
    </section>
  );
}
