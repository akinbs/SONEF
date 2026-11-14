import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/page-intro";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  mission,
  principles,
  vision,
  visionMissionIntro,
  type Statement,
} from "@/content/vision-mission";
import { createPageMetadata } from "@/lib/metadata";
import styles from "./page.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Vizyon ve Misyon | SONEF Teknoloji",
  absoluteTitle: true,
  description:
    "SONEF Teknoloji’nin SMD dizgi, PCB ve komponent tedariği, Ar-Ge ve yazılım hizmetlerine yön veren misyonunu, vizyonunu ve çalışma ilkelerini keşfedin.",
  path: "/vizyon-ve-misyon",
});

/**
 * Vizyon ve Misyon (Blok 06). Bütün metinler `content/vision-mission.ts` içindedir.
 * Sıra: breadcrumb → giriş → misyon ve vizyon panelleri → dört çalışma ilkesi.
 */
export default function VisionMissionPage() {
  return (
    <>
      <PageIntro
        eyebrow={visionMissionIntro.eyebrow}
        title={visionMissionIntro.title}
        breadcrumb={[{ label: "Ana Sayfa", href: "/" }, { label: visionMissionIntro.title }]}
        background="/backgrounds/vizyon-misyon-hd.webp"
        backgroundMode="clear"
      >
        <p>{visionMissionIntro.lead}</p>
      </PageIntro>

      <section className={styles.sectionFirst} aria-label="Misyon ve vizyon">
        <div className={`container ${styles.panels}`}>
          <StatementPanel id="misyon" statement={mission} tone="card" />
          <StatementPanel id="vizyon" statement={vision} tone="stone" />
        </div>
      </section>

      <section className={styles.section} aria-labelledby="calisma-ilkeleri">
        <div className="container">
          <SectionHeading id="calisma-ilkeleri" title={principles.title} />
          <ol className={styles.principles}>
            {principles.items.map((item, index) => (
              <li key={item.title} className={styles.principle}>
                {/* Sıra numarası dekoratiftir; sıra bilgisini liste (ol) zaten taşır. */}
                <span className={styles.principleNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.principleTitle}>{item.title}</h3>
                <p className={styles.principleText}>{item.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

/** Misyon (beyaz) ve vizyon (açık taş) aynı hiyerarşiyi kullanır: etiket → H2 → metin. */
function StatementPanel({ id, statement, tone }: { id: string; statement: Statement; tone: "card" | "stone" }) {
  return (
    <article className={styles.panel} data-tone={tone} aria-labelledby={id}>
      <p className={styles.panelEyebrow}>{statement.eyebrow}</p>
      <h2 id={id} className={styles.panelTitle}>
        {statement.label}
      </h2>
      <div className={styles.panelText}>
        {statement.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
