"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import type { MotionGroupInput } from "@/lib/journey/motion-plan";
import type { ModelReadyInfo } from "./model-canvas";
import { ModelErrorBoundary } from "./model-error-boundary";
import { detectModelSupport } from "./model-support";
import styles from "./hero-model.module.css";

// three.js ve R3F yalnızca tarayıcıda, ayrı bir parça olarak yüklenir.
const ModelCanvas = dynamic(() => import("./model-canvas"), { ssr: false });

/**
 * idle        → destek henüz sınanmadı (sunucu çıktısı ve ilk boyama: poster)
 * unsupported → WebGL 2 yok; yalnızca poster, düğme yok
 * offer       → kısıtlayıcı koşul var; model düğmeye basılmadan indirilmez
 * loading     → canvas bağlı, GLB iniyor (poster görünür kalır)
 * ready       → ilk kare çizildi; canvas posterin yerini aldı
 * failed      → yükleme hatası veya context kaybı; poster + yeniden deneme
 */
type Status = "idle" | "unsupported" | "offer" | "loading" | "ready" | "failed";

type HeroModelProps = {
  modelUrl: string;
  presentationScale: number;
  groups: readonly MotionGroupInput[];
};

export function HeroModel({ modelUrl, presentationScale, groups }: HeroModelProps) {
  const [status, setStatus] = useState<Status>("idle");
  /** Yüklemeyi ziyaretçi başlattıysa durum duyurulur ve düğme görünür kalır. */
  const [userInitiated, setUserInitiated] = useState(false);
  /** Her yeni denemede hata sınırını ve canvas'ı sıfırlamak için anahtar. */
  const [attempt, setAttempt] = useState(0);
  const [integrity, setIntegrity] = useState<{ groups: number; mismatches: number }>();
  /** fade: ilk kare posterle aynı pozda, kısa geçiş · cut: farklı poz, doğrudan geçiş. */
  const [reveal, setReveal] = useState<"fade" | "cut">();

  useEffect(() => {
    // Destek kontrolü ve olası indirme, metin ve poster boyandıktan sonra yapılır.
    const decide = () => {
      const support = detectModelSupport();
      setStatus(support.kind === "auto" ? "loading" : support.kind === "on-demand" ? "offer" : "unsupported");
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(decide, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(decide, 200);
    return () => clearTimeout(id);
  }, []);

  const handleReady = useCallback((info: ModelReadyInfo) => {
    setIntegrity({ groups: info.foundGroups, mismatches: info.positionMismatches.length });
    setReveal(info.matchesIntroPoster ? "fade" : "cut");
    setStatus("ready");
    if (info.missingGroups.length > 0 && process.env.NODE_ENV !== "production") {
      console.warn("[HeroModel] Manifest'te olup modelde bulunmayan gruplar:", info.missingGroups);
    }
    if (info.positionMismatches.length > 0 && process.env.NODE_ENV !== "production") {
      console.warn("[HeroModel] GLB konumu manifest ile uyuşmayan gruplar:", info.positionMismatches);
    }
  }, []);

  const handleFailure = useCallback(() => setStatus("failed"), []);

  const handleLoadRequest = useCallback(async () => {
    if (status === "loading") return;
    if (status === "failed") {
      // Önbellekteki hatayı temizle; aksi halde yeniden deneme ağa gitmeden başarısız olur.
      const { clearModelCache } = await import("./model-canvas");
      clearModelCache(modelUrl);
      setAttempt((value) => value + 1);
    }
    setUserInitiated(true);
    setStatus("loading");
  }, [status, modelUrl]);

  const showCanvas = status === "loading" || status === "ready";
  const showButton = status === "offer" || status === "failed" || (status === "loading" && userInitiated);
  const isLoading = status === "loading";

  const buttonLabel = isLoading ? "3D model yükleniyor…" : status === "failed" ? "3D Modeli Yeniden Dene" : "3D Olarak İncele";

  const announcement =
    status === "failed"
      ? "3D model şu anda gösterilemiyor. Kartın görseli gösteriliyor."
      : userInitiated && status === "ready"
        ? "3D model yüklendi."
        : "";

  return (
    <div className={styles.root}>
      <div
        className={styles.layer}
        data-model-state={status}
        data-model-reveal={status === "ready" ? reveal : undefined}
        data-model-groups={integrity?.groups}
        data-model-position-mismatches={integrity?.mismatches}
        aria-hidden="true"
      >
        {showCanvas ? (
          <ModelErrorBoundary key={attempt} onError={handleFailure}>
            <ModelCanvas
              modelUrl={modelUrl}
              presentationScale={presentationScale}
              groups={groups}
              onReady={handleReady}
              onContextLost={handleFailure}
            />
          </ModelErrorBoundary>
        ) : null}
      </div>

      {showButton ? (
        <div className={styles.controls} data-tone="card">
          <button
            type="button"
            className={styles.button}
            aria-disabled={isLoading || undefined}
            onClick={handleLoadRequest}
          >
            {buttonLabel}
          </button>
        </div>
      ) : null}

      <p role="status" className="visually-hidden">
        {announcement}
      </p>
    </div>
  );
}
