import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { MediaSlot } from "@/components/ui/media-slot";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  serviceHref,
  type Service,
  type ServiceDetail as ServiceDetailData,
  type ServiceDetailCard,
  type ServiceDetailSection,
} from "@/content/services";
import { servicesHref } from "@/lib/site";
import styles from "./service-detail.module.css";

/**
 * Revize hizmet detay sayfası (Blok 04B SMD Dizgi, 04C PCB Tedariki, 04D Komponent Tedariki). Bütün metinler
 * `service.detail` verisinden gelir; bileşen metin üretmez.
 *
 * Sıra: giriş (metin + fotoğraf alanı) → `detail.sections` (verideki sırayla) →
 * [onaylı teknik bilgiler] → iletişim. Bütün bölümler ortak `.container` içinde aynı
 * sol çizgiden başlar.
 */
export function ServiceDetail({ service, detail }: { service: Service; detail: ServiceDetailData }) {
  const { specs } = detail;

  return (
    <>
      <PageIntro
        eyebrow={detail.eyebrow}
        title={detail.pageTitle ?? service.title}
        breadcrumb={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Hizmetler", href: servicesHref },
          { label: detail.pageTitle ?? service.shortTitle },
        ]}
        background={detail.introBackground}
        actions={
          <ButtonLink
            href={detail.primaryAction.href}
            variant="primary"
            native={detail.primaryAction.href.startsWith("#")}
          >
            {detail.primaryAction.label}
          </ButtonLink>
        }
        aside={
          <MediaSlot
            media={detail.heroMedia}
            priority
            sizes="(min-width: 76rem) 30rem, (min-width: 56rem) 40vw, (min-width: 36rem) 36rem, 100vw"
            className={styles.heroMedia}
          />
        }
      >
        <p>{detail.lead}</p>
        {detail.note ? <p className={styles.heroNote}>{detail.note}</p> : null}
      </PageIntro>

      {detail.sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className={[styles.section, index === 0 ? styles.sectionFirst : ""].filter(Boolean).join(" ")}
          aria-labelledby={`${section.id}-baslik`}
        >
          <div className="container">
            <DetailSection section={section} />
          </div>
        </section>
      ))}

      {specs?.items.length ? (
        <section className={styles.section} aria-labelledby="teknik-bilgiler">
          <div className="container">
            <SectionHeading id="teknik-bilgiler" title={specs.title} />
            <dl className={styles.specs}>
              {specs.items.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}
    </>
  );
}

function DetailSection({ section }: { section: ServiceDetailSection }) {
  const headingId = `${section.id}-baslik`;

  switch (section.kind) {
    case "cards":
      return (
        <>
          <SectionHeading id={headingId} title={section.title} />
          <ul className={styles.cards}>
            {section.cards.map((card) => (
              <li key={card.title}>
                <InfoCard card={card} />
              </li>
            ))}
          </ul>
        </>
      );

    case "steps":
      return (
        <>
          <SectionHeading id={headingId} title={section.title} />
          {/* Adım sayısı düzeni belirler: dört adım 4 → 2×2 → 1, üç adım 3 → 1 sütun. */}
          <ol className={styles.steps} data-count={section.steps.length}>
            {section.steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </li>
            ))}
          </ol>
        </>
      );

    case "checks":
      return (
        <>
          <SectionHeading id={headingId} title={section.title} />
          <div className={styles.mediaGrid}>
            <ul className={styles.stack}>
              {section.items.map((item) => (
                <li key={item.title}>
                  <article className={`${styles.card} ${styles.checkCard}`}>
                    {/* Etiket başlığın parçasıdır: ekran okuyucu "Müşteri onayıyla: Elektronik kontrol" okur. */}
                    <h3 className={styles.checkHeading}>
                      <span className={styles.checkLabel} data-conditional={item.conditional ? "" : undefined}>
                        {item.label}
                      </span>
                      <span className="visually-hidden">: </span>
                      <span className={styles.cardTitle}>{item.title}</span>
                    </h3>
                    <p className={styles.cardText}>{item.text}</p>
                  </article>
                </li>
              ))}
            </ul>
            <MediaSlot media={section.media} sizes={sideMediaSizes} className={styles.sideMedia} />
          </div>
        </>
      );

    case "checklist":
      return (
        <>
          <SectionHeading id={headingId} title={section.title} />
          <div className={styles.mediaGrid}>
            <div className={styles.stack}>
              {section.groups.map((group) => (
                <article key={group.title} className={`${styles.card} ${styles.groupCard}`}>
                  <h3 className={styles.cardTitle}>{group.title}</h3>
                  <ul className={styles.checklist}>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {group.note ? <p className={styles.groupNote}>{group.note}</p> : null}
                </article>
              ))}
              {section.aside ? (
                <aside className={styles.asideNote} aria-labelledby={`${section.id}-not`}>
                  <h3 id={`${section.id}-not`} className={styles.asideTitle}>
                    {section.aside.title}
                  </h3>
                  <p className={styles.cardText}>{section.aside.text}</p>
                </aside>
              ) : null}
              {section.share ? <EmailLine label={section.share.text} email={section.share.email} /> : null}
            </div>
            <MediaSlot media={section.media} sizes={sideMediaSizes} className={styles.sideMedia} />
          </div>
        </>
      );

    case "options":
      return (
        <>
          <SectionHeading id={headingId} title={section.title} />
          <ul className={styles.options}>
            {section.cards.map((card, index) => (
              <li key={card.title}>
                <article className={styles.optionCard}>
                  <span className={styles.optionNumber} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardText}>{card.text}</p>
                  {card.links?.length ? <CardLinks links={card.links} /> : null}
                </article>
              </li>
            ))}
          </ul>
        </>
      );

    case "fields":
      return (
        <>
          <SectionHeading id={headingId} title={section.title} />
          <div className={styles.mediaGrid}>
            <div className={styles.stack}>
              <article className={`${styles.card} ${styles.groupCard}`}>
                <h3 className={styles.cardTitle}>{section.card.title}</h3>
                <dl className={styles.fields}>
                  {section.card.fields.map((field) => (
                    <div key={field.term}>
                      <dt>{field.term}</dt>
                      <dd>{field.text}</dd>
                    </div>
                  ))}
                </dl>
                {section.card.note ? <p className={styles.groupNote}>{section.card.note}</p> : null}
              </article>
              {section.aside ? (
                <aside className={styles.asideNote} aria-labelledby={`${section.id}-not`}>
                  <h3 id={`${section.id}-not`} className={styles.asideTitle}>
                    {section.aside.title}
                  </h3>
                  <p className={styles.cardText}>{section.aside.text}</p>
                </aside>
              ) : null}
              {section.link ? (
                <p>
                  <a href={section.link.href} className={styles.textLink}>
                    {section.link.label}
                    <span className={styles.arrow} aria-hidden="true">
                      →
                    </span>
                  </a>
                </p>
              ) : null}
            </div>
            <MediaSlot media={section.media} sizes={sideMediaSizes} className={styles.sideMedia} />
          </div>
        </>
      );

    case "callout":
      return (
        <div className={`${styles.callout} band`} data-tone="stone">
          <h2 id={headingId} className={styles.calloutTitle}>
            {section.title}
          </h2>
          <p className={styles.calloutText}>{section.text}</p>
          {section.link ? (
            <p>
              <Link href={section.link.href} className={styles.textLink}>
                {section.link.label}
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </p>
          ) : null}
        </div>
      );
  }
}

/** Kenar fotoğraf alanı: < 36rem tam genişlik, tek sütunda en fazla 36rem, ≥ 64rem yarım sütun. */
const sideMediaSizes = "(min-width: 76rem) 35rem, (min-width: 64rem) 45vw, (min-width: 36rem) 36rem, 100vw";

function InfoCard({ card }: { card: ServiceDetailCard }) {
  return (
    <article className={styles.card}>
      <h3 className={styles.cardTitle}>{card.title}</h3>
      <p className={styles.cardText}>{card.text}</p>
      {card.links?.length ? <CardLinks links={card.links} /> : null}
    </article>
  );
}

function CardLinks({ links }: { links: NonNullable<ServiceDetailCard["links"]> }) {
  return (
    <ul className={styles.cardLinks}>
      {links.map((link) => (
        <li key={link.slug}>
          <Link href={serviceHref(link.slug)} className={styles.textLink}>
            {link.label}
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Etiket + e-posta bağlantısı; uzun adres dar ekranda kendi satırına geçer, kutudan taşmaz. */
function EmailLine({ label, email }: { label: string; email: string }) {
  return (
    <p className={styles.email}>
      {label}{" "}
      <a href={`mailto:${email}`} className={styles.textLink}>
        {email}
      </a>
    </p>
  );
}
