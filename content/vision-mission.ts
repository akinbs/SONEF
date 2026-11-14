import type { ContentStatus } from "./status";

/**
 * Vizyon, misyon ve çalışma ilkeleri (Blok 06). Metinler SONEF Teknoloji tarafından
 * verilmiştir (2026-11-13).
 *
 * - Misyon bugünkü amacı, vizyon ulaşılmak istenen konumu anlatır.
 * - "Sağlıklı süreç": projenin anlaşılması, kapsamın netleşmesi ve işin takip edilmesi demektir;
 *   kalite belgesi, garanti veya teslim süresi taahhüdü olarak yazılmaz.
 * - "Ar‑Ge" bölünmez tireyle (U+2011) yazılır; kelime satır sonunda "Ar-" / "Ge" diye ayrılmaz.
 * - İlkeler çalışma ilkesidir; geçmiş başarı, ölçülmüş süre veya sertifikalı politika gibi sunulmaz.
 */

export type Statement = {
  status: ContentStatus;
  /** Başlığın üstündeki küçük etiket; panelin görevini söyler. */
  eyebrow: string;
  /** Panel başlığı (H2). */
  label: string;
  paragraphs: readonly string[];
};

export type Principle = {
  title: string;
  text: string;
};

export const visionMissionIntro = {
  eyebrow: "Çalışma anlayışımız",
  title: "Vizyon ve Misyon",
  lead: "Müşterimizin ihtiyacını anlayarak başlıyor, donanım ve yazılım çalışmalarını açık iletişim, hız ve güvenilirlik odağında ele alıyoruz.",
} as const;

export const mission = {
  status: "verified",
  eyebrow: "Bugünkü amacımız",
  label: "Misyonumuz",
  paragraphs: [
    "Müşterilerimizin sorunlarını ve proje gereksinimlerini doğru anlayarak elektronik projelerin sağlıklı biçimde hayata geçmesine destek olmak.",
    "PCB tasarımı ve tedariki, SMD dizgi, komponent tedariki, Ar‑Ge ve yazılım hizmetlerini açık iletişim, hız ve güvenilirlik anlayışıyla sunmak.",
  ],
} as const satisfies Statement;

export const vision = {
  status: "verified",
  eyebrow: "Gelecek hedefimiz",
  label: "Vizyonumuz",
  paragraphs: [
    "Elektronik üretim, Ar‑Ge ve yazılım ihtiyaçlarında müşterisinin projesini doğru anlayan, hızı ve güvenilirliğiyle tercih edilen bir teknoloji çözüm ortağı olmak.",
  ],
} as const satisfies Statement;

export const principles = {
  title: "Bu anlayışı işimize nasıl yansıtıyoruz?",
  items: [
    {
      title: "İhtiyacı doğru anlamak",
      text: "Çözüme başlamadan önce sorunu, projenin amacını ve müşterinin beklentilerini netleştirmeyi esas alırız.",
    },
    {
      title: "Net iletişim",
      text: "İşin kapsamını ve ilerleyişini anlaşılır biçimde paylaşmayı, soruları açıkça konuşmayı önemseriz.",
    },
    {
      title: "Hızlı ilerlemek",
      text: "Taleplere hızlı dönüş yapmayı ve sonraki adımları netleştirerek sürecin ilerlemesini hedefleriz.",
    },
    {
      title: "Sağlıklı ve güvenilir süreç",
      text: "Müşteriyle kararlaştırılan kapsamı takip ederek projenin düzenli, kontrollü ve güvenilir biçimde ilerlemesini gözetiriz.",
    },
  ] satisfies Principle[],
} as const;
