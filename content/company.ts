import type { ServiceMedia } from "./services";
import type { ContentStatus } from "./status";

/**
 * Firma tanıtımı (Biz Kimiz, Blok 05). Buradaki kuruluş, ekip ve çalışma alanı bilgileri
 * SONEF Teknoloji tarafından doğrulanmıştır (2026-11-13).
 *
 * SONEF sağlamadan eklenmemesi gerekenler: kişi adları, unvanlar, özgeçmişler, kapasite,
 * sertifika, müşteri bilgisi, makine modeli. Çıplak PCB için hizmet "tedarik"tir; SONEF'in
 * PCB ürettiği yazılmaz. Üretim bandı kart dizgisi ve üretim süreçleri bağlamında anlatılır.
 * Dizgi sonrası kontrol kozmetiktir; elektronik kontrol yalnızca müşteri onayıyla yapılır.
 */

export type ApproachItem = {
  title: string;
  text: string;
};

/** Giriş altındaki kısa bilgi: `value` öne çıkan değer, `label` açıklaması. */
export type CompanyFact = {
  value: string;
  label: string;
};

/**
 * Ekipteki bir uzmanlık alanı. Kişi adı, unvan ve özgeçmiş için gerçek veri geldiğinde
 * `members` doldurulabilir; boşken yalnızca alan ve kişi sayısı gösterilir.
 */
export type TeamRole = {
  title: string;
  count: number;
  members?: readonly { name: string; role?: string; bio?: string }[];
};

export type WorkArea = {
  title: string;
  text: string;
};

export const companyProfile = {
  status: "verified" satisfies ContentStatus,
  brandName: "SONEF Teknoloji",
  foundingYear: 2026,
  city: "İstanbul",

  lead: "SONEF Teknoloji, 2026 yılında İstanbul’da kuruldu. Elektronik sektöründeki çalışma deneyimimizi kendi üretim bandımızla birleştirerek kart tasarımı, üretim süreçleri, komponent tedariki, Ar‑Ge ve yazılım alanlarında hizmet veriyoruz.",

  /**
   * Girişteki üretim alanı fotoğrafı. Gerçek fotoğraf geldiğinde `image` eklenir
   * (`{ src, width, height, alt }`); `alt` fotoğrafta görünenlere göre yazılır. Oran sabit kalır.
   */
  heroMedia: {
    placeholderLabel: "Üretim alanı fotoğrafı",
    ratio: "4 / 3",
    // Temsilî stok fotoğraf (Unsplash, Clint Patterson). Kendi üretim alanı fotoğrafı gelince değiştirilmeli.
    image: {
      src: "/media/uretim-alani.webp",
      width: 2400,
      height: 1800,
      alt: "Havya istasyonu, büyüteçli tutucu ve devre tahtası bulunan elektronik çalışma tezgâhı",
    },
  } satisfies ServiceMedia,

  facts: [
    { value: "2026", label: "Kuruluş yılı" },
    { value: "İstanbul", label: "Kurulduğumuz şehir" },
    { value: "3 kişi", label: "Ekibimiz" },
  ] satisfies CompanyFact[],

  story: {
    title: "Sektörden kendi üretim bandımıza",
    paragraphs: [
      "Elektronik sektöründe çalışırken edindiğimiz deneyimi kendi hizmet anlayışımızla sürdürmek istedik. Bu hedefle SONEF Teknoloji’yi kurduk ve kendi üretim bandımızı oluşturduk.",
      "Bugün fikir aşamasındaki projelerle de üretime hazırlanmış kart tasarımlarıyla da çalışıyoruz. Projenin ihtiyacına göre tasarım, PCB ve komponent tedariki, dizgi ve yazılım çalışmalarını birlikte değerlendiriyoruz.",
    ],
  },

  team: {
    title: "Donanım ve yazılımı bir araya getiren ekip",
    lead: "Ekibimiz bir bilgisayar mühendisi ve elektronik alanında çalışan iki kişiden oluşuyor. Donanım ve yazılım ihtiyaçlarını bu ekip yapısıyla birlikte ele alıyoruz.",
    memberLabel: "ekip üyesi",
    roles: [
      { title: "Bilgisayar mühendisliği", count: 1 },
      { title: "Elektronik", count: 2 },
    ] satisfies TeamRole[],
  },

  workAreas: {
    title: "Hangi alanlarda çalışıyoruz?",
    items: [
      {
        title: "PCB tasarımı ve üretime hazırlık",
        text: "Kart tasarımını ve üretim için gereken hazırlıkları projenin ihtiyaçlarına göre ele alıyoruz.",
      },
      {
        title: "PCB ve komponent tedariki",
        text: "Baskı devre kartı ve elektronik parçaların tedarikini, proje dosyaları ve parça listesi üzerinden planlıyoruz.",
      },
      {
        title: "Kart dizgisi ve üretim süreçleri",
        text: "Kendi kurduğumuz üretim bandında komponent yerleştirme, dizgi ve fırınlama adımlarını yürütüyoruz.",
      },
      {
        title: "Ar‑Ge ve yazılım",
        text: "Sıfırdan tasarım gerektiren projeleri ve yazılım ihtiyaçlarını proje kapsamında değerlendiriyoruz.",
      },
    ] satisfies WorkArea[],
    /** Ayrıntılı kapsam hizmet detay sayfalarındadır; `slug` content/services.ts ile eşleşir. */
    links: [
      { slug: "smd-dizgi", label: "SMD Dizgi" },
      { slug: "pcb-tedarigi", label: "PCB Tedariki" },
      { slug: "komponent-tedarigi", label: "Komponent Tedariki" },
    ],
  },

  /**
   * Çalışma yaklaşımı maddeleri (Blok 03 taslağı, firma onayı bekliyor). Biz Kimiz sayfasında
   * (Blok 05) ve Referanslar sayfasında (Blok 07) artık gösterilmez; şu an hiçbir sayfa kullanmıyor.
   */
  approach: [
    {
      title: "İhtiyacı birlikte anlamak",
      text: "Her proje müşterimizle konuşarak başlar. Elinizde yalnızca bir fikir de olabilir, tamamlanmış bir proje de; önce neye ihtiyaç duyduğunuzu netleştiririz.",
    },
    {
      title: "Projeye uygun hazırlık ve tedarik",
      text: "Projenin gerektirdiği PCB ve komponentlerin temini, üretime geçmeden önce projenin kendisine göre planlanır.",
    },
    {
      title: "Üretim adımlarını birlikte ele almak",
      text: "Dizgi, fırınlama, kontrol ile paketleme ve gönderim birbirinden kopuk işler olarak değil, aynı sürecin adımları olarak yürütülür.",
    },
    {
      title: "Teslimattan sonra da yanınızda",
      text: "Ürün size ulaştığında iletişim bitmez; teslimat sonrasında da destek vermeye devam ederiz.",
    },
  ] satisfies ApproachItem[],
} as const;
