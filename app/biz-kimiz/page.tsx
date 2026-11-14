import type { Metadata } from "next";
import Link from "next/link";
import { MediaSlot } from "@/components/ui/media-slot";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import { companyProfile } from "@/content/company";
import { serviceHref } from "@/content/services";
import { createPageMetadata } from "@/lib/metadata";
import { servicesHref } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Biz Kimiz | SONEF Teknoloji",
  absoluteTitle: true,
  description:
    "2026 yılında İstanbul’da kurulan SONEF Teknoloji’yi tanıyın. PCB tasarımı ve tedariği, SMD dizgi, komponent tedariği, Ar-Ge ve yazılım çalışmalarımızı keşfedin.",
  path: "/biz-kimiz",
});

/**
 * Biz Kimiz (Blok 05). Bütün metinler `content/company.ts` içindedir; sayfa metin üretmez.
 * Sıra: breadcrumb → giriş (metin + üretim alanı fotoğrafı) → üç kısa bilgi → kuruluş hikâyesi →
 * ekip → çalışma alanları → iletişim çağrısı. Bölümler ortak `.container` ile aynı sol çizgiden başlar.
 */
export default function AboutPage() {
  const { facts, story, team, workAreas } = companyProfile;

  return (
    <>
      <PageIntro
        eyebrow={companyProfile.brandName}
        title="Biz Kimiz"
        breadcrumb={[{ label: "Ana Sayfa", href: "/" }, { label: "Biz Kimiz" }]}
        background="/backgrounds/biz-kimiz-hd.webp"
        backgroundMode="clear"
        actions={
          <Link href={servicesHref} className={styles.textLink}>
            Hizmetlerimizi keşfedin
            <Arrow />
          </Link>
        }
        aside={
          <MediaSlot
            media={companyProfile.heroMedia}
            priority
            sizes="(min-width: 76rem) 30rem, (min-width: 56rem) 40vw, (min-width: 36rem) 36rem, 100vw"
            className={styles.heroMedia}
          />
        }
      >
        <p>{companyProfile.lead}</p>
      </PageIntro>

      <section className={styles.factsSection} aria-labelledby="kisa-bilgiler">
        <div className="container">
          <h2 id="kisa-bilgiler" className="visually-hidden">
            Kısaca {companyProfile.brandName}
          </h2>
          {/* Terim–açıklama listesi: görünür sırada değer üstte, erişilebilirlik ağacında terim önce okunur. */}
          <dl className={styles.facts}>
            {facts.map((fact) => (
              <div key={fact.label} className={styles.fact}>
                <dt className={styles.factLabel}>{fact.label}</dt>
                <dd className={styles.factValue}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="hikaye">
        <div className={`container ${styles.story}`}>
          <h2 id="hikaye" className={styles.storyTitle}>
            {story.title}
          </h2>
          <div className={styles.storyText}>
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ekip">
        <div className="container">
          <SectionHeading id="ekip" title={team.title}>
            <p>{team.lead}</p>
          </SectionHeading>
          <ul className={`${styles.cards} ${styles.teamCards}`}>
            {team.roles.map((role) => (
              <li key={role.title}>
                <article className={styles.card}>
                  <h3 className={styles.cardTitle}>{role.title}</h3>
                  <p className={styles.teamCount}>
                    <span className={styles.teamNumber}>{role.count}</span> {team.memberLabel}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="calisma-alanlari">
        <div className="container">
          <SectionHeading id="calisma-alanlari" title={workAreas.title} />
          <ul className={styles.cards}>
            {workAreas.items.map((area) => (
              <li key={area.title}>
                <article className={styles.card}>
                  <h3 className={styles.cardTitle}>{area.title}</h3>
                  <p className={styles.cardText}>{area.text}</p>
                </article>
              </li>
            ))}
          </ul>
          <ul className={styles.serviceLinks} aria-label="Hizmet ayrıntıları">
            {workAreas.links.map((link) => (
              <li key={link.slug}>
                <Link href={serviceHref(link.slug)} className={styles.textLink}>
                  {link.label}
                  <Arrow />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function Arrow() {
  return (
    <span className={styles.arrow} aria-hidden="true">
      →
    </span>
  );
}
