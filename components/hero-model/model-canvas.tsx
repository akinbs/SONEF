"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  DoubleSide,
  Euler,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Path,
  Shape,
  ShapeGeometry,
  NeutralToneMapping,
  PMREMGenerator,
  Quaternion,
  Vector3,
  type Camera,
  type Group,
  type Object3D,
  type PerspectiveCamera,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { journeyStore } from "@/components/journey/journey-store";
import {
  addFloat,
  buildMotionPlan,
  cameraBlend,
  highlightOpacity,
  lanePose,
  writeGroupPose,
  type MotionGroupInput,
  type MotionPlan,
} from "@/lib/journey/motion-plan";
import { journeySceneConfig } from "@/lib/journey/scene-config";

export type ModelReadyInfo = {
  foundGroups: number;
  missingGroups: string[];
  /** GLB'deki özgün düğüm konumu manifest `assembledPositionM` ile uyuşmayan gruplar. */
  positionMismatches: string[];
  /**
   * İlk kare dağılmış posterle aynı pozda mı (giriş aralığı, kart sağda, süzülme zamanı 0)?
   * Değilse poster ile canvas arasında çapraz geçiş yapılmaz; iki farklı poz üst üste görünmesin.
   */
  matchesIntroPoster: boolean;
};

export type ModelCanvasProps = {
  modelUrl: string;
  presentationScale: number;
  groups: readonly MotionGroupInput[];
  onReady: (info: ModelReadyInfo) => void;
  onContextLost: () => void;
};

/** Yansıma gücü; ESP32 kapağındaki baskıların parlamada kaybolmaması için ölçülü. */
const ENVIRONMENT_INTENSITY = 0.55;
/** Manifest ile GLB düğüm konumu karşılaştırma toleransı (metre). */
const POSITION_TOLERANCE_M = 1e-7;

/** GLB `EXT_meshopt_compression` kullanır; decoder her yükleyiciye bağlanır. */
function withMeshopt(loader: GLTFLoader) {
  loader.setMeshoptDecoder(MeshoptDecoder);
}

/**
 * useLoader (suspend-react) başarısız yüklemeyi de önbelleğe alır; bu yüzden
 * kullanıcı yeniden denediğinde kayıt temizlenmezse hata ağa gitmeden tekrarlanır.
 */
export function clearModelCache(modelUrl: string) {
  useLoader.clear(GLTFLoader, modelUrl);
}

/**
 * Test ve poster çekimi için süzülme zamanını sabitler (`/?float-time=0`). Ana poz kaydırmayla
 * çalışmaya devam eder; yalnızca zamana bağlı katman durur. Ziyaretçi akışında kullanılmaz.
 */
function readFixedFloatTime(): number | null {
  const value = new URLSearchParams(window.location.search).get("float-time");
  if (value === null || value.trim() === "") return null;
  const time = Number(value);
  return Number.isFinite(time) ? time : null;
}

const isCoarsePointer = () => window.matchMedia("(pointer: coarse)").matches;

// ——— Kamera ———

type CameraFit = { center: Vector3; direction: Vector3; distance: number };

type FramingBox = MotionPlan["framingBoxes"]["wide"][number];

/**
 * Kutuların bütün köşeleri görüş alanına girecek kamera hedefini ve en kısa
 * mesafeyi hesaplar. Hedef, köşelerin kamera düzlemindeki izdüşümünün ortasına
 * kaydırılır; böylece dağılmış poz kadrajın bir köşesine yığılmaz. `rotation`
 * verilirse köşeler önce kompozisyonun o dönüşüyle (kart merkezi çevresinde) döndürülür.
 * Geometriye dokunmaz; yalnızca kamera konumunu belirler.
 */
function fitBoxes(boxes: readonly FramingBox[], scale: number, direction: Vector3, fovDeg: number, aspect: number, rotation?: Quaternion): CameraFit {
  const corners: Vector3[] = [];
  for (const { min, max } of boxes) {
    for (let i = 0; i < 8; i++) {
      const corner = new Vector3(i & 1 ? max[0] : min[0], i & 2 ? max[1] : min[1], i & 4 ? max[2] : min[2]).multiplyScalar(scale);
      corners.push(rotation ? corner.applyQuaternion(rotation) : corner);
    }
  }
  const forward = direction.clone().negate();
  const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0)).normalize();
  const up = new Vector3().crossVectors(right, forward).normalize();

  const center = corners.reduce((sum, c) => sum.add(c), new Vector3()).divideScalar(corners.length);
  let rMin = Infinity, rMax = -Infinity, uMin = Infinity, uMax = -Infinity;
  const rel = new Vector3();
  for (const corner of corners) {
    rel.subVectors(corner, center);
    const r = rel.dot(right), u = rel.dot(up);
    rMin = Math.min(rMin, r); rMax = Math.max(rMax, r);
    uMin = Math.min(uMin, u); uMax = Math.max(uMax, u);
  }
  center.addScaledVector(right, (rMin + rMax) / 2).addScaledVector(up, (uMin + uMax) / 2);

  const tanV = Math.tan(MathUtils.degToRad(fovDeg / 2)) * journeySceneConfig.camera.frameFill;
  const tanH = tanV * aspect;
  let distance = 0;
  for (const corner of corners) {
    rel.subVectors(corner, center);
    const depth = rel.dot(forward);
    distance = Math.max(distance, Math.abs(rel.dot(right)) / tanH - depth, Math.abs(rel.dot(up)) / tanV - depth);
  }
  return { center, direction, distance };
}

const UP = new Vector3(0, 1, 0);

/**
 * Soldaki karşı yatış için kompozisyonun dikey eksen (Y) çevresindeki dönüşü. Kompozisyonu φ
 * kadar döndürmek, kamerayı yatayda −φ kadar döndürmekle eşdeğerdir: görüş yönünün yatay
 * açısı az iken φ = az·(1 + güç) seçilir, eşdeğer açı −güç·az olur. Güç 1'de ekrandaki
 * eğim sağdaki görünümün tam karşılığıdır.
 */
function leftYawFor(direction: Vector3, mirror: number): number {
  return Math.atan2(direction.x, direction.z) * (1 + mirror);
}

/** Sağ (dönüşsüz) ve sol (karşı yatışlı) kadrajlar; her kamera anahtarı için. */
type CameraFits = { right: CameraFit[]; left: CameraFit[]; mirror: number };

function computeCameraFits(plan: MotionPlan, scale: number, aspect: number, mirror: number): CameraFits {
  const { fovDeg, views } = journeySceneConfig.camera;
  const right: CameraFit[] = [];
  const left: CameraFit[] = [];
  for (const key of plan.cameraKeys) {
    const direction = new Vector3(...views[key.view]).normalize();
    const boxes = plan.framingBoxes[key.framing];
    right.push(fitBoxes(boxes, scale, direction, fovDeg, aspect));
    const turn = new Quaternion().setFromAxisAngle(UP, leftYawFor(direction, mirror));
    left.push(fitBoxes(boxes, scale, direction, fovDeg, aspect, turn));
  }
  return { right, left, mirror };
}

/** Kartın yerleşim alanları (canvas pikseli); CSS'teki `[data-model-slot]` öğelerinden ölçülür. */
type Slot = { cx: number; cy: number; w: number; h: number };
type Slots = { left: Slot; right: Slot; mirror: number };

function measureSlots(canvas: HTMLCanvasElement, width: number, height: number): Slots {
  // Canvas sahne alanını tümüyle kaplar. Ölçü alana göre alınır: canvas'ın kendi konumu,
  // R3F yerleşim efekti sırasında henüz (0, 0) okunabiliyor.
  const area = canvas.closest("[data-canvas-area]");
  const base = (area ?? canvas).getBoundingClientRect();
  const full: Slot = { cx: width / 2, cy: height / 2, w: width, h: height };
  const read = (side: "left" | "right"): Slot => {
    const rect = area?.querySelector(`[data-model-slot="${side}"]`)?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return full;
    return { cx: rect.left - base.left + rect.width / 2, cy: rect.top - base.top + rect.height / 2, w: rect.width, h: rect.height };
  };
  // Karşı yatış gücü yerleşimle birlikte CSS'te tanımlıdır (mobilde daha küçük).
  const mirrorValue = area ? Number.parseFloat(getComputedStyle(area).getPropertyValue("--lane-mirror")) : Number.NaN;
  const mirror = Number.isFinite(mirrorValue) ? Math.min(1, Math.max(0, mirrorValue)) : journeySceneConfig.lane.defaultMirror;
  return { left: read("left"), right: read("right"), mirror };
}

const scratchCenter = new Vector3();
const scratchLeftCenter = new Vector3();
const scratchDirection = new Vector3();
const leftTurn = new Quaternion();
const IDENTITY = new Quaternion();

/**
 * Kamera ve kompozisyon tek şerit ilerlemesini (`lanePose(lane).u`) paylaşır:
 *
 * - Kompozisyon, kart merkezinden geçen dikey eksen çevresinde dönüşsüz (sağ) pozdan karşı
 *   yatışlı (sol) poza quaternion slerp ile döner. Dönüş yalnızca burada uygulanır.
 * - Kamera yönü değişmez; yalnızca hedef ve mesafe, sağ ve sol kadrajlar arasında aynı oranla
 *   karışır. Böylece dönüş kamerada ikinci kez uygulanmaz.
 * - Lens kaydırma (`setViewOffset`) sığdırılmış görüntüyü şerit konumundaki alana taşır ve
 *   derinliğe çekilmede küçültür; perspektif bozulmaz, geometriye dokunulmaz.
 */
function applyCameraAndComposition(camera: Camera, composition: Group, fits: CameraFits, plan: MotionPlan, s: number, slots: Slots, lane: number, width: number, height: number) {
  const { from, to, t } = cameraBlend(plan, s);
  const pose = lanePose(lane);
  const leftWeight = 1 - pose.u;

  const rightDistance = MathUtils.lerp(fits.right[from].distance, fits.right[to].distance, t);
  const leftDistance = MathUtils.lerp(fits.left[from].distance, fits.left[to].distance, t);
  const distance = MathUtils.lerp(rightDistance, leftDistance, leftWeight);
  scratchCenter.lerpVectors(fits.right[from].center, fits.right[to].center, t);
  scratchLeftCenter.lerpVectors(fits.left[from].center, fits.left[to].center, t);
  scratchCenter.lerp(scratchLeftCenter, leftWeight);
  scratchDirection.lerpVectors(fits.right[from].direction, fits.right[to].direction, t).normalize();

  leftTurn.setFromAxisAngle(UP, leftYawFor(scratchDirection, fits.mirror));
  composition.quaternion.copy(IDENTITY).slerp(leftTurn, leftWeight);

  camera.position.copy(scratchCenter).addScaledVector(scratchDirection, distance);
  camera.lookAt(scratchCenter);
  if (!("isPerspectiveCamera" in camera)) return;

  const slotW = MathUtils.lerp(slots.left.w, slots.right.w, pose.u) * pose.scale;
  const slotH = MathUtils.lerp(slots.left.h, slots.right.h, pose.u) * pose.scale;
  const cx = MathUtils.lerp(slots.left.cx, slots.right.cx, pose.u);
  const cy = MathUtils.lerp(slots.left.cy, slots.right.cy, pose.u) - pose.rise * height;

  const perspective = camera as PerspectiveCamera;
  perspective.fov = journeySceneConfig.camera.fovDeg;
  perspective.aspect = slotW / slotH;
  perspective.near = distance / 50;
  perspective.far = distance * 10;
  perspective.setViewOffset(slotW, slotH, slotW / 2 - cx, slotH / 2 - cy, width, height);
  perspective.updateProjectionMatrix();
}

// ——— Poz ———

const scratchPosition: [number, number, number] = [0, 0, 0];
const scratchRotation: [number, number, number] = [0, 0, 0];
const scratchEuler = new Euler();
const scratchQuaternion = new Quaternion();
const scratchFreeQuaternion = new Quaternion();
const scratchVector = new Vector3();
const scratchFree = new Vector3();
const rigInverse = new Quaternion();
const rigOffset = new Vector3();

/**
 * Kartın bütün olarak süzülmesi (rig). Rig'in içindeki kart ve yerleşmiş parçalar tek bütün
 * olarak taşınır. Sağ–sol karşı yatışı bir üst grup olan kompozisyon taşır
 * (`applyCameraAndComposition`); süzülme ona eklenir, onunla karışmaz.
 */
function applyRig(rig: Group, plan: MotionPlan, time: number, floatWeight: number) {
  scratchPosition[0] = scratchPosition[1] = scratchPosition[2] = 0;
  scratchRotation[0] = scratchRotation[1] = scratchRotation[2] = 0;
  addFloat(plan.boardFloat, time, floatWeight, scratchPosition, scratchRotation);
  rig.position.set(scratchPosition[0], scratchPosition[1], scratchPosition[2]);
  rig.rotation.set(scratchRotation[0], scratchRotation[1], scratchRotation[2]);
  rigOffset.copy(rig.position);
  rigInverse.copy(rig.quaternion).invert();
}

/**
 * Grup pozları. Serbest (henüz yerleşmemiş) bir parça kartın süzülmesinden bağımsızdır:
 * rig hareketi serbestlik oranında geri alınır, yerine parçanın kendi süzülmesi eklenir.
 * Yerleşmiş parçada serbestlik 0'dır; konum manifest'teki birleşmiş konum, dönüş GLB'deki
 * özgün dönüştür ve parça rig ile birlikte taşınır.
 */
function applyPose(objects: readonly (Object3D | null)[], bases: readonly (Quaternion | null)[], plan: MotionPlan, s: number, time: number, floatWeight: number) {
  plan.groups.forEach((group, index) => {
    const object = objects[index];
    const base = bases[index];
    if (!object || !base) return;
    const freedom = writeGroupPose(group, s, scratchPosition, scratchRotation, plan.supplyWindow);
    // Serbestlik 0 iken başlangıç dönüşü de sıfırdır (writeGroupPose): birleşmiş poz birebir uygulanır.
    if (group.kind === "fixed" || freedom <= 0) {
      object.position.set(scratchPosition[0], scratchPosition[1], scratchPosition[2]);
      object.quaternion.copy(base);
      return;
    }
    addFloat(group.float, time, freedom * floatWeight, scratchPosition, scratchRotation);
    // Dönüş üst grup ekseninde, grubun kendi orijini çevresinde uygulanır: q = q_yerel · q_özgün.
    scratchQuaternion.setFromEuler(scratchEuler.set(scratchRotation[0], scratchRotation[1], scratchRotation[2])).multiply(base);
    scratchVector.set(scratchPosition[0], scratchPosition[1], scratchPosition[2]);
    // Rig'den bağımsız poz: R⁻¹·(p − d) ve R⁻¹·q; serbestlik oranında karıştırılır.
    const weight = freedom * floatWeight;
    scratchFree.copy(scratchVector).sub(rigOffset).applyQuaternion(rigInverse);
    object.position.copy(scratchVector).lerp(scratchFree, weight);
    scratchFreeQuaternion.copy(rigInverse).multiply(scratchQuaternion);
    object.quaternion.copy(scratchQuaternion).slerp(scratchFreeQuaternion, weight);
  });
}

type Marker = { mesh: Mesh; material: MeshBasicMaterial; geometry: ShapeGeometry };

/**
 * Kart yüzeyine yatırılmış dikdörtgen çerçeve şeridi. WebGL çizgi kalınlığını
 * desteklemediği için 1 piksellik çizgi yerine ince bir mesh kullanılır.
 */
function frameGeometry(x0: number, z0: number, x1: number, z1: number, width: number, y: number): ShapeGeometry {
  // Şekil XY düzleminde çizilir; rotateX(-90°) (x, y) → (x, 0, -y) eşler.
  const outer = new Shape().moveTo(x0, -z0).lineTo(x1, -z0).lineTo(x1, -z1).lineTo(x0, -z1).closePath();
  const hole = new Path()
    .moveTo(x0 + width, -z0 - width)
    .lineTo(x0 + width, -z1 + width)
    .lineTo(x1 - width, -z1 + width)
    .lineTo(x1 - width, -z0 - width)
    .closePath();
  outer.holes.push(hole);
  const geometry = new ShapeGeometry(outer);
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, y, 0);
  return geometry;
}

function applyHighlights(markers: readonly Marker[], plan: MotionPlan, s: number) {
  markers.forEach((marker, index) => {
    const opacity = highlightOpacity(plan.highlights[index], s) * journeySceneConfig.highlights.maxOpacity;
    marker.material.opacity = opacity;
    marker.mesh.visible = opacity > 0.001;
  });
}

/**
 * GLB düğümlerinin özgün konum ve dönüşlerini, sahne ilk kez görüldüğünde (henüz poz
 * uygulanmadan) kaydeder ve konumu manifest ile karşılaştırır. Önbellekteki sahne
 * sonraki ziyaretlerde taşınmış olabileceği için kayıt yalnızca bir kez alınır.
 */
const ORIGINAL_POSITION = "sonefOriginalPositionM";
const ORIGINAL_QUATERNION = "sonefOriginalQuaternion";

function verifyAgainstManifest(objects: readonly (Object3D | null)[], groups: readonly MotionGroupInput[]): string[] {
  const mismatches: string[] = [];
  objects.forEach((object, index) => {
    if (!object) return;
    if (!Array.isArray(object.userData[ORIGINAL_POSITION])) {
      object.userData[ORIGINAL_POSITION] = object.position.toArray();
    }
    const original = object.userData[ORIGINAL_POSITION] as number[];
    const expected = groups[index].assembledPositionM;
    if (original.some((value, axis) => Math.abs(value - expected[axis]) > POSITION_TOLERANCE_M)) {
      mismatches.push(groups[index].id);
    }
  });
  return mismatches;
}

function originalQuaternions(objects: readonly (Object3D | null)[]): (Quaternion | null)[] {
  return objects.map((object) => {
    if (!object) return null;
    if (!Array.isArray(object.userData[ORIGINAL_QUATERNION])) {
      object.userData[ORIGINAL_QUATERNION] = object.quaternion.toArray();
    }
    return new Quaternion().fromArray(object.userData[ORIGINAL_QUATERNION] as number[]);
  });
}

// ——— Sahne bileşenleri ———

/**
 * Ağ isteği olmadan, kod içinde üretilen nötr stüdyo yansıması. Metal yüzeyler
 * (ör. `metallicFactor` tanımsız = 1 olan ESP32 kapağı) ancak bununla görünür.
 * Sahneye `attach="environment"` ile bağlanır; kaldırıldığında R3F geri alır.
 */
function StudioEnvironment() {
  const gl = useThree((state) => state.gl);

  const envMap = useMemo(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const texture = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();
    return texture;
  }, [gl]);

  useEffect(() => () => envMap.dispose(), [envMap]);

  return <primitive object={envMap} attach="environment" />;
}

/**
 * Süzülme için kare üretimi: yalnızca sekme görünürken, canvas ekrandayken ve hareket
 * açıkken (azaltılmış hareket değil, zaman sabitlenmemiş) her animasyon karesinde çizim
 * istenir. Dokunmatik ekranlarda süzülme kareleri sınırlanır; kaydırma kareleri sınırlanmaz.
 */
function useFloatLoop(enabled: boolean) {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!enabled) return;
    const minInterval = isCoarsePointer() ? 1000 / journeySceneConfig.float.coarseMaxFps : 0;
    let frame = 0;
    let last = 0;
    let inView = true;

    const running = () => inView && document.visibilityState === "visible" && !journeyStore.getIsStatic();
    const loop = (now: number) => {
      frame = 0;
      if (!running()) return;
      // Yarım karelik tolerans: 60 Hz ekranda 30 fps sınırı her ikinci karede çizer.
      if (now - last >= minInterval - 8) {
        last = now;
        invalidate();
      }
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!frame && running()) frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    observer.observe(gl.domElement);
    const onVisibility = () => (document.visibilityState === "visible" ? start() : stop());
    document.addEventListener("visibilitychange", onVisibility);
    // Azaltılmış hareket tercihi değişirse (setStatic / update) döngü buna uyar.
    const unsubscribe = journeyStore.subscribeFrame(start);
    start();

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      unsubscribe();
    };
  }, [enabled, gl, invalidate]);
}

function Esp32Model({ modelUrl, presentationScale, groups, onReady }: Omit<ModelCanvasProps, "onContextLost">) {
  // useLoader URL bazında önbellekler: aynı sahne tekrar ayrıştırılmaz veya klonlanmaz.
  const gltf = useLoader(GLTFLoader, modelUrl, withMeshopt);
  // Seed'li dağılım ve süzülme parametreleri burada bir kez hesaplanır.
  const plan = useMemo(() => buildMotionPlan(groups), [groups]);

  // Grup referansları model yüklendiğinde bir kez eşleşir.
  const objects = useMemo(() => plan.groups.map((group) => gltf.scene.getObjectByName(group.id) ?? null), [gltf, plan]);
  const mismatches = useMemo(() => verifyAgainstManifest(objects, groups), [objects, groups]);
  const bases = useMemo(() => originalQuaternions(objects), [objects]);

  // Kontrol/test vurguları: kartın yüzeyinde ince çerçeveler (yalnızca açıklama; parça değil).
  const markers = useMemo<Marker[]>(() => {
    const { marginM, strokeM, color } = journeySceneConfig.highlights;
    // Lehim maskesi ve baskıların üstünde; aksi halde derinlik testi çerçeveyi gizler.
    const y = journeySceneConfig.boardSurfaceTopM + 0.00005;
    return plan.highlights.map((highlight) => {
      const [x0, , z0] = highlight.box.min;
      const [x1, , z1] = highlight.box.max;
      const geometry = frameGeometry(x0 - marginM, z0 - marginM, x1 + marginM, z1 + marginM, strokeM, y);
      const material = new MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide, toneMapped: false });
      const mesh = new Mesh(geometry, material);
      mesh.visible = false;
      return { mesh, material, geometry };
    });
  }, [plan]);

  useEffect(
    () => () => {
      // Yalnızca bu bileşenin ürettiği kaynaklar; yükleyici önbelleğindeki model dokunulmaz.
      markers.forEach((marker) => {
        marker.geometry.dispose();
        marker.material.dispose();
      });
    },
    [markers],
  );

  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const invalidate = useThree((state) => state.invalidate);

  const compositionRef = useRef<Group>(null);
  const rigRef = useRef<Group>(null);
  const fitsRef = useRef<CameraFits | null>(null);
  const slotsRef = useRef<Slots | null>(null);
  const reportedRef = useRef(false);
  const fixedTime = useMemo(() => readFixedFloatTime(), []);
  /** Süzülme saati: yalnızca çizilen karelerde ilerler; sekme gizliyken veya ekran dışındayken durur. */
  const floatTimeRef = useRef(fixedTime ?? 0);

  useFloatLoop(fixedTime === null);

  // Kapsayıcı boyutu değiştikçe yerleşim alanları ve kadrajlar yeniden hesaplanır; parçalar aynı `s` pozunda kalır.
  useLayoutEffect(() => {
    if (width === 0 || height === 0) return;
    const slots = measureSlots(gl.domElement, width, height);
    slotsRef.current = slots;
    fitsRef.current = computeCameraFits(plan, presentationScale, slots.right.w / slots.right.h, slots.mirror);
    invalidate();
  }, [plan, presentationScale, width, height, gl, invalidate]);

  // Kaydırma değiştiğinde yeniden çizim istenir (frameloop="demand").
  useEffect(() => journeyStore.subscribeFrame(() => invalidate()), [invalidate]);

  // Her çizimden önce ana poz, süzülme, kamera ve vurgular hesaplanır. İlk görünür kare de bu
  // yoldan geçtiği için model ortada açılsa bile giriş pozunu göstermez.
  useFrame((_, delta) => {
    const fits = fitsRef.current;
    const slots = slotsRef.current;
    const composition = compositionRef.current;
    const rig = rigRef.current;
    if (!fits || !slots || !composition || !rig) return;
    const s = journeyStore.getCoord();
    const lane = journeyStore.getLane();
    const isStatic = journeyStore.getIsStatic();
    const time = floatTimeRef.current;
    // Azaltılmış hareket: zamana bağlı süzülme yok, kart statik.
    const floatWeight = isStatic ? 0 : 1;

    // Sıra: ortak kompozisyon dönüşü + kamera, kartın süzülmesi, parçaların yerel pozları.
    applyCameraAndComposition(camera, composition, fits, plan, s, slots, lane, width, height);
    applyRig(rig, plan, time, floatWeight);
    applyPose(objects, bases, plan, s, time, floatWeight);
    applyHighlights(markers, plan, s);

    if (fixedTime === null && !isStatic) floatTimeRef.current += Math.min(delta, 0.1);

    if (!reportedRef.current) {
      reportedRef.current = true;
      const missingGroups = plan.groups.filter((_, index) => !objects[index]).map((group) => group.id);
      onReady({
        foundGroups: plan.groups.length - missingGroups.length,
        missingGroups,
        positionMismatches: mismatches,
        matchesIntroPoster: s <= plan.introHoldUntil && lane >= 0.9999 && time === 0 && !isStatic,
      });
    }
  });

  return (
    <group scale={presentationScale}>
      <group ref={compositionRef}>
        <group ref={rigRef}>
          <primitive object={gltf.scene} />
          {markers.map((marker, index) => (
            <primitive key={plan.highlights[index].id} object={marker.mesh} />
          ))}
        </group>
      </group>
    </group>
  );
}

export default function ModelCanvas({ onContextLost, ...modelProps }: ModelCanvasProps) {
  // Dokunmatik / küçük ekranlarda piksel oranı ölçülü sınırlanır.
  const maxDpr = useMemo(() => (isCoarsePointer() ? 1.5 : 2), []);
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, maxDpr]}
      camera={{ fov: journeySceneConfig.camera.fovDeg, position: [0, 1, 1] }}
      scene={{ environmentIntensity: ENVIRONMENT_INTENSITY }}
      gl={{ antialias: true, alpha: true, toneMapping: NeutralToneMapping }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
      }}
    >
      <StudioEnvironment />
      <hemisphereLight args={["#ffffff", "#2a3550", 0.6]} />
      <directionalLight position={[-2.5, 6, 3.5]} intensity={1.4} />
      <Esp32Model {...modelProps} />
    </Canvas>
  );
}
