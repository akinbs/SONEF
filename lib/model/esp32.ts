/**
 * ESP32 CAD modelinin sunucu tarafı özeti.
 *
 * Manifest (~130 KB, kaynak gövde eşleştirmeleriyle) yalnızca Server Component'lerden
 * içe aktarılır; istemciye sadece aşağıdaki küçük, serileştirilebilir alanlar geçer.
 * Bu modülü bir Client Component'ten içe aktarmayın.
 */
import manifest from "@/public/models/esp32/esp32-manifest.json";
import type { MotionGroupInput, Vec3 } from "@/lib/journey/motion-plan";

export type ModelGroupInfo = MotionGroupInput;

export type HeroModelConfig = {
  modelUrl: string;
  posters: {
    /** Yolculuğun giriş pozu (dağılmış), gerçek modelden ve sahnenin kamerasıyla alınmış. */
    exploded: string;
    /** Birleşmiş kart; statik geri dönüş ve azaltılmış hareket için. */
    assembled: string;
  };
  /** Oranları koruyan tek, tekdüze üst grup ölçeği. */
  presentationScale: number;
  pcbDimensionsMm: Vec3;
  groups: readonly ModelGroupInfo[];
};

function toVec3(value: readonly number[], label: string): Vec3 {
  if (value.length !== 3 || value.some((n) => !Number.isFinite(n))) {
    throw new Error(`esp32-manifest: ${label} üç sayıdan oluşmalı.`);
  }
  return [value[0], value[1], value[2]];
}

export const esp32Groups: readonly ModelGroupInfo[] = manifest.groups.map((group) => {
  if (group.boundsMm.length !== 6) throw new Error(`esp32-manifest: ${group.id}.boundsMm altı sayı olmalı.`);
  return {
    id: group.id,
    category: group.category,
    fixed: group.fixed,
    assembledPositionM: toVec3(group.assembledPositionM, `${group.id}.assembledPositionM`),
    explodeOffsetM: toVec3(group.explodeOffsetM, `${group.id}.explodeOffsetM`),
    boundsMm: group.boundsMm,
  };
});

export const esp32HeroModel: HeroModelConfig = {
  modelUrl: manifest.modelUrl,
  posters: {
    exploded: "/models/esp32/esp32-poster-floating.webp",
    assembled: manifest.posterUrl,
  },
  presentationScale: manifest.recommendedPresentationScale,
  pcbDimensionsMm: toVec3(manifest.pcbDimensionsMm, "pcbDimensionsMm"),
  groups: esp32Groups,
};
