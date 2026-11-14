import type { ReactNode } from "react";
import styles from "./section-heading.module.css";

type SectionHeadingProps = {
  /** Bölümün `aria-labelledby` hedefi. */
  id: string;
  title: string;
  eyebrow?: string;
  children?: ReactNode;
};

/** İçerik bölümlerinin H2 başlığı ve isteğe bağlı kısa girişi. */
export function SectionHeading({ id, title, eyebrow, children }: SectionHeadingProps) {
  return (
    <div className={styles.heading}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {children ? <div className={styles.lead}>{children}</div> : null}
    </div>
  );
}
