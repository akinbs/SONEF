import type { Metadata } from "next";
import { ServiceOverviewCard } from "@/components/services/service-overview-card";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import { services, serviceWorkflow } from "@/content/services";
import { createPageMetadata } from "@/lib/metadata";
import { servicesHref } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "SMD Dizgi, PCB ve Komponent Tedariki",
  description:
    "SONEF Teknoloji’nin SMD dizgi, PCB ve elektronik komponent tedariki hizmetlerini inceleyin. Projenize uygun üretim kapsamını birlikte belirleyelim.",
  path: servicesHref,
});

/**
 * Hizmetler ana sayfası (Blok 04A).
 * Sıra: breadcrumb → giriş → üç hizmet kartı → birlikte çalışma adımları → iletişim çağrısı.
 * Bütün bölümler ortak `.container` içinde aynı sol çizgiden başlar.
 */
export default function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Elektronik üretim hizmetleri"
        title="SMD dizgi, PCB ve komponent tedariki"
        breadcrumb={[{ label: "Ana Sayfa", href: "/" }, { label: "Hizmetler" }]}
        background="/backgrounds/hizmetler-hd.webp"
        backgroundMode="clear"
        backgroundPosition="60% 30%"
      >
        <p>
          Elektronik projeniz için kart ve komponent tedarikinden SMD dizgiye kadar ihtiyaç duyduğunuz
          adımları birlikte planlıyoruz. Fikir aşamasında da hazır bir kart tasarımıyla da
          başlayabilirsiniz.
        </p>
      </PageIntro>

      <section className={styles.services} aria-labelledby="hizmet-listesi">
        <div className="container">
          <h2 id="hizmet-listesi" className="visually-hidden">
            Hizmetlerimiz
          </h2>
          <ul className={styles.cards}>
            {services.map((service, index) => (
              <li key={service.slug}>
                <ServiceOverviewCard service={service} number={index + 1} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.workflow} aria-labelledby="birlikte-calisma">
        <div className="container">
          <SectionHeading id="birlikte-calisma" title="Birlikte nasıl ilerliyoruz?" />
          <ol className={styles.steps}>
            {serviceWorkflow.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
