# SONEF — Gerçek CAD modeli ve Blok 01 başlangıcı

Bu paket, sağladığın ESP32 STEP geometrisinden türetilmiştir. Yapay görsel veya yeniden modellenmiş temsili komponent içermez.

## VS Code'da kullanım

1. Bilgisayarında `sonef-web` adlı bir proje klasörü oluştur ve paketi buraya çıkar.
2. Klasörü VS Code'da aç.
3. `01_Claude_Proje_Baslangic_Promptu.md` içeriğini Claude'a ver.
4. Claude ilk bloğu tamamladığında raporu ve mümkünse ana sayfa ekran görüntülerini paylaş. İkinci blokta scroll yolculuğuna geçilecek.

Paketteki `public` dizini gelecekteki Next.js projesinin `public` dizinidir. Yeni proje kurulumu mevcut bu dosyaları korumalıdır. Bu paket henüz çalışan bir Next.js uygulaması değildir; uygulamayı kuracak ilk görev ayrıca verilmiştir.

## Dosyalar

| Yol | Kullanım |
|---|---|
| `public/models/esp32/esp32-38pines.glb` | Web için Meshopt ile sıkıştırılmış model; decoder gerekir. |
| `public/models/esp32/esp32-manifest.json` | 32 grubun isimleri, konumları, kaynak gövde eşleştirmeleri ve geçici hareket ofsetleri. |
| `public/models/esp32/esp32-poster.webp` | Gerçek CAD modelinden alınmış transparan yükleme/fallback görseli. |
| `reference/esp32-38pines-uncompressed.glb` | Blender'da doğrudan içe aktarmak için sıkıştırılmamış model. |
| `reference/SONEF_CAD_Onizleme.png` | Birleşmiş ve dağılmış konumların CAD geometrisinden alınan kontrol görüntüsü. |
| `public/brand/SONEF_Logo_Transparan_300ppi.png` | Sağladığın mevcut transparan SONEF logosu. |
| `checks` | Biçim, kaynak eşleştirmesi ve sıkıştırma kontrol sonuçları. |

## Hazırlığın durumu

- Kaynakta 879 katı gövde vardır. Bunlar 879 elektronik komponent anlamına gelmez.
- Kaynak isimleri korunmuş 29 komponent, iki pin header grubu ve bir sabit PCB grubu oluşturulmuştur.
- Gövde ve konumlar gerçek STEP geometrisinden gelir. Dönüştürme, CAD yüzeylerini üçgenlere böler; kullanılan doğrusal tessellation ayarı 0,035 mm'dir.
- Web sıkıştırmasında geometri sadeleştirme veya koordinat quantization uygulanmamıştır. Çözülmüş vertex değerleri ve grup konumları referans modelle karşılaştırılmıştır.
- Dosyanın AP203 kaynağında renk bilgisi yoktur. Eklenen malzemeler ilk ayardır; nihai fotogerçekçi görünüm için gerçek kart referanslarıyla gözden geçirilmelidir.
- Kaynak isimleri bilinmeyen kart detaylarının PCB/pin header sınıflandırması geometrik kurallarla yapılmıştır ve kontrol görüntüsüyle incelenmelidir. Metal bacaklar, gövde ve yazı ayrıntıları fiziksel komponent gruplarından bağımsız uçurulmamalıdır.
- Manifest'teki dağılma ofsetleri kontrol içindir; müşteri yolculuğunun nihai animasyonu henüz yazılmamıştır.
- Model yaklaşık 508 bin üçgen içerir. Bu, yüksek ayrıntılı hazırlık modelidir; gerçek mobil performansı tarayıcıda ölçülmeli, gerekirse ayrıca CAD'den türetilmiş mobil detay seviyesi hazırlanmalıdır.

## Blender'da inceleme

`File > Import > glTF 2.0` üzerinden `reference/esp32-38pines-uncompressed.glb` dosyasını aç. Outliner'da 32 grup ve `SONEF_ESP32_ROOT` kökü görünür. Model gerçek ölçeğinde küçük gelebilir; görünümü modele çerçevele. Her grubu ayrı taşıyabilirsin; asıl dosyayı birleşmiş hâliyle sakla.

## Projenin blok sırası

1. Proje temeli, SEO yapısı, altı sayfanın iskeleti ve gerçek modelin ilk ekrana alınması.
2. Gerçek kart referanslarıyla malzeme/kamera kontrolü ve kaydırmayla parça birleştirme yolculuğu.
3. Ürün, kurumsal, referans ve iletişim sayfalarının gerçek içerikle tamamlanması; hizmet SEO sayfaları.
4. Mobil performans, erişilebilirlik ve gerçek alan adıyla yayın öncesi kontroller.
