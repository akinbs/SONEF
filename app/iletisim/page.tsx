import type { Metadata } from "next";
import { ContactChannelCards, ContactInfoPanels, ContactPeople } from "@/components/contact/contact-channels";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import { contactInfo } from "@/content/contact";
import { createPageMetadata } from "@/lib/metadata";
import { contactHref } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "İletişim | SONEF Teknoloji",
  absoluteTitle: true,
  description:
    "SONEF Teknoloji’ye ulaşın. Ataşehir/İstanbul adresimiz, çalışma saatlerimiz, telefon, e-posta, WhatsApp ve Instagram iletişim bilgilerimizi inceleyin.",
  path: contactHref,
});

/**
 * İletişim (Blok 08). Bütün bilgiler `content/contact.ts` içindedir (footer ve Organization verisiyle aynı kaynak).
 * Sıra: breadcrumb → giriş → kişi kartları → e-posta ve Instagram → adres ve çalışma saatleri → footer.
 * Kanal ve panel gruplarının H2'si görsel olarak gizlidir; görünür başlıklar kart başlıklarıdır (H3).
 * Mesaj formu sonraki aşamaya bırakıldı (bkz. docs/icerik-durumu.md).
 */
export default function ContactPage() {
  return (
    <>
      <PageIntro
        eyebrow={contactInfo.brandName.toLocaleUpperCase("tr-TR")}
        title="İletişim"
        breadcrumb={[{ label: "Ana Sayfa", href: "/" }, { label: "İletişim" }]}
        background="/backgrounds/iletisim-hd.webp"
        backgroundMode="clear"
        compact
      >
        <p>
          PCB tasarımı ve tedariği, SMD dizgi, komponent tedariği, Ar‑Ge ve yazılım ihtiyaçlarınız için bize
          ulaşabilirsiniz.
        </p>
      </PageIntro>

      <section className={`${styles.section} ${styles.sectionFirst}`} aria-labelledby="dogrudan-iletisim">
        <div className={`container ${styles.stack}`}>
          <SectionHeading id="dogrudan-iletisim" title="Doğrudan iletişim" />
          <ContactPeople />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="eposta-ve-sosyal">
        <div className="container">
          <h2 id="eposta-ve-sosyal" className="visually-hidden">
            E-posta ve Instagram
          </h2>
          <ContactChannelCards />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="adres-ve-saatler">
        <div className="container">
          <h2 id="adres-ve-saatler" className="visually-hidden">
            Adres ve çalışma saatleri
          </h2>
          <ContactInfoPanels />
        </div>
      </section>
    </>
  );
}
