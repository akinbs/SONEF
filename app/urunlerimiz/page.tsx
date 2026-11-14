import type { Metadata } from "next";
import { ProductCatalog } from "@/components/catalog/product-catalog";
import { ServiceLinkList } from "@/components/services/service-link-list";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import { products } from "@/content/products";
import { createPageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { productsHref, siteSections } from "@/lib/site";
import styles from "./page.module.css";

/** Bölüm kapalıyken sayfa başlığı/canonical üretilmez; 404 sayfasının metadata'sı geçerli olur. */
export const metadata: Metadata = siteSections.products
  ? createPageMetadata({
      title: "Ürünlerimiz",
      description:
        "SONEF Teknoloji ürünleri ve elektronik üretim hizmetleri: fikrinizi ya da hazır projenizi PCB ve komponent tedariği, SMD dizgi ve kontrol adımlarıyla ürüne dönüştürün.",
      path: productsHref,
    })
  : {};

export default function ProductsPage() {
  // Görünürlük ayarı: lib/site.ts → siteSections.products
  if (!siteSections.products) notFound();

  const hasProducts = products.length > 0;

  return (
    <>
      <PageIntro eyebrow="SONEF Teknoloji" title="Ürünlerimiz">
        {hasProducts ? (
          <p>SONEF Teknoloji ürünlerini ve temel özelliklerini bu sayfada bulabilirsiniz.</p>
        ) : (
          <p>
            Ürünlerimizi bu sayfada tanıtacağız. Kendi ürününüzü üretime taşımak istiyorsanız
            elektronik üretim hizmetlerimizle yanınızdayız.
          </p>
        )}
      </PageIntro>

      {hasProducts ? (
        <section className={styles.section} aria-labelledby="urun-katalogu">
          <div className="container">
            <SectionHeading id="urun-katalogu" title="Ürün kataloğu" />
            <ProductCatalog products={products} />
          </div>
        </section>
      ) : null}

      <section className={styles.section} aria-labelledby="urun-hizmetleri">
        <div className="container">
          <SectionHeading id="urun-hizmetleri" eyebrow="Kendi ürününüz için" title="Fikrinizden ürüne">
            <p>
              Elinizde bir fikir ya da hazır bir proje varsa; kartın ve komponentlerin teminini, SMD
              dizgiyi ve kontrolü aynı süreç içinde ele alırız.
            </p>
          </SectionHeading>
          <ServiceLinkList />
        </div>
      </section>
    </>
  );
}
