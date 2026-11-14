import { processSteps } from "@/content/process";

/**
 * Ana sayfa yolculuğunun aşamaları. Metin (DOM) ve 3D sahne aynı listeyi kullanır:
 * aşama 0 giriş (hero), 1…7 `content/process.ts` içindeki süreç adımlarıdır.
 *
 * Kaydırma ilerlemesi (0→1), her aşamanın sayfadaki gerçek konumu ölçülerek
 * "aşama koordinatına" çevrilir: `s = i + aşama içi oran`, 0 ≤ s ≤ STAGE_COUNT.
 * Sahne zamanlamaları bu koordinatla tanımlanır; böylece responsive yerleşimde
 * metin uzasa da ekrandaki metin ile parça hareketi aynı aşamada kalır.
 */

export type ProcessSlug = (typeof processSteps)[number]["slug"];
export type JourneyStageId = "giris" | ProcessSlug;

export type JourneyStage = {
  id: JourneyStageId;
  title: string;
};

export const journeyStages: readonly JourneyStage[] = [
  { id: "giris", title: "Fikirden Üretime" },
  ...processSteps.map((step) => ({ id: step.slug, title: step.title })),
];

export const STAGE_COUNT = journeyStages.length;

export function stageIndex(id: JourneyStageId): number {
  const index = journeyStages.findIndex((stage) => stage.id === id);
  if (index === -1) throw new Error(`Bilinmeyen yolculuk aşaması: ${id}`);
  return index;
}

/** Bir aşamanın içindeki orana (0–1) karşılık gelen aşama koordinatı. */
export function stageAt(id: JourneyStageId, fraction: number): number {
  return stageIndex(id) + fraction;
}
