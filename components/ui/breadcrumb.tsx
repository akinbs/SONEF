import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import styles from "./breadcrumb.module.css";

export type BreadcrumbItem = {
  label: string;
  /** Son öğe (bulunulan sayfa) bağlantısızdır. */
  href?: string;
};

/**
 * Görünür sayfa konumu; son öğe `aria-current="page"` taşır.
 * Aynı öğeler BreadcrumbList yapılandırılmış verisine de yazılır (alan adı tanımlıysa).
 */
export function Breadcrumb({ items }: { items: readonly BreadcrumbItem[] }) {
  const jsonLd = breadcrumbJsonLd(items);
  return (
    <nav aria-label="Sayfa konumu" className={styles.breadcrumb}>
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className={styles.item}>
              {item.href && !isLast ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
    </nav>
  );
}
