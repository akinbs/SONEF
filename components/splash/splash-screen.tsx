"use client";

import { useLayoutEffect } from "react";
import styles from "./splash-screen.module.css";

const STORAGE_KEY = "sonef-splash-seen";
const SEEN_ATTRIBUTE = "data-splash-seen";

/** Süreler splash-screen.module.css ile aynı tutulmalıdır: 3 sn görünür + 0,5 sn solma. */
const TOTAL_MS = 3000 + 500;

/**
 * Sayfa ilk boyanmadan önce çalışır: bu oturumda açılış ekranı gösterildiyse `<html>` öğesini
 * işaretler, CSS de ekranı hiç çizmez (yenilemede yanıp sönme olmaz).
 */
const prePaintScript = `try{if(sessionStorage.getItem(${JSON.stringify(STORAGE_KEY)}))document.documentElement.setAttribute(${JSON.stringify(SEEN_ATTRIBUTE)},"")}catch(e){}`;

/*
 * Devre izleri (1000×1000 kare koordinat sistemi; ekranı `slice` ile kaplar, ortası her oranda
 * görünür). Yollar PCB yönlendirmesi gibi yalnızca dik ve 45° kırılır; ekranın kenarından gelip
 * logonun çevresindeki lehim pedlerinde biter. `d` + `delay` (sn): çizimin başlama anı.
 */
const traces = [
  { d: "M200 -20 V250 L380 430", delay: 0.05 },
  { d: "M330 -20 V310 L450 430", delay: 0.18 },
  { d: "M670 -20 V310 L550 430", delay: 0.12 },
  { d: "M800 -20 V250 L620 430", delay: 0.0 },
  { d: "M-20 330 H145 L290 475", delay: 0.22 },
  { d: "M-20 650 H145 L290 505", delay: 0.32 },
  { d: "M1020 330 H855 L710 475", delay: 0.28 },
  { d: "M1020 650 H855 L710 505", delay: 0.38 },
  { d: "M300 1020 V720 L360 660", delay: 0.45 },
  { d: "M700 1020 V720 L640 660", delay: 0.5 },
] as const;

/** İzlerin bittiği pedler (logoya bağlanan uçlar) ve alttaki iki via. */
const pads = [
  [380, 430], [450, 430], [550, 430], [620, 430],
  [290, 475], [290, 505], [710, 475], [710, 505],
] as const;
const vias = [
  [360, 660], [640, 660],
] as const;

/** Arka planda soluk, logoya bağlanmayan ikincil izler (kartın geri kalanı hissi). */
const faintTraces = [
  "M-20 160 H90 L170 80 V-20",
  "M1020 170 H900 L820 90 V-20",
  "M-20 820 H110 L190 900 V1020",
  "M1020 840 H880 L820 900 V1020",
] as const;

/**
 * Ana sayfa açılış ekranı (kodla çizilir, her çözünürlükte keskin):
 * devre izleri ekranın kenarından logonun lehim pedlerine yönlenir, izlerden kısa bir sinyal geçer,
 * logo soldan sağa açılır ve "Fikirden Üretime." gelir. 3 sn sonra ekran solarak ana sayfayı açar.
 *
 * - Zamanlama CSS animasyonudur; JavaScript yüklenmese de ekran 3 saniye sonra kapanır.
 * - Sayfa içeriği ekranın arkasında baştan çizilir (arama motorları ve 3D yüklemesi etkilenmez).
 * - Oturum başına bir kez gösterilir; site içinde ana sayfaya dönüldüğünde tekrarlanmaz.
 * - Dekoratiftir: ekran okuyucudan gizlidir, tıklamayı ve klavyeyi engellemez.
 * - Hareket azaltma tercihinde son kare doğrudan gösterilir.
 */
export function SplashScreen() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    // "Bu oturumda görüldü" kararını yalnızca boyama öncesi betik verir. Efekt depolamayı okumaz;
    // böylece efekt ikinci kez çalışsa da (StrictMode, yeniden bağlanma) ekran erken kapanmaz.
    if (root.hasAttribute(SEEN_ATTRIBUTE)) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Depolama kapalıysa ekran her açılışta gösterilir; işlev bozulmaz.
    }
    const timer = window.setTimeout(() => root.setAttribute(SEEN_ATTRIBUTE, ""), TOTAL_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
      <div className={styles.splash} aria-hidden="true" data-splash-screen>
        <svg className={styles.board} viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <g className={styles.faint}>
            {faintTraces.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>

          <g className={styles.traces}>
            {traces.map(({ d, delay }) => (
              <path key={d} d={d} pathLength={1} style={{ animationDelay: `${delay}s` }} />
            ))}
          </g>

          {/* İzin içinden bir kez geçen sinyal: yönlendirme tamamlandı. */}
          <g className={styles.signal}>
            {traces.map(({ d, delay }) => (
              <path key={d} d={d} pathLength={1} style={{ animationDelay: `${1.05 + delay * 0.6}s` }} />
            ))}
          </g>

          <g className={styles.pads}>
            {pads.map(([x, y], index) => (
              <rect
                key={`${x}-${y}`}
                x={x - 7}
                y={y - 7}
                width={14}
                height={14}
                rx={3}
                style={{ animationDelay: `${0.75 + (traces[index]?.delay ?? 0)}s` }}
              />
            ))}
            {vias.map(([x, y], index) => (
              <circle
                key={`${x}-${y}`}
                cx={x}
                cy={y}
                r={7}
                className={styles.via}
                style={{ animationDelay: `${1.2 + index * 0.05}s` }}
              />
            ))}
          </g>

          {/* Logo: dosyanın üst/alt şeffaf boşluğu kırpılır (3000×1200 → 5:1 görünür alan). */}
          <svg className={styles.logo} x={320} y={455} width={360} height={72} viewBox="0 300 3000 600">
            <image href="/brand/SONEF_Logo_Transparan_300ppi.png" width={3000} height={1200} />
          </svg>

          <text className={styles.tagline} x={500} y={606} textAnchor="middle">
            Fikirden Üretime.
          </text>
        </svg>
      </div>
    </>
  );
}
