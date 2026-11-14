import Link from "next/link";
import { serviceHref, type Service } from "@/content/services";
import { ServiceIcon } from "./service-icon";
import styles from "./service-overview-card.module.css";

/**
 * /hizmetler genel bakış kartı: üst satır (sıra numarası + çizgi ikon), başlık, açıklama ve
 * ince ayırıcının altında tek bağlantı. Bağlantının ::after katmanı kartı kaplar; kartın
 * tamamı tıklanabilir ama listede tek, anlamlı adlı bir bağlantı vardır.
 *
 * Satırlar `subgrid` ile kart listesine bağlanır (service-overview-card.module.css): yan yana
 * dizildiklerinde başlıklar aynı üst çizgiden başlar, bağlantılar aynı alt çizgide durur.
 */
export function ServiceOverviewCard({ service, number }: { service: Service; number: number }) {
  const { title, text, linkLabel, icon } = service.overview;
  return (
    <article className={styles.card} data-service-card>
      <div className={styles.meta}>
        <span className={styles.number} aria-hidden="true">
          {String(number).padStart(2, "0")}
        </span>
        <span className={styles.icon}>
          <ServiceIcon name={icon} />
        </span>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.text}>{text}</p>
      <div className={styles.footer}>
        <Link href={serviceHref(service.slug)} className={styles.link}>
          {linkLabel}
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}
