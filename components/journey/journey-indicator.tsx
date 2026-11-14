"use client";

import { useSyncExternalStore } from "react";
import { journeyStages } from "@/lib/journey/stages";
import { journeyStore } from "./journey-store";
import styles from "./journey-section.module.css";

const stepTotal = String(journeyStages.length - 1).padStart(2, "0");

/**
 * Sahnenin köşesindeki sade aşama göstergesi. Aynı bilgi süreç metninde zaten
 * bulunduğu için yardımcı teknolojilerden gizlenir. Yalnızca aktif aşama
 * değiştiğinde yeniden render edilir; sürekli ilerleme CSS değişkeniyle çizilir.
 */
export function JourneyIndicator() {
  const active = useSyncExternalStore(journeyStore.subscribeActive, journeyStore.getActiveIndex, () => 0);
  const stage = journeyStages[active];
  const isStep = active > 0;

  return (
    <div className={styles.indicator} aria-hidden="true" data-tone="card">
      <p className={styles.indicatorLabel}>
        {isStep ? (
          <>
            <span className={styles.indicatorNumber}>
              {String(active).padStart(2, "0")} / {stepTotal}
            </span>
            {stage.title}
          </>
        ) : (
          <span className={styles.indicatorNumber}>Üretim yolculuğu</span>
        )}
      </p>
      <span className={styles.indicatorTrack}>
        <span className={styles.indicatorBar} />
      </span>
    </div>
  );
}
