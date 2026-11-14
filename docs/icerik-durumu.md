# İçerik durumu

Geliştirici dokümanıdır; ziyaretçi arayüzünde gösterilmez. Son güncelleme: BLOK 09 (2026-11-14).

İçerik tek kaynaklardan yönetilir. Firma bilgisi bileşenlere doğrudan yazılmaz.

| Veri | Dosya | Durum |
|---|---|---|
| Süreç adımları | `content/process.ts` | Gerçek (SONEF'in bildirdiği adımlar) |
| Firma tanıtımı (Biz Kimiz) | `content/company.ts` | Gerçek (Blok 05, 2026-11-13): kuruluş 2026, İstanbul, ekip, çalışma alanları. `approach` maddeleri hâlâ taslak |
| Misyon, vizyon ve çalışma ilkeleri | `content/vision-mission.ts` | Gerçek (Blok 06, 2026-11-13; metinleri SONEF Teknoloji verdi) |
| Hizmetler | `content/services.ts` | Taslak (`status: "draft"`) |
| Ürünler | `content/products.ts` | Eksik (boş liste) |
| Referanslar ve iş birlikleri | `content/references.ts` | Gerçek (Blok 07, 2026-11-13): Panotim Otomasyon Sistemleri, Fikir ve Danışma Ortaklığı; proje ayrıntısı bilerek yok |
| İletişim bilgileri | `content/contact.ts` | Gerçek (Blok 08, 2026-11-14, `status: "verified"`): adres, e-posta, Akın Baş ve Mustafa Taşdemir telefonları, WhatsApp (Akın Baş), Instagram, çalışma saatleri, harita bağlantısı. Facebook ve TikTok bekleniyor |
| İletişim mesaj formu | — | **Sonraki aşama.** Blok 08 iletişim akışını telefon, WhatsApp, e-posta ve Instagram üzerinden kurdu; form ve gönderim altyapısı ayrı bir blokta eklenecek |
| Alan adı | `.env` → `NEXT_PUBLIC_SITE_URL` | `https://sonefteknoloji.com.tr` (kullanıcı verdi; www'siz https varsayıldı) |

`ContentStatus` tipi: `content/status.ts`.

## Kullanıcıdan gelen gerçek bilgiler

- Marka adı: SONEF.
- Marka renkleri: lacivert `#22396F`, krem `#FCF1D0`.
- Site arayüz paleti (Blok 02D, kullanıcı tarafından verildi): `#1B365D` ana koyu lacivert, `#005A9C` marka mavisi, `#60C1E5` açık mavi vurgu, `#A0E0EF` açık ana yüzey. Kullanıcı isteğiyle sonradan: koyu yüzeylerde metin beyaz `#FFFFFF` / krem `#FCF1D0`; kapanış, sayfa girişi ve CTA panellerinin zemini `#005A9C` yerine çelik mavisi `#2F5480`. Roller `app/globals.css` içindedir.
- Logo: `public/brand/SONEF_Logo_Transparan_300ppi.png`.
- SONEF'in yaptığı işler:
  - Müşteriyle iletişim ve ihtiyacın anlaşılması.
  - Fikrin projeye dönüştürülmesi veya hazır projenin hayata geçirilmesi.
  - PCB ve komponent tedariği.
  - Dizgi işlemleri.
  - Fırınlama.
  - Kontrol ve test.
  - Paketleme ve gönderim.
  - Ürün sonrası destek.
- Biz Kimiz başlangıç metni: SONEF verdi. `content/company.ts` içinde paragraflara bölündü.
- Ana sayfadaki 3D model, gerçek bir ESP32 geliştirme kartının CAD verisidir.
  - Süreci anlatmak için kullanılır.
  - SONEF ürünü değildir ve müşteri projesi değildir.

## Hazırlanan metin taslakları (firma sahibinin onayını bekliyor)

| Metin | Dosya | Not |
|---|---|---|
| Biz Kimiz bölüm başlığı ve dört yaklaşım maddesi | `content/company.ts` | Bilinen süreçlerden yazıldı |
| Hizmet açıklamaları | `content/services.ts` | Bilinen süreçlerden yazıldı. Her hizmet için: kart özeti, "ne zaman" metni, kapsam, akış, ön görüşme listesi |
| Sayfa giriş metinleri ve meta açıklamaları | `app/**/page.tsx` | |
| İletişim sayfası hazırlık listeleri | `app/iletisim/page.tsx` | |

Taslak metinlerde bilerek kullanılmayanlar:

- Kuruluş yılı, çalışan sayısı ve kapasite.
- Sertifika ve kalite standardı.
- Teslim süresi, minimum adet ve fiyat.
- Teknik üretim sınırları: paket ölçüleri, katman sayısı, malzeme, yüzey kaplaması, tolerans.
- Makine modeli ve dizgi hızı.
- Yetkili distribütörlük ve stok iddiası.
- "Lider", "kusursuz" veya "%100" gibi ifadeler.
- SONEF'in kendi PCB üretim tesisi olduğu varsayımı.

## Eksik alanlar

| Alan | Gelince güncellenecek yer | Etkilenen sayfalar |
|---|---|---|
| Facebook ve TikTok profil bağlantıları | `content/contact.ts` → `contactInfo.social` (platform, label, handle, url) | `/iletisim` kanal kartı, footer ve Organization `sameAs` kendiliğinden gösterir |
| İletişim mesaj formu ve gönderim yöntemi | Sonraki aşama (Blok 08 kapsamı dışında); form şu an yok | `/iletisim` |
| Ürün listesi: ad, kısa tanım, kategori, gerçek görsel, onaylı özellikler | `content/products.ts` | `/urunlerimiz` katalog ızgarasını kendiliğinden gösterir |
| Yeni referans veya iş birliği: doğrulanmış ad, logo (`public/references/<kurulus>/`), iş birliği türü, resmî site | `content/references.ts` (`publicationApproved: true`) | `/referanslar-ve-musterilerimiz` |
| Kuruluş yılı, ekip ve kapasite bilgisi (paylaşılmak istenirse) | `content/company.ts` | `/biz-kimiz` |
| Sertifika ve kalite bilgisi (varsa) | Yeni alan gerekir | `/biz-kimiz`, hizmet sayfaları |
| Hizmetlere ait teknik sınırlar (paylaşılmak istenirse) | `content/services.ts` | `/hizmetler/*` |
| Gerçek alan adı | `NEXT_PUBLIC_SITE_URL` | Canonical, Open Graph URL'leri ve `sitemap.xml` kendiliğinden oluşur |
| Firma tanıtımı ve hizmet metinlerinin onayı | `content/company.ts`, `content/services.ts` | `/biz-kimiz`, `/hizmetler`, `/hizmetler/*` |

## Bölüm görünürlüğü

- Ayar: `lib/site.ts` → `siteSections.products` (2026-11-13 itibarıyla `false`, geçici).
- Kapalıyken: Ürünlerimiz bağlantısı menü, mobil menü ve footer'da yoktur; sitemap'e girmez; `/urunlerimiz` 404 döner.
- `content/products.ts`, `components/catalog/*` ve `app/urunlerimiz/*` yerinde durur. Açmak için değeri `true` yapıp yeniden derleyin.

## İndeksleme ve SEO (Blok 09, 2026-11-14)

- Tek ortak ayar: `lib/site.ts` → `indexingAllowed`. Açık olması için üçü birden gerekir: `SITE_ENV=production`, Netlify'da `CONTEXT=production` (CONTEXT yoksa yerel/başka ortam sayılır), geçerli `https://` `NEXT_PUBLIC_SITE_URL`.
- Karar derleme sırasında okunur (sayfalar, robots.txt ve sitemap statik). Kapalıyken: her sayfada `<meta name="robots" content="noindex, nofollow">`, her yanıtta `X-Robots-Tag: noindex, nofollow` (next.config.ts), robots.txt taramaya izin verir ama sitemap satırı yazmaz, sitemap boş.
- Canonical, `og:url`, sitemap ve JSON-LD adresleri tek fonksiyondan: `lib/metadata.ts` → `absoluteUrl` (ana sayfa sondaki `/` olmadan).
- Marka adı `siteName = "SONEF Teknoloji"`; kısa ad `siteShortName = "SONEF"` (logo, Organization `alternateName`).
- Yazım: görünen metinde "Ar‑Ge" bölünmez tireyle (U+2011, satır sonunda ayrılmaz); metadata ve JSON-LD'de normal tire.
- Kapsam: elektronik kontrol yalnızca müşteri onayıyla; kozmetik kontrol ekipçe. Süreç adımı kimliği `kontrol-ve-test` (animasyon eşleşmesi) değişmedi, görünen adı "Kontrol".

## SEO (2026-11-13)

- Paylaşım görseli: `app/opengraph-image.tsx` (logo + "Fikirden Üretime"); bütün sayfalara `lib/metadata.ts` üzerinden bağlanır.
- Yapılandırılmış veri: `lib/structured-data.ts` → Organization + WebSite (her sayfa), BreadcrumbList (breadcrumb'ı olan sayfalar). Yalnızca `NEXT_PUBLIC_SITE_URL` tanımlıyken üretilir.
- Alan adı 2026-11-13'te `.env` içinde tanımlandı. Tanımsız bir ortamda canonical, sitemap girişleri, `og:url` ve JSON-LD yoktur; `og:image` adresi `http://localhost:3000` ile başlar. Yayından önce alan adı tanımlanmalıdır.

## Boş veri davranışı

- **Ürünler boşken:**
  - Ürün kartı, ızgara veya örnek gösterilmez.
  - Sayfa kısa bir giriş, hizmet bağlantıları ve iletişim CTA'sı gösterir.
- **Referanslar boşken:**
  - Logo kutusu, müşteri adı, yorum veya puan gösterilmez.
  - Sayfa yalnızca girişi ve iletişim çağrısını gösterir (Blok 07'den beri yaklaşım bölümü yok).
- **İletişim (Blok 08'den beri dolu):**
  - Görünen telefon biçimi (`display`) ile `tel:`/WhatsApp değeri (`international`) ayrı tutulur.
  - `mailtoHref`, `telHref`, `whatsappHref`, `httpsUrl` geçersiz değerleri bağlantıya çevirmez:
    - e-posta biçim dışıysa,
    - telefon `+` ile başlayan uluslararası biçimde değilse,
    - harita veya sosyal medya bağlantısı `https` değilse.

## Genel çağrı bantları (Blok 08)

- Sayfa sonundaki "Projenizi konuşalım" türü genel kapanış bantları bütün sayfalardan kaldırıldı (ana sayfa kapanışı dahil).
- `components/ui/cta-band.*` artık hiçbir sayfada kullanılmıyor; dosya silinmedi. `components/ui/arrow-link.*` de (yalnızca Vizyon–Misyon kapanışı kullanıyordu) şu an kullanılmıyor.
- Son bölüm ile footer arası: `app/globals.css` → `:where(main > :last-child…)` kuralı.

## Yayın öncesi ayrı işler (bu blokta yapılmadı)

- Gerçek alan adı. Domain'e bağlı canonical, sitemap ve sosyal paylaşım URL'leri.
- İletişim mesaj formu ve gönderim altyapısı (sonraki aşama). Form, gerçek bir altyapıya bağlanmadan eklenmemeli.
- Product, Review, AggregateRating veya LocalBusiness yapılandırılmış verisi:
  - Gerçek ve görünür veri olmadan eklenmemeli.
  - LocalBusiness için adres ve telefon gerekir.

## Arka plan fotoğrafları

Hepsi dekoratiftir; SONEF'in kendi tesisini göstermez. Gerçek üretim fotoğrafları gelince değiştirilmelidir.

| Dosya (`public/backgrounds/`) | Kullanıldığı yer | Kaynak |
|---|---|---|
| `hizmetler-hd.webp` | `/hizmetler` girişi (net mod) | Unsplash, Louis Reed (@_louisreed), foto `wSTCaQpiLtc`, Unsplash Lisansı |
| `biz-kimiz-hd.webp` | `/biz-kimiz` girişi (net mod) | Unsplash, Umberto (@umby), foto `jXd2FSvcRr8`, Unsplash Lisansı |
| `vizyon-misyon-hd.webp` | `/vizyon-ve-misyon` girişi (net mod) | Unsplash, Vishnu Mohanan (@vishnumaiea), foto `pfR18JNEMv8`, Unsplash Lisansı |
| `ana-sayfa-hd.webp` | Ana sayfa hero bandı (net mod) | Unsplash, Anne Nygård (@polarmermaid), foto `vILVKROnyGA`, Unsplash Lisansı |
| `kapanis-hd.webp` | Ana sayfa kapanış bandı + bütün iç sayfaların footer üstü paneli (net mod) | Müşterinin verdiği `footer üstü banner.png`; Real-ESRGAN ile 3840 px |
| `smd-dizgi-hd`, `pcb-tedarigi-hd`, `komponent-tedarigi-hd`, `iletisim-hd`, `referanslar-hd` (.webp) | Hizmet detayları, iletişim, referanslar girişleri (silik mod) | Müşterinin verdiği `website pngs/` dosyaları; Real-ESRGAN ile 3840 px'e büyütüldü |

- Unsplash Lisansı ticari kullanıma izin verir, atıf zorunlu değildir; kayıt için burada tutulur.
- `website pngs/` görselleri yapay zekâ/stok üretimi görünüyor (birinde "NeoDen" makine markası var).
## Sayfa içi fotoğraf alanları (`public/media/`, 2400×1800, 4:3)

Temsilî stok fotoğraflardır (Unsplash Lisansı). Özellikle **Biz Kimiz "Üretim alanı"** SONEF'in kendi alanı değildir; gerçek fotoğraf gelince `content/company.ts` içindeki `heroMedia.image` değiştirilmelidir.

| Dosya | Alan | Kaynak |
|---|---|---|
| `uretim-alani.webp` | Biz Kimiz giriş | Clint Patterson (@cbpsc1), `lPcXuJyoIjU` |
| `smd-yerlestirme.webp` | SMD Dizgi giriş | Vishnu Mohanan (@vishnumaiea), `zs4gtT8thO0` |
| `smd-kart-detay.webp` | SMD Dizgi kart detayı | Akshat Sharma (@asphotographypics), `mrTVz_fosMY` |
| `ciplak-pcb.webp` | PCB Tedariği giriş | Vishnu Mohanan (@vishnumaiea), `vE6WEdZA6Vg` |
| `pcb-detay.webp` | PCB Tedariği detay | Mathew Schwartz (@cadop), `iGheu30xAi8` |
| `komponent.webp` | Komponent Tedariği giriş | Vishnu Mohanan (@vishnumaiea), `hus1z0tYELg` |
| `parca-detay.webp` | Komponent Tedariği parça detayı | Syed kumail Haider (@kumail_art), `-A8NZuHR-Co` |