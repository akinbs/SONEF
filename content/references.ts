/**
 * Referanslar ve iş birlikleri (Blok 07). Sayfadaki bütün kayıtlar ve metinler buradan yönetilir.
 *
 * - Yalnızca adının ve logosunun sitede kullanılması doğrulanan kuruluşlar eklenir
 *   (`publicationApproved: true` bu kontrolün bilinçli yapıldığını gösterir).
 * - `partnership` iş birliğinin türünü söyler. Proje ayrıntısı, yorum, puan veya sonuç yalnızca
 *   kuruluşun onayladığı ifadeyle `summary` alanına eklenir; onay yoksa boş bırakılır.
 * - Logo `public/references/<kurulus>/` altında yerel dosyadır; özgün renk ve oranıyla kullanılır.
 * - Ana sayfa animasyonundaki ESP32 kartı bir müşteri projesi değildir; buraya eklenmez.
 *
 * Liste boşken sayfa logo kutusu veya örnek kayıt göstermez.
 */

export type ReferenceLogo = {
  /** `public/` altındaki, kullanımı doğrulanmış logo dosyası. */
  src: string;
  /** Dosyanın gerçek piksel ölçüleri; alan baştan ayrılır, yüklenirken yerleşim kaymaz. */
  width: number;
  height: number;
  alt: string;
};

export type Reference = {
  name: string;
  publicationApproved: true;
  /** İş birliğinin türü (ör. "Fikir ve Danışma Ortaklığı"). */
  partnership?: string;
  /** Birlikte yapılan işin kısa ve kuruluşça onaylanmış anlatımı. */
  summary?: string;
  logo?: ReferenceLogo;
  /** Kuruluşun resmî web sitesi (https). */
  website?: string;
};

export const referencesPage = {
  eyebrow: "Birlikte çalıştığımız kuruluşlar",
  title: "Referanslar ve İş Birlikleri",
  lead: "Fikir ve danışma alanındaki iş birliğimizi paylaşıyoruz.",
  /** Giriş bandının arkasındaki silik dekoratif fotoğraf. */
  introBackground: "/backgrounds/referanslar-hd.webp",
  websiteLinkLabel: "Resmî web sitesini ziyaret edin",
} as const;

export const references: readonly Reference[] = [
  {
    // Kullanıcı doğruladı (2026-11-13). Proje ayrıntısı istenmedi: `summary` bilerek boş.
    name: "Panotim Otomasyon Sistemleri",
    publicationApproved: true,
    partnership: "Fikir ve Danışma Ortaklığı",
    // Kaynak: https://panotim.com/wp-content/uploads/2022/03/LOGO-1-1.png (değiştirilmemiş kopya).
    logo: {
      src: "/references/panotim/panotim-logo.png",
      width: 2267,
      height: 549,
      alt: "Panotim Otomasyon Sistemleri logosu",
    },
    website: "https://panotim.com/",
  },
];
