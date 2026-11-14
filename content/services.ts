import type { ProcessStepSlug } from "./process";
import { contactHref, servicesHref } from "@/lib/site";
import { contactInfo } from "./contact";
import type { ContentStatus } from "./status";

/**
 * Hizmet sayfalarının tek içerik kaynağı (`/hizmetler` ve `/hizmetler/[slug]`).
 *
 * Yalnızca SONEF'in bildirdiği süreçleri anlatır. Makine modeli, dizgi hızı, en küçük
 * komponent ölçüsü, katman sayısı, malzeme, yüzey kaplaması, tolerans, teslim süresi,
 * minimum adet, fiyat, sertifika, yetkili distribütörlük veya stok iddiası
 * SONEF tarafından doğrulanmadan buraya eklenmemelidir.
 *
 * `slug` URL'nin parçasıdır; yayına girdikten sonra değiştirmeyin.
 */

export type ServiceFlowStep = {
  title: string;
  text: string;
};

/** Hizmet kartlarındaki çizgi ikonlar (components/services/service-icon.tsx). */
export type ServiceIconName = "smd" | "pcb" | "component";

export type Service = {
  slug: string;
  status: ContentStatus;
  /** Sayfa H1'i ve kart başlığı. */
  title: string;
  /** Menü ve breadcrumb gibi dar alanlar için. */
  shortTitle: string;
  /** Kartlarda ve meta açıklamada kullanılan kısa tanım. */
  summary: string;
  /** Hizmetin karşıladığı müşteri ihtiyacı. */
  need: string;
  /** Detay sayfasının giriş paragrafı. */
  lead: string;
  description: string;
  scope: readonly string[];
  flowTitle: string;
  flow: readonly ServiceFlowStep[];
  /** Ön görüşmede paylaşılabilecek proje bilgileri. */
  prepare: readonly string[];
  /** Ana sayfadaki üretim yolculuğunda bu hizmetin karşılık geldiği adımlar. */
  processSteps: readonly ProcessStepSlug[];
  /** Ana sayfada bu hizmete bağlantı verilen tek adım (ölçülü bağlantı; tekrar edilmez). */
  homeStep: ProcessStepSlug;
  /** Ana sayfa süreç kartındaki bağlantı metni (sonuna ok CSS/JSX ile eklenir). */
  homeLinkLabel: string;
  /** /hizmetler genel bakış kartı (Blok 04A). Detay sayfası metinleri ayrıca revize edilecek. */
  overview: {
    title: string;
    text: string;
    /** Sonuna ok JSX ile eklenir. */
    linkLabel: string;
    icon: ServiceIconName;
  };
  image?: { src: string; width: number; height: number; alt: string; caption: string };
  /**
   * Revize edilmiş detay sayfası (Blok 04B SMD, 04C PCB, 04D Komponent). Tanımlıysa `/hizmetler/[slug]`
   * bu veriyle `ServiceDetail` düzenini gösterir; tanımlı değilse eski şablon kullanılır.
   */
  detail?: ServiceDetail;
};

/** Gerçek fotoğraf gelene kadar ölçüsü ayrılmış, CSS ile çizilen yer tutucu (components/ui/media-slot.tsx). */
export type ServiceMedia = {
  /** Yer tutucuda görünen etiket. */
  placeholderLabel: string;
  /** CSS `aspect-ratio`, ör. "4 / 3". Fotoğraf geldiğinde de aynı alan korunur. */
  ratio: string;
  /** Kullanım izni olan gerçek fotoğraf; `alt` fotoğrafın içeriğine göre yazılmalıdır. */
  image?: { src: string; width: number; height: number; alt: string };
};

/** Detay sayfası kartı: önce başlık, sonra açıklama, varsa en altta ilgili hizmet bağlantıları. */
export type ServiceDetailCard = {
  title: string;
  text: string;
  links?: readonly { slug: string; label: string }[];
};

/**
 * Detay sayfasının içerik bölümleri; sayfada verilen sırayla gösterilir.
 * `id` bölümün sayfa içi adresidir (ör. `#teklif-dosyalari`); başlık `${id}-baslik` kimliğini alır.
 */
export type ServiceDetailSection =
  /** İki eş ağırlıklı bilgi kartı (ör. malzemeyi kim sağlar, sipariş seçenekleri). */
  | { kind: "cards"; id: string; title: string; cards: readonly ServiceDetailCard[] }
  /** Numaralı süreç adımları: 4 sütun → 2×2 → tek sütun. */
  | { kind: "steps"; id: string; title: string; steps: readonly ServiceFlowStep[] }
  /** Kapsam etiketli kontrol kartları ve yanında fotoğraf alanı. `label` başlığın erişilebilir adına dahildir. */
  | {
      kind: "checks";
      id: string;
      title: string;
      items: readonly { label: string; title: string; text: string; conditional?: boolean }[];
      media: ServiceMedia;
    }
  /** Teklif hazırlığı için kontrol listesi grupları, ayrı bir not ve fotoğraf alanı. */
  | {
      kind: "checklist";
      id: string;
      title: string;
      groups: readonly { title: string; items: readonly string[]; note?: string }[];
      /** Gruplardan ayrı tutulan ek durum (ör. SMD dizgi de isteniyorsa). */
      aside?: { title: string; text: string };
      /** Dosya paylaşım yolu; e-posta bağlantı olarak gösterilir. */
      share?: { text: string; email: string };
      media: ServiceMedia;
    }
  /**
   * Numaralı seçenek kartları (ör. üç tedarik kapsamı): ≥ 70rem üç sütun, 40–70rem tek sütunlu
   * yatay kart, mobilde alt alta.
   */
  | { kind: "options"; id: string; title: string; cards: readonly ServiceDetailCard[] }
  /**
   * Teklif için parça başına istenen bilgiler (terim + açıklama listesi), liste biçimi notu,
   * ayrı bir ek dosya notu, paylaşım bağlantısı ve fotoğraf alanı.
   */
  | {
      kind: "fields";
      id: string;
      title: string;
      card: { title: string; fields: readonly { term: string; text: string }[]; note?: string };
      aside?: { title: string; text: string };
      /** Bölüm sonundaki bağlantı (ör. `mailto:`). */
      link?: { href: string; label: string };
      media: ServiceMedia;
    }
  /** Açık taş tonlu tek bilgi alanı: başlık, kısa metin, isteğe bağlı tek bağlantı. */
  | { kind: "callout"; id: string; title: string; text: string; link?: { href: string; label: string } };

export type ServiceDetail = {
  /** Marka ekiyle birlikte tam sekme başlığı (ör. "… | SONEF Teknoloji"). */
  metaTitle: string;
  metaDescription: string;
  /** Breadcrumb ve sayfa adı; verilmezse `shortTitle`/`title` kullanılır. */
  pageTitle?: string;
  eyebrow: string;
  lead: string;
  /** Girişte açıklamanın altındaki küçük bilgi satırı. */
  note?: string;
  /** Giriş düğmesi; `href` bir rota veya sayfa içi `#bolum` olabilir. */
  primaryAction: { label: string; href: string };
  heroMedia: ServiceMedia;
  /** Giriş bandının arkasına silik yerleştirilen dekoratif fotoğraf (`public/` yolu). */
  introBackground?: string;
  sections: readonly ServiceDetailSection[];
  /**
   * SONEF onaylı teknik bilgiler (ör. tek/çift yüz, THT, en küçük kılıf, katman, malzeme, kaplama,
   * kapasite, teslim süresi, sertifika, test yöntemi). Boşken bölüm hiç gösterilmez.
   */
  specs?: { title: string; items: readonly { label: string; value: string }[] };
};

export const services = [
  {
    slug: "smd-dizgi",
    status: "draft",
    title: "SMD Dizgi",
    shortTitle: "SMD Dizgi",
    summary:
      "SMD komponentlerin kart üzerindeki yerlerine yerleştirilmesi; ardından fırınlama ve kozmetik kontrol.",
    need: "Tasarımı hazır bir kartın, komponentleriyle birlikte çalışır bir devre kartına dönüşmesi gerektiğinde.",
    lead: "SMD dizgi, komponentlerin kart üzerindeki yerlerine yerleştirilmesidir. Dizgiyi tek başına bir iş olarak değil, fırınlama ve kontrol adımlarıyla birlikte planlarız.",
    description:
      "SONEF’in SMD dizgi hizmeti: komponentlerin kart üzerindeki yerlerine yerleştirilmesi, fırınlama ile lehimleme ve kartların kozmetik kontrolü; elektronik kontrol müşteri onayıyla.",
    scope: [
      "SMD komponentlerin kart üzerindeki yerlerine yerleştirilmesi",
      "Dizginin ardından fırınlama ile lehimleme",
      "Dizgisi tamamlanan kartların ekibimizce kozmetik kontrolü; müşteri onayıyla elektronik kontrol",
      "Gerektiğinde PCB ve komponent tedariğinin dizgiyle birlikte planlanması",
    ],
    flowTitle: "Karttan çalışır devreye",
    flow: [
      {
        title: "Projenin değerlendirilmesi",
        text: "Kart tasarımınızı ve komponent listenizi birlikte inceler, dizgiye geçmeden önce gerekenleri netleştiririz.",
      },
      {
        title: "Kart ve komponentlerin hazırlanması",
        text: "PCB ve komponentler sizden gelebilir; tedariğin de bizde olması gerekiyorsa bunu dizgiyle aynı plan içinde ele alırız.",
      },
      {
        title: "Dizgi",
        text: "SMD komponentler kart üzerindeki yerlerine yerleştirilir.",
      },
      {
        title: "Fırınlama",
        text: "Dizginin ardından lehimleme süreci uygulanır.",
      },
      {
        title: "Kontrol",
        text: "Kartlar ekibimizce kozmetik açıdan kontrol edilir; elektronik kontrol müşteri onayıyla yapılır. Ardından paketleme ve gönderime geçilir.",
      },
    ],
    prepare: [
      "PCB tasarım dosyaları (ör. Gerber)",
      "Komponent listesi (BOM) ve komponentlerin kart üzerindeki yerleşim bilgisi",
      "Kartın ne iş yaptığına dair kısa bir açıklama",
      "Hedeflediğiniz adet ve zamanlama beklentiniz",
      "Kartın ve komponentlerin sizden mi geleceği, yoksa tedariğin de mi gerektiği",
    ],
    processSteps: ["dizgi-islemleri", "firinlama", "kontrol-ve-test"],
    homeStep: "dizgi-islemleri",
    homeLinkLabel: "SMD dizgi hizmetini inceleyin",
    overview: {
      title: "SMD Dizgi",
      text: "Komponentleri PCB üzerinde tasarımda belirtilen konumlara yerleştiriyoruz. Dizginin ardından kartı fırınlama ve proje kapsamındaki kontrol adımlarından geçiriyoruz.",
      linkLabel: "SMD dizgiyi inceleyin",
      icon: "smd",
    },
    detail: {
      metaTitle: "SMD Dizgi Hizmeti | SONEF Teknoloji",
      metaDescription:
        "SMD komponentleri PCB üzerine yerleştiriyor, kartı fırınlıyor ve kozmetik kontrolden geçiriyoruz. PCB ve komponentleri siz sağlayabilir veya tedariği birlikte planlayabilirsiniz.",
      eyebrow: "Kart montajı",
      lead: "SMD komponentleri kart tasarımınıza göre PCB üzerindeki yerlerine yerleştiriyoruz. Dizgi ve fırınlama tamamlandığında ekibimiz kartı görünüm açısından inceliyor. PCB ve komponentleri siz sağlayabilir veya tedarik kapsamını bizimle birlikte planlayabilirsiniz.",
      primaryAction: { label: "Dizgi projenizi konuşalım", href: contactHref },
      heroMedia: {
        placeholderLabel: "Üretim fotoğrafı alanı",
        ratio: "4 / 3",
        image: {
          src: "/media/smd-yerlestirme.webp",
          width: 2400,
          height: 1800,
          alt: "Cımbızla tutulan entegre devrenin PCB üzerindeki yerine yerleştirilmesi",
        },
      },
      introBackground: "/backgrounds/smd-dizgi-hd.webp",
      sections: [
        {
          kind: "cards",
          id: "malzeme-saglama",
          title: "PCB ve komponentleri kim sağlar?",
          cards: [
            {
              title: "PCB ve komponentleri siz sağlayabilirsiniz",
              text: "Elinizdeki PCB ve komponentlerle dizgi talebi oluşturabilirsiniz. Elinizde hangi malzemelerin bulunduğunu ve dizgi ihtiyacınızı görüşmede netleştiriyoruz.",
            },
            {
              title: "Tedariği birlikte planlayabiliriz",
              text: "PCB veya komponent tedariğine ihtiyacınız varsa, gerekli malzemeleri dizgi projenizle birlikte değerlendirebiliriz.",
              links: [
                { slug: "pcb-tedarigi", label: "PCB Tedariği" },
                { slug: "komponent-tedarigi", label: "Komponent Tedariği" },
              ],
            },
          ],
        },
        {
          kind: "steps",
          id: "dizgi-sureci",
          title: "SMD dizgi nasıl ilerler?",
          steps: [
            {
              title: "Projeyi değerlendiriyoruz",
              text: "Kart tasarımını, komponent listesini ve dizgi ihtiyacını görüşüyoruz. PCB ve komponentlerin kim tarafından sağlanacağını netleştiriyoruz.",
            },
            {
              title: "Komponentleri karta yerleştiriyoruz",
              text: "SMD komponentleri PCB üzerinde tasarımda belirtilen konumlara yerleştiriyoruz.",
            },
            {
              title: "Kartı fırınlıyoruz",
              text: "Dizgisi tamamlanan kartı fırınlama aşamasından geçirerek lehim bağlantılarını oluşturuyoruz.",
            },
            {
              title: "Kartı görsel olarak inceliyoruz",
              text: "Fırınlamadan sonra ekibimiz kartın kozmetik kontrolünü yapıyor.",
            },
          ],
        },
        {
          kind: "checks",
          id: "dizgi-sonrasi-kontrol",
          title: "Dizgi sonrası kontrol",
          items: [
            {
              label: "Dizgi sonrası",
              title: "Kozmetik kontrol",
              text: "Fırınlama tamamlandıktan sonra kartlar ekibimiz tarafından görsel olarak incelenir.",
            },
            {
              label: "Müşteri onayıyla",
              title: "Elektronik kontrol",
              text: "Kozmetik kontrolün ardından, müşteri onayı alınırsa proje kapsamında elektronik kontrol yapılabilir.",
              conditional: true,
            },
          ],
          media: {
            placeholderLabel: "Kart detay fotoğrafı alanı",
            ratio: "4 / 3",
            image: {
              src: "/media/smd-kart-detay.webp",
              width: 2400,
              height: 1800,
              alt: "Dizgisi yapılmış kart üzerinde lehimlenmiş SMD direnç ve kondansatörlerin yakın görünümü",
            },
          },
        },
      ],
    },
  },
  {
    slug: "pcb-tedarigi",
    status: "draft",
    title: "PCB Tedariği",
    shortTitle: "PCB Tedariği",
    summary: "Projenizin PCB ihtiyacının belirlenmesi ve projeye uygun kartın temin edilmesi.",
    need: "Kart tasarımınız hazır ama kartın teminini üretimle birlikte planlamak istediğinizde ya da fikriniz projeye dönüşürken.",
    lead: "Her elektronik proje, ona uygun bir baskılı devre kartı (PCB) gerektirir. PCB tedariğinde önce projenizin kart ihtiyacını anlar, ardından uygun kartın teminini sonraki üretim adımlarıyla birlikte planlarız.",
    description:
      "SONEF’in PCB tedariği hizmeti: projenin kart ihtiyacının anlaşılması ve uygun PCB’nin komponent tedariği ve dizgiyle birlikte planlanarak temin edilmesi.",
    scope: [
      "Projenin PCB ihtiyacının birlikte değerlendirilmesi",
      "Tasarım bilgilerinize uygun kartın temin edilmesi",
      "PCB tedariğinin komponent tedariği ve dizgiyle aynı plan içinde ele alınması",
    ],
    flowTitle: "İhtiyaçtan karta",
    flow: [
      {
        title: "İhtiyacın anlaşılması",
        text: "Projenin ne yapacağını, kart tasarımının hangi aşamada olduğunu ve beklentilerinizi konuşuruz.",
      },
      {
        title: "Tasarım bilgilerinin netleşmesi",
        text: "Kartın temini için gereken tasarım dosyalarını ve kart özelliklerini sizinle birlikte gözden geçiririz.",
      },
      {
        title: "Uygun kartın temini",
        text: "Projeye uygun PCB temin edilir.",
      },
      {
        title: "Üretime geçiş",
        text: "Kart ve komponentler hazır olduğunda süreç dizgi ve sonraki adımlarla devam eder.",
      },
    ],
    prepare: [
      "Varsa PCB tasarım dosyaları",
      "Kartın kullanılacağı ürün veya devre hakkında kısa bilgi",
      "Kart için belirlediğiniz özellikler",
      "İhtiyaç duyduğunuz kart adedi",
      "Komponent tedariği ve dizginin de gerekip gerekmediği",
    ],
    processSteps: ["tanisma-ve-projelendirme", "pcb-ve-komponent-tedarigi"],
    homeStep: "pcb-ve-komponent-tedarigi",
    homeLinkLabel: "PCB tedariği hizmetini inceleyin",
    overview: {
      title: "PCB Tedariği",
      text: "Kart tasarımınıza ve proje gereksinimlerinize uygun PCB’nin tedarik sürecini yürütüyoruz. Sipariş öncesinde kart için gereken bilgileri birlikte netleştiriyoruz.",
      linkLabel: "PCB tedariğini inceleyin",
      icon: "pcb",
    },
    detail: {
      metaTitle: "PCB Tedariği | SONEF Teknoloji",
      metaDescription:
        "SONEF Teknoloji ile PCB tedariğini tek başına veya SMD dizgiyle birlikte planlayın. Teklif dosyalarını ve tasarım desteği seçeneklerini inceleyin.",
      pageTitle: "PCB Tedariği",
      eyebrow: "Baskı devre kartı",
      lead: "Elektronik projeniz için baskı devre kartı tedariğini, üretim dosyalarınız ve kart özellikleriniz üzerinden planlıyoruz. Yalnızca PCB talep edebilir veya kart tedariğini SMD dizgiyle birlikte değerlendirebilirsiniz.",
      note: "PCB tedariğinde minimum sipariş adedi şartı yoktur.",
      primaryAction: { label: "Teklif için gerekenleri inceleyin", href: "#teklif-dosyalari" },
      heroMedia: {
        placeholderLabel: "Çıplak PCB fotoğrafı alanı",
        ratio: "4 / 3",
        image: {
          src: "/media/ciplak-pcb.webp",
          width: 2400,
          height: 1800,
          alt: "Altın kaplama pedleri görünen, komponent dizilmemiş yeşil baskı devre kartları",
        },
      },
      introBackground: "/backgrounds/pcb-tedarigi-hd.webp",
      sections: [
        {
          kind: "cards",
          id: "siparis-secenekleri",
          title: "PCB’yi nasıl sipariş edebilirsiniz?",
          cards: [
            {
              title: "Yalnızca PCB tedariği",
              text: "Üretim dosyalarınız hazırsa çıplak PCB siparişi için bize ulaşabilirsiniz. Tedarik kapsamını kart özellikleriniz ve ihtiyacınız olan adet üzerinden belirliyoruz.",
            },
            {
              title: "PCB tedariği ve SMD dizgi",
              text: "PCB tedariğini ve SMD dizgiyi aynı proje kapsamında planlayabilirsiniz. Dizgide kullanılacak komponentleri siz sağlayabilir veya komponent tedariğini de talebinize ekleyebilirsiniz.",
              links: [{ slug: "smd-dizgi", label: "SMD dizgiyi inceleyin" }],
            },
          ],
        },
        {
          kind: "checklist",
          id: "teklif-dosyalari",
          title: "Teklif için neleri hazırlamalısınız?",
          groups: [
            {
              title: "Üretim dosyaları",
              items: ["Kartın üretime hazır Gerber dosyaları", "Delik dosyaları"],
              note: "Üretim setinin tamamını aynı tasarım revizyonuna ait dosyalarla paylaşın.",
            },
            {
              title: "Sipariş bilgileri",
              items: [
                "Kart ölçüsü",
                "İstenen adet",
                "Belirlenmişse teknik tercihler: katman sayısı, malzeme, kalınlık ve yüzey kaplaması",
              ],
            },
          ],
          aside: {
            title: "SMD dizgi de talep ediliyorsa",
            text: "PCB üretim dosyalarına ek olarak komponent listesi (BOM) ve yerleşim dosyası (Pick & Place) hazırlanır.",
          },
          share: { text: "Hazırladığınız dosyaları e-posta ile paylaşabilirsiniz:", email: contactInfo.email },
          media: {
            placeholderLabel: "PCB detay fotoğrafı alanı",
            ratio: "4 / 3",
            image: {
              src: "/media/pcb-detay.webp",
              width: 2400,
              height: 1800,
              alt: "Baskı devre kartındaki iletken yolların, pedlerin ve bir entegre devrenin yakın görünümü",
            },
          },
        },
        {
          kind: "callout",
          id: "tasarim-destegi",
          title: "Üretim dosyalarınız henüz hazır değilse",
          text: "Mevcut kart tasarımınızın üretime hazırlanması için destek veriyoruz. Kartın sıfırdan tasarlanması gereken projeleri Ar‑Ge kapsamında ayrıca değerlendiriyoruz. Başlangıç için kartın ne yapmasını istediğinizi ve varsa elinizdeki çizimleri bizimle paylaşabilirsiniz.",
          link: { href: contactHref, label: "Tasarım ihtiyacınızı konuşalım" },
        },
        {
          kind: "steps",
          id: "pcb-tedarik-sureci",
          title: "PCB tedariği nasıl ilerler?",
          steps: [
            {
              title: "Dosyaları inceliyoruz",
              text: "Üretim dosyalarını ve sipariş için ilettiğiniz bilgileri değerlendiriyoruz.",
            },
            {
              title: "Kart özelliklerini netleştiriyoruz",
              text: "Kartın teknik tercihlerini, ölçüsünü ve ihtiyacınız olan adedi birlikte belirliyoruz.",
            },
            {
              title: "Teklifi ve tedariği planlıyoruz",
              text: "Projenin kapsamına göre teklif hazırlıyor ve onay sonrasında tedarik sürecini yürütüyoruz.",
            },
            {
              title: "Teslimatı veya dizgiyi planlıyoruz",
              text: "Sipariş kapsamına göre kartların teslimatı ya da SMD dizgiye geçişi planlanıyor.",
            },
          ],
        },
      ],
    },
  },
  {
    slug: "komponent-tedarigi",
    status: "draft",
    title: "Komponent Tedariği",
    shortTitle: "Komponent Tedariği",
    summary: "Projenin ihtiyaç duyduğu elektronik komponentlerin belirlenmesi ve temin edilmesi.",
    need: "Komponent listenizin temin edilmesi ya da listedeki parçaların projenize göre netleştirilmesi gerektiğinde.",
    lead: "Bir kartın çalışması, gereken komponentlerin eksiksiz bir araya gelmesine bağlıdır. Komponent tedariğinde projenizin ihtiyaç duyduğu parçaları sizinle birlikte belirler ve teminini dizgi planıyla birlikte ele alırız.",
    description:
      "SONEF’in elektronik komponent tedariği hizmeti: komponent listesinin birlikte incelenmesi, projenin ihtiyaç duyduğu parçaların belirlenmesi ve temin edilmesi.",
    scope: [
      "Komponent listesinin (BOM) birlikte incelenmesi",
      "Projenin ihtiyaç duyduğu komponentlerin ve adetlerin belirlenmesi",
      "Komponentlerin temin edilmesi",
      "Tedariğin PCB tedariği ve dizgiyle birlikte planlanması",
    ],
    flowTitle: "Listeden dizgiye",
    flow: [
      {
        title: "Listenin incelenmesi",
        text: "Komponent listenizi ya da proje bilgilerinizi birlikte gözden geçiririz.",
      },
      {
        title: "İhtiyacın netleşmesi",
        text: "Gerekli komponentler ve adetleri belirlenir; açık kalan noktaları sizinle konuşuruz.",
      },
      {
        title: "Temin",
        text: "Belirlenen komponentler temin edilir.",
      },
      {
        title: "Dizgiye hazırlık",
        text: "Komponentler kartla birlikte dizgi adımına geçer.",
      },
    ],
    prepare: [
      "Komponent listesi (BOM): parça numaraları ve adetler",
      "Varsa kabul ettiğiniz muadil parçalar",
      "Toplam üretim adedi",
      "PCB tedariği ve dizginin de gerekip gerekmediği",
      "Zamanlama beklentiniz",
    ],
    processSteps: ["pcb-ve-komponent-tedarigi"],
    homeStep: "pcb-ve-komponent-tedarigi",
    homeLinkLabel: "Komponent tedariği hizmetini inceleyin",
    overview: {
      title: "Komponent Tedariği",
      text: "Projenizdeki elektronik komponentleri parça listenize göre tedarik ediyoruz. Montaj öncesinde gereken parçaları proje kapsamına göre belirliyoruz.",
      linkLabel: "Komponent tedariğini inceleyin",
      icon: "component",
    },
    detail: {
      metaTitle: "Komponent Tedariği | SONEF Teknoloji",
      metaDescription:
        "SONEF Teknoloji ile elektronik komponent tedariği ve eksik parça tamamlama. Teklif için gerekli parça bilgilerini ve SMD dizgiyle birlikte tedarik seçeneğini inceleyin.",
      pageTitle: "Komponent Tedariği",
      eyebrow: "Elektronik parça tedariği",
      lead: "Elektronik komponentleri parça listenize göre tedarik ediyoruz. Listenizin tamamını veya yalnızca eksik parçaları paylaşabilirsiniz. Tedariği tek başına talep edebilir ya da SMD dizgiyle birlikte planlayabilirsiniz.",
      note: "Komponent siparişlerinde minimum adet şartı yoktur.",
      primaryAction: { label: "Teklif listesini hazırlayın", href: "#teklif-listesi" },
      heroMedia: {
        placeholderLabel: "Komponent fotoğrafı alanı",
        ratio: "4 / 3",
        image: {
          src: "/media/komponent.webp",
          width: 2400,
          height: 1800,
          alt: "Lacivert zemin üzerinde iki adet QFN kılıflı mikrodenetleyici",
        },
      },
      introBackground: "/backgrounds/komponent-tedarigi-hd.webp",
      sections: [
        {
          kind: "options",
          id: "tedarik-secenekleri",
          title: "İhtiyacınıza uygun tedarik kapsamı",
          cards: [
            {
              title: "Yalnızca komponent tedariği",
              text: "Parça listenizi ve ihtiyacınız olan adetleri paylaşın. Teklifinizi listedeki komponentler üzerinden değerlendirelim.",
            },
            {
              title: "Eksik parçaların tamamlanması",
              text: "Komponentlerin bir bölümü elinizdeyse yalnızca eksik olan parçaları ve adetlerini iletin. Tedariği bu listeye göre planlayalım.",
            },
            {
              title: "SMD dizgiyle birlikte tedarik",
              text: "Dizgide kullanılacak komponentlerin tedariğini ve kart montajını aynı proje kapsamında planlayabilirsiniz.",
              links: [{ slug: "smd-dizgi", label: "SMD dizgi hizmetini inceleyin" }],
            },
          ],
        },
        {
          kind: "fields",
          id: "teklif-listesi",
          title: "Teklif için listenizde neler olmalı?",
          card: {
            title: "Her parça için gereken bilgiler",
            fields: [
              { term: "Parça kodu", text: "Talep ettiğiniz komponentin kodu" },
              { term: "Değer", text: "Parçanın değeri veya onu tanımlayan özellik" },
              { term: "Kılıf", text: "Montaja uygun komponent kılıfı" },
              { term: "Adet", text: "Her bir komponent için ihtiyaç duyduğunuz miktar" },
            ],
            note: "BOM listenizi Excel veya CSV olarak paylaşabilirsiniz. Listeniz farklı bir biçimdeyse elinizdeki dosyayı da değerlendirmeye iletebilirsiniz.",
          },
          aside: {
            title: "Ek proje dosyası: Gerber",
            text: "Kart tedariği veya dizgi de talebinize dâhilse Gerber dosyalarını parça listenizle birlikte paylaşabilirsiniz.",
          },
          link: { href: `mailto:${contactInfo.email}`, label: "Listenizi e-postayla paylaşın" },
          media: {
            placeholderLabel: "Parça detay fotoğrafı alanı",
            ratio: "4 / 3",
            image: {
              src: "/media/parca-detay.webp",
              width: 2400,
              height: 1800,
              alt: "Bacakları görünen QFP kılıflı bir entegre devrenin yakın görünümü",
            },
          },
        },
        {
          kind: "callout",
          id: "muadil-onayi",
          title: "Muadil parça için önce onayınızı alıyoruz",
          text: "Talep ettiğiniz komponent için bir muadil gündeme gelirse seçeneği sizinle paylaşırız. Dizgide muadil komponent kullanılması onayınıza bağlıdır.",
        },
        {
          kind: "steps",
          id: "komponent-tedarik-sureci",
          title: "Komponent tedariği nasıl ilerler?",
          steps: [
            {
              title: "Listeyi paylaşırsınız",
              text: "İhtiyacınız olan parçaların kodunu, değerini, kılıfını ve adedini iletirsiniz.",
            },
            {
              title: "Talebi değerlendiririz",
              text: "Listeyi ve parçaların temin durumunu inceleriz. Muadil gündeme gelirse seçeneği sizinle görüşürüz.",
            },
            {
              title: "Tedariği planlarız",
              text: "Teklif onaylandıktan sonra parçaların teslimatını veya dizgiye geçişini sipariş kapsamına göre planlarız.",
            },
          ],
        },
      ],
    },
  },
] as const satisfies readonly Service[];

export type ServiceSlug = (typeof services)[number]["slug"];


export function serviceHref(slug: Service["slug"]): `/hizmetler/${string}` {
  return `${servicesHref}/${slug}`;
}

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

/** Ana sayfadaki süreç adımına bağlanan hizmetler (ölçülü bağlantılar için). */
export function servicesForProcessStep(step: string): Service[] {
  return services.filter((service) => (service.processSteps as readonly string[]).includes(step));
}

/** /hizmetler "Birlikte nasıl ilerliyoruz?" adımları (Blok 04A). */
export const serviceWorkflow = [
  {
    title: "İhtiyacı konuşuyoruz",
    text: "Fikrinizi veya hazır kart tasarımınızı değerlendirip ihtiyaç duyduğunuz hizmetleri belirliyoruz.",
  },
  {
    title: "Üretim kapsamını netleştiriyoruz",
    text: "PCB, komponent ve dizgi ihtiyaçlarını proje bilgilerine göre planlıyoruz.",
  },
  {
    title: "Kontrol ve teslimatı planlıyoruz",
    text: "Dizgi sonrası kozmetik kontrolü, onayınıza bağlı elektronik kontrolü ve gönderim sürecini netleştiriyoruz.",
  },
] as const satisfies readonly ServiceFlowStep[];
