import type { Metadata } from "next";
import { ReferenceList } from "@/components/catalog/reference-list";
import { PageIntro } from "@/components/ui/page-intro";
import { references, referencesPage } from "@/content/references";
import { createPageMetadata } from "@/lib/metadata";
import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Referanslar ve İş Birlikleri | SONEF Teknoloji",
  absoluteTitle: true,
  description:
    "SONEF Teknoloji’nin fikir ve danışma iş birliği yaptığı Panotim Otomasyon Sistemleri’ni tanıyın ve resmî web sitesine ulaşın.",
  path: "/referanslar-ve-musterilerimiz",
});

/**
 * Referanslar ve İş Birlikleri (Blok 07). Kayıtlar ve metinler `content/references.ts` içindedir.
 * Sıra: breadcrumb → giriş → iş birliği panelleri.
 */
export default function ReferencesPage() {
  return (
    <>
      <PageIntro
        eyebrow={referencesPage.eyebrow}
        title={referencesPage.title}
        breadcrumb={[{ label: "Ana Sayfa", href: "/" }, { label: referencesPage.title }]}
        background={referencesPage.introBackground}
      >
        <p>{referencesPage.lead}</p>
      </PageIntro>

      {references.length > 0 ? (
        <section className={styles.section} aria-label="İş birliklerimiz">
          <div className="container">
            <ReferenceList references={references} websiteLinkLabel={referencesPage.websiteLinkLabel} />
          </div>
        </section>
      ) : null}
    </>
  );
}
