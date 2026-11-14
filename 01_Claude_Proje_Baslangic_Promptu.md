# SONEF — Blok 01: Proje temeli ve gerçek CAD modelinin ilk ekrana alınması

Aşağıdaki metni VS Code'da proje klasörünü açtıktan sonra Claude'a tek mesaj olarak ver.

---

SONEF için React ve TypeScript ile çok sayfalı, Türkçe bir kurumsal web sitesi geliştiriyoruz. SEO, erişilebilirlik ve mobil performans baştan tasarımın parçası olacak. Projeyi blok blok ilerleteceğiz. Bu görev yalnızca BLOK 01 kapsamındadır: proje temeli, sayfa yapısı, marka görünümü ve sağlanan gerçek CAD modelinin ilk ekranda çalışması.

Önce açık çalışma klasörünü incele. Mevcut dosyaları, package.json, kilit dosyalarını ve varsa AGENTS.md talimatlarını oku. Mevcut bir proje varsa uygun biçimde devam et; kaynak dosyalarının üzerine körlemesine yeni proje kurma. Boş klasörse güncel kararlı Next.js App Router, React ve TypeScript ile kur. VS Code'da yerel geliştirme yapıyoruz; bu blokta yayınlama veya harici hesap işlemi yok.

## 1. İş ve kapsam

SONEF; müşterinin fikrinin projeye dönüştürülmesi veya hazır projesinin hayata geçirilmesi, PCB ve komponent tedariği, dizgi, fırınlama, kontrol/test, gönderim ve ürün sonrası destek süreçlerini sunuyor. Kullanıcının bildirmediği üretim kapasitesi, sertifika, müşteri, referans, test cihazı, adres, telefon, garanti koşulu, süre veya sayısal başarı iddiası üretme.

Sitenin sayfaları:

- `/` — Ana Sayfa
- `/urunlerimiz` — Ürünlerimiz
- `/biz-kimiz` — Biz Kimiz
- `/vizyon-ve-misyon` — Vizyon ve Misyon
- `/referanslar-ve-musterilerimiz` — Referanslar ve Müşterilerimiz
- `/iletisim` — İletişim

Bu blokta ana sayfanın ilk ekranını, ortak navigasyon/footer'ı ve diğer sayfaların temiz temel yapısını kur. Diğer sayfalarda kısa, gerçek bilgiyle sınırlı giriş metinleri yeterli. Gerçek ürün ve referans listeleri henüz sağlanmadı; bunların yerine sahte kartlar, şirket logoları veya müşteri yorumları doldurma. Hizmetler için ayrı SEO sayfaları ileride eklenecek şekilde yapıyı genişletilebilir tut.

## 2. Görsel yön

- Logo: `public/brand/SONEF_Logo_Transparan_300ppi.png`.
- Ana lacivert: `#22396F`.
- Krem: `#FCF1D0`.
- Ana sahnede lacivert zemin ve krem tipografi kullan. PCB ve komponentlerin renklerini marka rengine boyama.
- Başlık: `Fikirden Üretime.`
- Destek metni: `Fikrinizi projeye, projenizi üretime taşıyoruz. PCB ve komponent tedariğinden dizgi, kontrol ve ürün sonrası desteğe kadar yanınızdayız.`
- İlk CTA: `Projenizi Konuşalım` → `/iletisim`.
- İkinci CTA: `Süreci Keşfedin` → ana sayfanın süreç bölümüne normal bağlantı.
- Tasarım sade, teknik ve kurumsal olsun. Büyük ve okunur başlıklar, kontrollü boşluklar, düzenli hiyerarşi ve gerçek ürünün öne çıktığı kompozisyon kur.
- Referanslar: `https://www.der-baukasten.com/` ve `https://animorio.com/en/animations/exploded-view-watch-on-scroll/`. Bunlar parça hareketi ve ürün anlatımı referansıdır; renkleri, figürleri ve arayüzlerini kopyalama.

İlk ekranda masaüstünde metin ve PCB dengeli konumlansın; mobilde başlık, CTA ve model ekran dışına taşmadan okunabilsin. Dev bir yükleme ekranıyla içeriğin tamamını bekletme. Font için ilk blokta Türkçe karakterleri destekleyen iyi bir sistem fontu kullanılabilir; gereksiz bir font indirmesine build'i bağımlı kılma.

## 3. Sağlanan model: kaynak gerçek CAD geometrisidir

Önce `public/models/esp32/esp32-manifest.json` dosyasını oku.

- Web modeli: `public/models/esp32/esp32-38pines.glb`.
- Aynı gerçek modelden alınmış transparan poster: `public/models/esp32/esp32-poster.webp`. Yükleme sırasında, WebGL hatasında veya uygun mobil fallback'te bunu kullanabilirsin.
- Dosya `EXT_meshopt_compression` kullanır; uygun Meshopt decoder gerekir.
- Referans model: `reference/esp32-38pines-uncompressed.glb`. Bu sıkıştırılmamış dosya Blender'da inceleme ve düzenleme içindir; web ziyaretçisine varsayılan olarak bunu indirtme.
- Kaynak 879 CAD katı gövdesi içerir; bunlar 32 sahne grubuna dönüştürüldü.
- Bu sayılar 879 elektronik komponent anlamına gelmez. Bir komponentin metal bacakları, gövdesi ve yazıları aynı grupta tutulur.
- `PCB_BASE` sabittir; iki pin header grubu ve kaynak isimleri korunmuş 29 komponent grubu vardır.
- Birimler metredir. PCB yaklaşık 55 × 28 × 1,5 mm'dir. `recommendedPresentationScale: 70` yalnızca sunum ölçeği önerisidir; oranları koruyan tek bir üst grup ölçeği uygulanabilir.
- Her grup için `assembledPositionM` ve inceleme amaçlı `explodeOffsetM` vardır. Bunlar grupların parent uzayındaki değerleridir; model ölçeğiyle karıştırma.
- Grupların isimlerini koru; bütün modeli tek mesh'e birleştirme. Çocuk mesh'lerin geometrisini veya yerleşimlerini yeniden türetme.
- Malzemeler ilk ayardır ve gerçek kart referansıyla sonraki blokta gözden geçirilecektir. Modeli nihai fotogerçekçi ürün görseli olarak kabul etme. Malzemeleri rastgele değiştirme veya emissive parıltılar ekleme.
- Komponentleri parametrik kutu, silindir veya AI görseliyle ikame etme. Sağlanan gerçek model kullanılacak.

Three.js ve React Three Fiber kullanabilirsin. Kurulan React major sürümüyle Fiber sürümünün uyumunu doğrula; alpha/canary paket seçme. GLTFLoader'ın Meshopt decoder'ını gerçekten bağla. Modelin tarayıcıda açıldığını görmeden bu adımı tamamlandı sayma. Modeli klonlaman gerekirse `assembledPositionM` değerlerini kullan; her render veya frame'de yeni clone/material oluşturma.

Bu blokta model birleşmiş konumda gösterilsin. Işık ve kamera modeli anlaşılır kılmalı; highlight'lar metal kapağın yazılarını tamamen patlatmamalı. Kamera için yaklaşık bir başlangıç: Y yukarı, karta üstten eğik bakış. Modelin geometrisini eğip bükerek kadraja sığdırma; kamera ve kapsayıcıyla çöz.

WebGL yüklemesi ve etkileşimli bileşenler istemcide, metin ve sayfa yapısı sunucuda kalsın. Client-only 3D yükleme sınırını Next.js'in kurulu sürümünün kurallarına uygun kur. Canvas yüklenirken gerçek CAD posterini göster; başlık, açıklama, CTA ve navigasyon erişilebilir olsun. Hata durumunda poster, normal içerik ve iletişim bağlantısı çalışsın; teknik stack trace'i ziyaretçiye gösterme.

## 4. Sonraki bloklar için süreç verisi

Ana sayfanın aşağıdaki sırasını tek bir tipli içerik kaynağında tanımla:

1. Tanışma ve projelendirme — fikirden proje veya hazır projenin değerlendirilmesi.
2. PCB ve komponent tedariği.
3. Dizgi işlemleri — gerçek SMD gruplarının sırayla yerlerine oturması.
4. Fırınlama — dizgiden sonraki lehimleme süreci.
5. Kontrol ve test — yalnızca SONEF'in gerçek uyguladığı kontrollerle detaylandırılacak.
6. Paketleme ve gönderim.
7. Ürün sonrası destek.

Bu blokta süreç başlıkları ve kısa açıklamaları okunur, semantik HTML bölümleriyle görünsün. Tüm scroll animasyonunu henüz kurma. Yedi aşama gerçek DOM içeriği olarak bulunmalı; metinleri canvas içine resim olarak çizme.

Sonraki blokta kaydırma konumu kontrollü, geri alınabilir 3D timeline kurulacak. Bağımsız otomatik video oynatma bu etkileşimin yerine geçmeyecek. Pin header grupları ayrı tutulmalı; gerçek montaj sırası netleşmeden bunları SMD/reflow işlemiyle aynı teknik aşama gibi anlatma.

## 5. Teknik ve SEO temeli

- TypeScript strict kullan; gelişigüzel `any` veya `@ts-ignore` ile hataları kapatma.
- Next.js sayfalarının tamamını `use client` yapma. 3D/etkileşim sınırını dar tut.
- Semantik `header`, `nav`, `main`, `section`, `footer`, sayfa başına anlaşılır tek H1, tutarlı başlık sırası kullan.
- Her sayfaya benzersiz, doğal Türkçe title/description tanımla. Hedef kelimeleri yapay biçimde tekrar etme.
- Gerçek alan adı henüz verilmedi. Domain'i config/env üzerinden tanımlanabilir yap; uydurma URL, adres veya telefonla canonical ve Organization/LocalBusiness verisi üretme. Üretim sitemap/canonical ayarını gerçek domain sağlanmadan tamamlandı olarak raporlama.
- Navigasyon normal taranabilir bağlantılardan oluşsun. Klavyeyle kullanılabilen mobil menü, görünür focus, doğru buton etiketleri ve yeterli kontrast olsun.
- Logo oranını koru; logoyu yeniden çizme. Dekoratif canvas'ın yanında içeriği metinle açıkla.
- `prefers-reduced-motion`, WebGL hatası ve düşük güçlü mobil cihazlar için statik sunum/fallback sınırlarını kur. Süreç metni ve teklif bağlantısı her durumda erişilebilir kalsın.
- Model yüklemesinin sayfa metninin görünmesini engellemesini önle. İlk blokta yeni bir performans skoru veya FPS değeri uydurma; ölçmediğin değeri raporlama.
- Gizli anahtarları istemciye koyma. Gereksiz backend, veritabanı, auth, yönetim paneli veya ödeme sistemi ekleme.

## 6. Tamamlanma ve doğrulama

Blok tamamlanmadan şu sonuçları gerçekten kontrol et:

1. TypeScript denetimi, ESLint ve production build geçiyor.
2. Altı route açılıyor; navigasyon/CTA doğru hedeflere gidiyor.
3. Sağlanan sıkıştırılmış GLB, bağlı Meshopt decoder ile yükleniyor. Konsolda model yükleme veya hydration hatası yok.
4. 375, 768 ve 1440 piksel genişliklerde yatay taşma yok; başlık, CTA ve model görünür.
5. Grupların isimleri korunmuş, model birleşmiş referans görünümüyle aynı yerleşimde.
6. Sahte ürün, müşteri, iletişim bilgisi veya doğrulanmamış firma iddiası eklenmemiş.

Tarayıcıya erişimin varsa ekran görüntüleriyle kontrol et. Erişimin yoksa bunu açıkça yaz; görsel inceleme yapmış gibi davranma. Düşük etkili düzen değişiklikleri için uygulamayı tekrar eden yapay testler yazma; mevcut kontrolleri ve anlamlı çalışma doğrulamasını kullan.

Bitince kısa bir rapor ver: kurulan yapı ve bağımlılıklar, değişen ana dosyalar, çalıştırılan kontroller ve gerçek sonuçları, model yükleme durumu, hâlâ kullanıcıdan gereken gerçek şirket bilgileri. Yalnızca BLOK 01'i tamamla; sonraki bloğa kendiliğinden geçme.

Güncel bir API davranışından emin değilsen kurulu paketin kaynak/typings'ini ve resmi dokümanını kontrol et:

- `https://nextjs.org/docs/app`
- `https://r3f.docs.pmnd.rs/getting-started/introduction`
- `https://threejs.org/docs/`

Şimdi çalışma klasörünü inceleyerek BLOK 01'i uygula.
