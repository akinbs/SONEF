import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./arrow-link.module.css";

/**
 * Sonunda ok bulunan açık metin bağlantısı (ör. "Hizmetlerimizi inceleyin →").
 * Ok dekoratiftir ve ekran okuyucudan gizlenir; bağlantının adı yalnızca metindir.
 */
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={styles.link}>
      {children}
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </Link>
  );
}
