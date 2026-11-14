import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./button-link.module.css";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
  /**
   * true ise Next `Link` yerine düz `<a>` çizilir. Sayfa içi bağlantılarda (`#bolum`) kullanılır:
   * tarayıcının kendi gezinmesi klavye odak başlangıcını hedef bölüme taşır, sonraki Tab
   * atlanan içerikten değil hedef bölümden devam eder. Varsayılan davranış değişmez.
   */
  native?: boolean;
};

/** Sitedeki tüm CTA'lar için tek görünüm; normal, taranabilir bir bağlantıdır. */
export function ButtonLink({ variant = "primary", className, native = false, ...props }: ButtonLinkProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");
  if (native && typeof props.href === "string") {
    const { href, children, id, title, "aria-label": ariaLabel } = props;
    return (
      <a href={href} id={id} title={title} aria-label={ariaLabel} className={classes}>
        {children}
      </a>
    );
  }
  return <Link {...props} className={classes} />;
}
