import Image from "next/image";
import type { Reference } from "@/content/references";
import styles from "./reference-list.module.css";

/**
 * İş birliği panelleri (Blok 07). Her kayıt yatay bir paneldir: logo solda, kuruluş adı,
 * iş birliği türü ve resmî site bağlantısı sağda; dar ekranda logo üstte.
 * Boş listeyle hiçbir şey çizmez (boş logo kutusu veya örnek gösterilmez).
 */
export function ReferenceList({
  references,
  websiteLinkLabel,
}: {
  references: readonly Reference[];
  websiteLinkLabel: string;
}) {
  if (references.length === 0) return null;
  return (
    <ul className={styles.list}>
      {references.map((reference, index) => {
        const titleId = `is-birligi-${index + 1}`;
        return (
          <li key={reference.name}>
            <article className={styles.panel} aria-labelledby={titleId}>
              {reference.logo ? (
                <div className={styles.logo}>
                  {/* Özgün dosya, doğal oranında: genişlik sınırlanır, yükseklik orandan gelir. */}
                  <Image
                    src={reference.logo.src}
                    alt={reference.logo.alt}
                    width={reference.logo.width}
                    height={reference.logo.height}
                    sizes="(min-width: 48rem) 17.5rem, (min-width: 26rem) 20rem, 80vw"
                    className={styles.logoImage}
                  />
                </div>
              ) : null}
              <div className={styles.body}>
                <h2 id={titleId} className={styles.name}>
                  {reference.name}
                </h2>
                {reference.partnership ? <p className={styles.partnership}>{reference.partnership}</p> : null}
                {reference.summary ? <p className={styles.summary}>{reference.summary}</p> : null}
                {reference.website ? (
                  <p className={styles.linkRow}>
                    <a href={reference.website} target="_blank" rel="noopener noreferrer" className={styles.link}>
                      {websiteLinkLabel}
                      <span className={styles.arrow} aria-hidden="true">
                        ↗
                      </span>
                      <span className="visually-hidden"> (yeni sekmede açılır)</span>
                    </a>
                  </p>
                ) : null}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
