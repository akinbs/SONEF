import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceCard } from "@/components/services/service-card";
import { ServiceDetail } from "@/components/services/service-detail";
import { ButtonLink } from "@/components/ui/button-link";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import { processSteps } from "@/content/process";
import { getService, serviceHref, services } from "@/content/services";
import { createPageMetadata } from "@/lib/metadata";
import { contactHref, servicesHref } from "@/lib/site";
import styles from "./page.module.css";

type ServicePageProps = { params: Promise<{ slug: string }> };

// Yalnızca content/services.ts içindeki hizmetler üretilir; diğer adresler 404 döner.
export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const service = getService((await params).slug);
  if (!service) return {};
  if (service.detail) {
    return createPageMetadata({
      title: service.detail.metaTitle,
      description: service.detail.metaDescription,
      path: serviceHref(service.slug),
      absoluteTitle: true,
    });
  }
  return createPageMetadata({ title: service.title, description: service.description, path: serviceHref(service.slug) });
}

export default async function ServicePage({ params }: ServicePageProps) {
  const service = getService((await params).slug);
  if (!service) notFound();

  // Revize edilmiş hizmetler (Blok 04B SMD, 04C PCB) kendi verisiyle beslenen düzeni kullanır.
  if (service.detail) return <ServiceDetail service={service} detail={service.detail} />;

  const related = services.filter((other) => other.slug !== service.slug);
  const steps = processSteps.filter((step) => (service.processSteps as readonly string[]).includes(step.slug));

  return (
    <>
      <PageIntro
        title={service.title}
        breadcrumb={[
          { label: "Ana Sayfa", href: "/" },
          { label: "Hizmetlerimiz", href: servicesHref },
          { label: service.shortTitle },
        ]}
        actions={
          <ButtonLink href={contactHref} variant="primary">
            Projenizi Konuşalım
          </ButtonLink>
        }
        aside={
          service.image ? (
            <figure className={styles.figure}>
              <Image
                src={service.image.src}
                alt={service.image.alt}
                width={service.image.width}
                height={service.image.height}
                sizes="(min-width: 56rem) 40vw, 100vw"
                className={styles.image}
              />
              <figcaption className={styles.caption}>{service.image.caption}</figcaption>
            </figure>
          ) : undefined
        }
      >
        <p>{service.lead}</p>
      </PageIntro>

      <section className={styles.section} aria-labelledby="kapsam">
        <div className={`container ${styles.scopeGrid}`}>
          <div>
            <SectionHeading id="kapsam" title="Hizmetin kapsamı" />
            <ul className={styles.scope}>
              {service.scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <aside className={styles.need} aria-labelledby="ne-zaman" data-tone="card">
            <h3 id="ne-zaman" className={styles.needTitle}>
              Bu hizmet ne zaman işinize yarar?
            </h3>
            <p>{service.need}</p>
          </aside>
        </div>
      </section>

      <section className={`${styles.section} band band-section`} aria-labelledby="nasil-ilerliyoruz" data-tone="stone">
        <div className="container">
          <SectionHeading id="nasil-ilerliyoruz" eyebrow="Nasıl ilerliyoruz" title={service.flowTitle} />
          <ol className={styles.flow}>
            {service.flow.map((step, index) => (
              <li key={step.title} className={styles.flowStep}>
                <p className={styles.flowNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className={styles.flowTitle}>{step.title}</h3>
                <p className={styles.flowText}>{step.text}</p>
              </li>
            ))}
          </ol>
          {steps.length > 0 ? (
            <p className={styles.journey}>
              Ana sayfadaki üretim yolculuğunda:{" "}
              {steps.map((step, index) => (
                <span key={step.slug}>
                  {index > 0 ? ", " : null}
                  <Link href={`/#${step.slug}`}>{step.title}</Link>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="on-gorusme">
        <div className={`container ${styles.prepareGrid}`}>
          <SectionHeading id="on-gorusme" title="Ön görüşmede paylaşabileceğiniz bilgiler">
            <p>Bu bilgiler görüşmeyi kolaylaştırır. Hepsi hazır değilse eksik kalanları birlikte netleştirebiliriz.</p>
          </SectionHeading>
          <ul className={styles.prepare}>
            {service.prepare.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="ilgili-hizmetler">
        <div className="container">
          <SectionHeading id="ilgili-hizmetler" title="İlgili hizmetler" />
          <ul className={styles.related}>
            {related.map((other) => (
              <li key={other.slug}>
                <ServiceCard service={other} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
