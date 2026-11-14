import Link from "next/link";
import { serviceHref, type Service } from "@/content/services";
import styles from "./service-card.module.css";

type ServiceCardProps = {
  service: Service;
  /** Sayfa hiyerarşisine göre başlık seviyesi. */
  headingLevel?: "h2" | "h3";
  /** feature: numara ve müşteri ihtiyacıyla; compact: ilgili hizmet listeleri için. */
  variant?: "feature" | "compact";
  number?: number;
};

export function ServiceCard({ service, headingLevel: Heading = "h3", variant = "compact", number }: ServiceCardProps) {
  const href = serviceHref(service.slug);
  return (
    <article className={styles.card} data-variant={variant} data-tone="card">
      {number !== undefined ? (
        <p className={styles.number} aria-hidden="true">
          {String(number).padStart(2, "0")}
        </p>
      ) : null}
      <Heading className={styles.title}>
        <Link href={href} className={styles.titleLink}>
          {service.title}
        </Link>
      </Heading>
      <p className={styles.summary}>{service.summary}</p>
      {variant === "feature" ? (
        <div className={styles.need}>
          <p className={styles.needLabel}>Ne zaman?</p>
          <p>{service.need}</p>
        </div>
      ) : null}
      <p className={styles.more} aria-hidden="true">
        Hizmeti inceleyin <span className={styles.arrow}>→</span>
      </p>
    </article>
  );
}
