/**
 * Ana sayfadaki üretim yolculuğunun tek içerik kaynağı.
 *
 * - `slug`, ana sayfa bağlantıları (`/#slug`) ve hizmet içeriklerindeki ilişkiler
 *   için kalıcı kimliktir; yayına girdikten sonra değiştirmeyin.
 * - Açıklamalar yalnızca SONEF'in bildirdiği süreçleri anlatır. Kapasite, süre,
 *   cihaz veya sertifika gibi doğrulanmamış ayrıntılar buraya eklenmemelidir.
 * - 3D zaman çizelgesi (Blok 02) bu sırayı izleyecek. Pin header grupları,
 *   gerçek montaj sırası netleşene kadar dizgi/reflow aşamasına bağlanmaz.
 */

export type ProcessStep = {
  slug: string;
  /** İç sayfalardaki (hizmetler, biz kimiz, hizmet detayı) adım adı ve aşama göstergesi. */
  title: string;
  /** İç sayfalardaki kısa tanım. */
  summary: string;
  /** Ana sayfa süreç kartı: küçük aşama etiketi (büyük harf CSS ile, `lang="tr"`). */
  label: string;
  /** Ana sayfa süreç kartı başlığı. */
  headline: string;
  /** Ana sayfa süreç kartı açıklaması (bir-iki kısa cümle). */
  description: string;
};

export const processSteps = [
  {
    slug: "tanisma-ve-projelendirme",
    title: "Tanışma ve projelendirme",
    summary:
      "Müşterinin fikrinin projeye dönüştürülmesi veya hazır projesinin değerlendirilmesi.",
    label: "Proje",
    headline: "Fikirden üretim planına",
    description: "İhtiyacınızı dinliyor ve üretim için gerekenleri netleştiriyoruz. Hazır bir tasarımınız varsa onun üzerinden ilerliyoruz.",
  },
  {
    slug: "pcb-ve-komponent-tedarigi",
    title: "PCB ve komponent tedariği",
    summary: "Projeye uygun PCB’nin ve gerekli komponentlerin temin edilmesi.",
    label: "Tedarik",
    headline: "Kart ve parçaları hazırlıyoruz",
    description: "PCB ve komponentleri siz sağlayabilir ya da tedariğini bize bırakabilirsiniz.",
  },
  {
    slug: "dizgi-islemleri",
    title: "Dizgi işlemleri",
    summary: "SMD komponentlerin kart üzerindeki yerlerine yerleştirilmesi.",
    label: "Dizgi",
    headline: "Komponentler yerlerine oturuyor",
    description: "SMD komponentleri kart üzerindeki tasarımda belirtilen konumlara yerleştiriyoruz.",
  },
  {
    slug: "firinlama",
    title: "Fırınlama",
    summary: "Dizginin ardından lehimleme süreci.",
    label: "Lehimleme",
    headline: "Kart fırına giriyor",
    description: "Dizgisi tamamlanan kartı fırınlayarak komponentlerin lehim bağlantılarını oluşturuyoruz.",
  },
  {
    slug: "kontrol-ve-test",
    title: "Kontrol",
    summary: "Dizgi sonrası kozmetik kontrol; müşteri onayıyla elektronik kontrol.",
    label: "Kontrol",
    headline: "Teslimden önce kontrol",
    description: "Ekibimiz kartları kozmetik açıdan kontrol ediyor. Elektronik kontrol onayınızla yapılıyor.",
  },
  {
    slug: "paketleme-ve-gonderim",
    title: "Paketleme ve gönderim",
    summary: "Tamamlanan ürünlerin müşteriye ulaştırılmak üzere hazırlanması.",
    label: "Sevkiyat",
    headline: "Kartlar yola çıkıyor",
    description: "Kontrolü tamamlanan kartları paketleyip gönderiyoruz.",
  },
  {
    slug: "urun-sonrasi-destek",
    title: "Ürün sonrası destek",
    summary: "Teslimat sonrasında devam eden iletişim ve destek.",
    label: "Destek",
    headline: "Teslimat sonrası yanınızdayız",
    description: "Kartla ilgili sorularınızı yanıtlıyor ve geri bildirimlerinizi değerlendiriyoruz.",
  },
] as const satisfies readonly ProcessStep[];

export type ProcessStepSlug = (typeof processSteps)[number]["slug"];
