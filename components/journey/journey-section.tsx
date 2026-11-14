import Image from "next/image";
import Link from "next/link";
import { HeroModel } from "@/components/hero-model/hero-model";
import { BackdropImage } from "@/components/ui/backdrop-image";
import { ButtonLink } from "@/components/ui/button-link";
import { processSteps } from "@/content/process";
import { serviceHref, services } from "@/content/services";
import { stageSide } from "@/lib/journey/motion-plan";
import { journeySceneConfig } from "@/lib/journey/scene-config";
import { esp32HeroModel } from "@/lib/model/esp32";
import { contactHref, processSectionId } from "@/lib/site";
import { JourneyDriver } from "./journey-driver";
import { JourneyIndicator } from "./journey-indicator";
import styles from "./journey-section.module.css";

/** Süreç adımından hizmet sayfasına ölçülü bağlantı (yalnızca hizmetin `homeStep` adımında). */
function serviceLinks(step: string) {
  const linked = services.filter((service) => service.homeStep === step);
  if (linked.length === 0) return null;
  return (
    <ul className={styles.stepLinks}>
      {linked.map((service) => (
        <li key={service.slug}>
          <Link href={serviceHref(service.slug)} className={styles.stepLink}>
            {service.homeLinkLabel}
            <span className={styles.stepLinkArrow} aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const stepTotal = String(processSteps.length).padStart(2, "0");

/** Hero bandının net fotoğrafı (lisans/kaynak: docs/icerik-durumu.md). */
const HERO_PHOTO = "/backgrounds/ana-sayfa-hd.webp";

/**
 * Ana sayfanın kaydırmayla ilerleyen üretim yolculuğu.
 * Bütün metinler sunucuda çizilir; kaydırma sürücüsü, 3D sahne ve aşama
 * göstergesi dar istemci bileşenleridir. Sahnenin anlattığı her şey
 * süreç metninde de bulunur. Görsel sağ–sol yerleşim değişse de DOM okuma sırası
 * üretim sürecinin sırasıdır.
 */
export function JourneySection() {
  const { modelUrl, posters, presentationScale, groups } = esp32HeroModel;

  return (
    <div className={styles.journey} data-journey data-poster="exploded" data-tone="light">
      <div className={`container ${styles.layout}`}>
        {/* Hero zemini (lacivert #1B365D). Yan yana yerleşimde giriş metni sahnenin üstünde (z-index)
            durduğu için zemin ayrı bir öğedir; böylece sahne zeminin üstünde, metnin altında kalır. */}
        {/* Hero fotoğrafı iki yerde: yan yana yerleşimde bant öğesinde (sahnenin altında, bütün
            genişlikte), dar ekranda girişin içinde. İki kopya aynı adres ve `sizes` değerini
            kullandığı için tarayıcı fotoğrafı bir kez indirir; hero'nun en büyük görseli olduğundan önceliklidir. */}
        <div className={styles.heroBand} data-tone="dark" aria-hidden="true">
          <BackdropImage
            src={HERO_PHOTO}
            priority
            variant="clear"
            className={`${styles.bleed} ${styles.heroBackdrop} ${styles.splitOnly}`}
          />
        </div>
        <section className={styles.intro} aria-labelledby="hero-baslik" data-tone="dark">
          <BackdropImage
            src={HERO_PHOTO}
            priority
            variant="clear"
            className={`${styles.bleed} ${styles.heroBackdrop} ${styles.stackedOnly}`}
          />
          <div className={styles.introCard}>
            <h1 id="hero-baslik" className={styles.title}>
              Fikirden Üretime.
            </h1>
            <p className={styles.lead}>
              Fikrinizi projeye, projenizi üretime taşıyoruz. PCB ve komponent tedarikinden dizgi,
              kontrol ve ürün sonrası desteğe kadar yanınızdayız.
            </p>
            <div className={styles.actions}>
              <ButtonLink href={contactHref} variant="primary">
                Projenizi Konuşalım
              </ButtonLink>
              <ButtonLink href={`#${processSectionId}`} variant="secondary">
                Süreci Keşfedin
              </ButtonLink>
            </div>
          </div>
        </section>

        <div className={styles.stageColumn} data-journey-stage>
          <figure className={styles.stage}>
            {/* Kart şerit konumuna göre iki yerleşim alanı arasında taşınır (bkz. scene-config `lane`). */}
            <div className={styles.canvasArea} data-canvas-area>
              {/* PCB yolu: kartın yolculuk boyunca izlediği rota, iki paralel iz (diferansiyel çift) olarak.
                  Geometri ve konum journey-driver.tsx'ten gelir; yalnızca kaydırmalı modda görünür. */}
              <svg className={styles.track} data-journey-track aria-hidden="true" focusable="false">
                <defs>
                  <mask id="journey-track-rails" maskUnits="userSpaceOnUse" data-track-area>
                    <path className={styles.railOuter} data-track-path />
                    <path className={styles.railInner} data-track-path />
                  </mask>
                  <clipPath id="journey-track-traveled" clipPathUnits="userSpaceOnUse">
                    <rect data-track-traveled />
                  </clipPath>
                </defs>
                <g data-track-shift>
                  <rect className={styles.railsAhead} mask="url(#journey-track-rails)" data-track-area />
                  <rect
                    className={styles.railsTraveled}
                    mask="url(#journey-track-rails)"
                    clipPath="url(#journey-track-traveled)"
                    data-track-area
                  />
                  <circle className={styles.trackPad} r="9" data-track-start />
                  <circle className={styles.trackPad} r="9" data-track-end />
                </g>
              </svg>
              <span className={styles.slot} data-model-slot="left" aria-hidden="true" />
              <span className={styles.slot} data-model-slot="right" aria-hidden="true" />
              <div className={styles.posterFrame}>
                <Image
                  src={posters.exploded}
                  alt="38 pinli ESP32 geliştirme kartının gerçek CAD modelinden alınmış görünümü"
                  width={1000}
                  height={1000}
                  preload
                  sizes="(min-width: 64rem) 50vw, 100vw"
                  className={`${styles.poster} ${styles.posterExploded}`}
                />
                <Image
                  src={posters.assembled}
                  alt=""
                  width={1000}
                  height={1000}
                  sizes="(min-width: 64rem) 50vw, 100vw"
                  className={`${styles.poster} ${styles.posterAssembled}`}
                />
              </div>
              <HeroModel modelUrl={modelUrl} presentationScale={presentationScale} groups={groups} />
              <JourneyIndicator />
            </div>
          </figure>
        </div>

        <section id={processSectionId} className={styles.process} aria-labelledby="surec-baslik" data-ground-start data-hero-end>
          <div className={styles.processIntro}>
            <p className={`eyebrow ${styles.eyebrow}`}>Üretim yolculuğu</p>
            <h2 id="surec-baslik" className={styles.processTitle}>
              Fikrinizden teslimat sonrasına kadar her adımda
            </h2>
            <p className={styles.processLead}>
              Fikrinizi projeye dönüştürmekten ya da hazır projenizi hayata geçirmekten başlayarak
              teslimat sonrasındaki desteğe kadar izlediğimiz adımlar.
            </p>
          </div>

          <ol className={styles.steps}>
            {processSteps.map((step, index) => (
              <li
                key={step.slug}
                id={step.slug}
                className={styles.step}
                data-journey-step
                // Masaüstünde metin dönüşümlü yerleşir: 1. adım sağda (kart solda), 2. adım solda…
                data-side={stageSide(index + 1) === 1 ? "left" : "right"}
                data-length={step.slug === journeySceneConfig.placement.stage ? "long" : undefined}
              >
                {/* Kartın bir taraftan diğerine geçtiği, metinsiz geçiş aralığı. */}
                <div className={styles.stepGap} data-journey-gap aria-hidden="true" />
                <article
                  className={styles.stepInner}
                  aria-labelledby={`${step.slug}-baslik`}
                  data-tone="card"
                >
                  <div className={styles.stepMeta}>
                    <p className={styles.number} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                      <span className={styles.numberTotal}> / {stepTotal}</span>
                    </p>
                    <p className={styles.stepLabel}>{step.label}</p>
                  </div>
                  <h3 id={`${step.slug}-baslik`} className={styles.stepTitle}>
                    {step.headline}
                  </h3>
                  <p className={styles.stepText}>{step.description}</p>
                  {serviceLinks(step.slug)}
                </article>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <JourneyDriver />
    </div>
  );
}
