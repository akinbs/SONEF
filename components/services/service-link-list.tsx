import Link from "next/link";
import { serviceHref, services } from "@/content/services";
import styles from "./service-link-list.module.css";

/** Hizmetlere sade satır bağlantıları (kart ızgarası yerine, ikincil sayfalarda). */
export function ServiceLinkList() {
  return (
    <ul className={styles.list}>
      {services.map((service) => (
        <li key={service.slug} className={styles.item}>
          <Link href={serviceHref(service.slug)} className={styles.link}>
            {service.title}
          </Link>
          <p className={styles.summary}>{service.summary}</p>
        </li>
      ))}
    </ul>
  );
}
