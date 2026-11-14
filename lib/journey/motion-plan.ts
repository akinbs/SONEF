import { createRandom, seedFor, type Random } from "./random";
import { journeySceneConfig as config, resolvePoint, resolveWindow, type CameraFraming, type CameraView } from "./scene-config";
import { stageIndex } from "./stages";

/**
 * Hareket planı iki katmandan oluşur:
 *
 * 1. Ana poz: her grubun konumu ve dönüşü, aşama koordinatı `s` ile değişmeyen planlanmış
 *    değerlerden hesaplanır. Önceki kareye değer eklenmez; ileri/geri kaydırma, resize veya
 *    modelin geç yüklenmesi aynı `s` için hep aynı ana pozu verir.
 * 2. Süzülme: zamana bağlı küçük konum/dönüş farkı. Grubun "serbestliği" (`freedom`) ile
 *    çarpılır; parça yerleşmeye başladıkça azalır, yerleştiğinde tam sıfırdır.
 *
 * Dağılmış konumlar, başlangıç dönüşleri, süzülme parametreleri ve yerleşme zamanları
 * `buildMotionPlan` içinde seed'li üreteçle bir kez hesaplanır.
 */

export type Vec3 = readonly [number, number, number];
type MutableVec3 = [number, number, number];
type Box = { min: Vec3; max: Vec3 };

export type MotionGroupInput = {
  id: string;
  category: string;
  fixed: boolean;
  assembledPositionM: Vec3;
  explodeOffsetM: Vec3;
  /** Birleşmiş konumdaki sınır kutusu, parent uzayında milimetre: [minX,minY,minZ,maxX,maxY,maxZ]. */
  boundsMm: readonly number[];
};

type Window = readonly [number, number];

/** Bir eksen için iki yavaş sinüsün toplamı: a·(0,65·sin(w1·t+f1) + 0,35·sin(w2·t+f2)). */
export type FloatAxis = { amp: number; w1: number; w2: number; f1: number; f2: number };
export type FloatParams = { position: readonly [FloatAxis, FloatAxis, FloatAxis]; rotation: readonly [FloatAxis, FloatAxis, FloatAxis] };

type FreePlan = {
  id: string;
  assembled: Vec3;
  /** Giriş aşamasındaki dağılmış konum. */
  scattered: Vec3;
  /** Tedarik sonrasında, dağınıklığı koruyarak yaklaşılmış konum. */
  gathered: Vec3;
  /** Başlangıç dönüşü (radyan, XYZ Euler). */
  rotation: Vec3;
  float: FloatParams;
};

export type GroupPlan =
  | { kind: "fixed"; id: string; assembled: Vec3 }
  | (FreePlan & { kind: "smd"; approach: Vec3; placeWindow: Window })
  | (FreePlan & { kind: "header"; via: Vec3; window: Window });

export type HighlightPlan = { id: string; box: Box; window: Window };

export type MotionPlan = {
  groups: readonly GroupPlan[];
  /** Kartın (ve yerleşmiş parçaların) bütün olarak süzülmesi. */
  boardFloat: FloatParams;
  /**
   * Kameranın sığdıracağı kutular (metre, sunum ölçeği uygulanmadan). Her grubun ilgili
   * pozlardaki kutuları; dönüş ve süzülme payı eklenmiş.
   */
  framingBoxes: Record<CameraFraming, readonly Box[]>;
  highlights: readonly HighlightPlan[];
  cameraKeys: readonly { at: number; framing: CameraFraming; view: CameraView }[];
  assembledPosterFrom: number;
  supplyWindow: Window;
  /** Dizgi aşamasının sonu: bütün SMD grupları bu koordinatta yerindedir. */
  placementEnd: number;
  /**
   * Bu koordinata kadar ana poz (parçalar, kamera, vurgular) `s = 0` ile aynıdır;
   * dağılmış poster bu pozdan (süzülme zamanı 0, kart sağda) çekilmiştir.
   */
  introHoldUntil: number;
};

// ——— Yardımcılar ———

const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
/** Aşmasız yavaşlama: son konumda zıplama veya gömülme olmaz. */
export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
export const smoothstep = (t: number) => t * t * (3 - 2 * t);
/** Hız ve ivmesi uçlarda sıfır olan geçiş. */
export const smootherstep = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/**
 * Şerit geçişinin profili (PCB yolu, Blok 09 sonrası): düz → yuvarlatılmış köşe → sabit eğimli
 * çapraz → köşe → düz. `corner` (0–0,5) her iki uçtaki köşenin geçişe oranıdır. Köşelerde hız
 * doğrusal artar/azalır (ivme sabit), ortada sabittir. Kaydırma ekseni doğrusal olduğundan
 * yatay–dikey düzlemde bu, iki parabol yay + bir doğru parçasıdır; journey-driver.tsx yolu
 * aynı fonksiyonun geometrisiyle (quadratic Bézier + doğru) çizer, model yolun üstünde kalır.
 */
export function traceEase(t: number, corner: number): number {
  const c = Math.min(0.5, Math.max(1e-3, corner));
  const x = Math.min(1, Math.max(0, t));
  const k = 1 / (2 * c * (1 - c));
  if (x < c) return k * x * x;
  if (x > 1 - c) return 1 - k * (1 - x) * (1 - x);
  return (x - c / 2) / (1 - c);
}

const progressIn = (s: number, [a, b]: Window) => clamp01((s - a) / (b - a));
const deg = (d: number) => (d * Math.PI) / 180;

function boxOf(group: MotionGroupInput): Box {
  const b = group.boundsMm.map((v) => v / 1000);
  return { min: [b[0], b[1], b[2]], max: [b[3], b[4], b[5]] };
}

/**
 * Grubun kutusu, `position` konumuna taşınmış ve `rotation` ile döndürülmüş hâliyle
 * (dönmüş kutunun eksen hizalı sınırı), `pad` kadar büyütülmüş olarak.
 */
function boxAt(group: MotionGroupInput, position: Vec3, rotation: Vec3 = [0, 0, 0], pad = 0): Box {
  const box = boxOf(group);
  const a = group.assembledPositionM;
  const [cx, cy, cz] = [Math.cos(rotation[0]), Math.cos(rotation[1]), Math.cos(rotation[2])];
  const [sx, sy, sz] = [Math.sin(rotation[0]), Math.sin(rotation[1]), Math.sin(rotation[2])];
  const min: MutableVec3 = [Infinity, Infinity, Infinity];
  const max: MutableVec3 = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < 8; i++) {
    // Köşe, grubun orijinine (birleşmiş konum) göre; three.js XYZ Euler sırası: R = Rx·Ry·Rz.
    let x = (i & 1 ? box.max[0] : box.min[0]) - a[0];
    let y = (i & 2 ? box.max[1] : box.min[1]) - a[1];
    let z = (i & 4 ? box.max[2] : box.min[2]) - a[2];
    [x, y] = [x * cz - y * sz, x * sz + y * cz];
    [x, z] = [x * cy + z * sy, -x * sy + z * cy];
    [y, z] = [y * cx - z * sx, y * sx + z * cx];
    const p = [x + position[0], y + position[1], z + position[2]];
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], p[k] - pad);
      max[k] = Math.max(max[k], p[k] + pad);
    }
  }
  return { min, max };
}

function unionBoxes(boxes: readonly Box[]): Box {
  const min: MutableVec3 = [Infinity, Infinity, Infinity];
  const max: MutableVec3 = [-Infinity, -Infinity, -Infinity];
  for (const box of boxes) {
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], box.min[i]);
      max[i] = Math.max(max[i], box.max[i]);
    }
  }
  return { min, max };
}

function overlaps(a: Box, b: Box, gap: number): boolean {
  return [0, 1, 2].every((k) => a.min[k] - gap < b.max[k] && b.min[k] - gap < a.max[k]);
}

/** İki kutu arasındaki en kısa uzaklık (iç içeyse 0). */
function boxDistance(a: Box, b: Box): number {
  let sum = 0;
  for (let k = 0; k < 3; k++) {
    const d = Math.max(0, a.min[k] - b.max[k], b.min[k] - a.max[k]);
    sum += d * d;
  }
  return Math.sqrt(sum);
}

const boxVolumeMm3 = (box: Box) =>
  (box.max[0] - box.min[0]) * (box.max[1] - box.min[1]) * (box.max[2] - box.min[2]) * 1e9;

function floatAxis(random: Random, amp: readonly [number, number], period: readonly [number, number]): FloatAxis {
  const p1 = random.range(period[0], period[1]);
  // İkinci bileşenin periyodu altın oranla kaydırılır: iki sinüs hiç aynı fazda tekrarlanmaz.
  const p2 = p1 * random.range(1.45, 1.75);
  return {
    amp: random.range(amp[0], amp[1]),
    w1: (2 * Math.PI) / p1,
    w2: (2 * Math.PI) / p2,
    f1: random.range(0, 2 * Math.PI),
    f2: random.range(0, 2 * Math.PI),
  };
}

function floatParams(random: Random, positionAmp: readonly [number, number], rotationAmpDeg: readonly [number, number], period: readonly [number, number], rotationPeriod: readonly [number, number]): FloatParams {
  const rotationAmp = [deg(rotationAmpDeg[0]), deg(rotationAmpDeg[1])] as const;
  return {
    position: [floatAxis(random, positionAmp, period), floatAxis(random, positionAmp, period), floatAxis(random, positionAmp, period)],
    rotation: [floatAxis(random, rotationAmp, rotationPeriod), floatAxis(random, rotationAmp, rotationPeriod), floatAxis(random, rotationAmp, rotationPeriod)],
  };
}

/** En büyük süzülme sapması (konum, metre): iki bileşenin toplam genliği. */
const maxFloatOffset = () => config.float.positionAmpM[1];

// ——— Dağılım ———

type Scatter = { scattered: Vec3; gathered: Vec3; rotation: Vec3 };

/**
 * Seed'li, çakışmasız 3D dağılım. Büyük gruplar önce yerleştirilir. Her aday:
 * - kartın sınır kutusundan uzak, alt yüzeyi yaklaşma yolunun üstünde,
 * - "yakın" veya "uzak" kabuğa (seed ile seçilir) uyan bir mesafede,
 * - dağılmış ve toplanmış konumlarında diğer parçalarla (dönüş + süzülme payıyla) çakışmasız
 * olmalıdır. Kabul edilemezse uygun aday bulunana kadar yeniden örneklenir.
 */
function scatterGroups(groups: readonly MotionGroupInput[]): Map<string, Scatter> {
  const { scatter, supply } = config;
  const board = groups.find((g) => g.fixed);
  const boardBox = board ? boxOf(board) : { min: [0, 0, 0] as Vec3, max: [0, 0, 0] as Vec3 };
  const floatPad = maxFloatOffset() + 0.0004;
  const placedBoxes: Box[] = [];
  const result = new Map<string, Scatter>();

  const movable = groups
    .filter((g) => !g.fixed)
    .sort((a, b) => boxVolumeMm3(boxOf(b)) - boxVolumeMm3(boxOf(a)) || a.id.localeCompare(b.id));

  for (const group of movable) {
    const random = createRandom(seedFor(scatter.seed, group.id));
    const box = boxOf(group);
    const a = group.assembledPositionM;
    const large = boxVolumeMm3(box) > scatter.largeVolumeMm3;
    const rotationRange = large ? scatter.largeRotationDeg : scatter.rotationDeg;
    const anchor = scatter.anchors[group.id];
    const wantsNear = random.next() < scatter.nearShare;
    const distanceRange = wantsNear ? scatter.nearDistanceM : scatter.farDistanceM;

    let chosen: Scatter | undefined;
    let fallback: { scatter: Scatter; score: number } | undefined;
    for (let attempt = 0; attempt < scatter.attempts && !chosen; attempt++) {
      const rotation: Vec3 = [0, 1, 2].map(() => random.sign() * deg(random.range(rotationRange[0], rotationRange[1]))) as unknown as Vec3;
      let position: Vec3;
      if (anchor) {
        position = [0, 1, 2].map((k) => a[k] + anchor.offsetM[k] + random.range(-1, 1) * anchor.jitterM[k]) as unknown as Vec3;
      } else {
        // Hacimde örneklenen konum grubun merkezini belirler.
        const center: Vec3 = [
          random.range(scatter.volumeM.x[0], scatter.volumeM.x[1]),
          random.range(scatter.volumeM.y[0], scatter.volumeM.y[1]),
          random.range(scatter.volumeM.z[0], scatter.volumeM.z[1]),
        ];
        const ownCenter = [(box.min[0] + box.max[0]) / 2, (box.min[1] + box.max[1]) / 2, (box.min[2] + box.max[2]) / 2];
        position = [center[0] + a[0] - ownCenter[0], center[1] + a[1] - ownCenter[1], center[2] + a[2] - ownCenter[2]];
      }

      // Tedarik: aynı parça, kendi yerinin üstündeki yaklaşma noktasına doğru `pull` kadar yaklaşır.
      const target: Vec3 = [a[0], a[1] + config.approachLiftM, a[2]];
      const gathered: Vec3 = anchor ? position : [0, 1, 2].map((k) => position[k] + (target[k] - position[k]) * supply.pull) as unknown as Vec3;

      const boxes = [boxAt(group, position, rotation, floatPad), boxAt(group, gathered, rotation, floatPad)];
      const distance = Math.min(...boxes.map((b) => boxDistance(b, boardBox)));
      const valid =
        boxes.every((b) => !overlaps(b, boardBox, scatter.boardClearanceM)) &&
        boxes.every((b) => !placedBoxes.some((other) => overlaps(b, other, scatter.gapM))) &&
        (anchor !== undefined ||
          (boxes.every((b) => b.min[1] >= scatter.minBottomM) && distance >= distanceRange[0] && distance <= distanceRange[1]));
      if (valid) {
        chosen = { scattered: position, gathered, rotation };
        placedBoxes.push(...boxes);
      } else if (anchor && boxes.every((b) => !placedBoxes.some((other) => overlaps(b, other, scatter.gapM)))) {
        // Sabitli büyük gruplar kart kutusuna yakın olabilir (header'lar kartın altında).
        const score = distance;
        if (!fallback || score > fallback.score) fallback = { scatter: { scattered: position, gathered, rotation }, score };
      }
    }
    if (!chosen && fallback) {
      chosen = fallback.scatter;
      placedBoxes.push(boxAt(group, chosen.scattered, chosen.rotation, floatPad));
    }
    if (!chosen) throw new Error(`Dağılım bulunamadı: ${group.id}. scatter yapılandırmasını genişletin.`);
    result.set(group.id, chosen);
  }
  return result;
}

// ——— Dizgi zamanlaması ———

/**
 * Yerleşme sırası seed ile karıştırılır (türlere göre dalga yok); `lastGroups` sona alınır.
 * Başlangıçlar pencereye yayılır ve her biri seed'li sapma alır; süreler de değişkendir.
 */
function placementWindows(groups: readonly MotionGroupInput[], scattered: ReadonlyMap<string, Scatter>): Map<string, Window> {
  const { placement, scatter } = config;
  const start = stageIndex(placement.stage);
  const last = placement.lastGroups as readonly string[];
  const random = createRandom(seedFor(scatter.seed, "placement-order"));
  const keyed = groups.map((group) => ({ group, key: random.next() }));
  keyed.sort((a, b) => a.key - b.key);
  const ordered = [...keyed.filter((k) => !last.includes(k.group.id)), ...keyed.filter((k) => last.includes(k.group.id))].map((k) => k.group);

  const [w0, w1] = placement.window;
  const [d0, d1] = placement.durationRange;
  const windows = new Map<string, Window>();
  ordered.forEach((group, index) => {
    const r = createRandom(seedFor(scatter.seed, `placement-${group.id}`));
    // Uzaktan gelen parça daha uzun sürede yerleşir; hız parçalar arasında benzer kalır.
    const from3 = scattered.get(group.id)!.gathered;
    const a = group.assembledPositionM;
    const travelMm = Math.hypot(from3[0] - a[0], from3[1] - a[1], from3[2] - a[2]) * 1000;
    const duration = Math.min(d1 + 0.06, r.range(d0, d1) + travelMm * placement.durationPerMm);
    const isLast = last.includes(group.id);
    const latest = w1 - duration;
    const base = ordered.length > 1 ? w0 + ((latest - w0) * index) / (ordered.length - 1) : w0;
    const from = isLast ? latest : Math.min(latest, Math.max(w0, base + r.range(-1, 1) * placement.jitter));
    windows.set(group.id, [start + from, start + from + duration]);
  });
  return windows;
}

// ——— Plan ———

export function buildMotionPlan(groups: readonly MotionGroupInput[]): MotionPlan {
  const scattered = scatterGroups(groups);
  const headerIds = config.headerPlacement.groups as readonly string[];
  const headerWindow = resolveWindow(config.headerPlacement.window);
  const supplyWindow = resolveWindow(config.supply.window);
  const placeWindows = placementWindows(groups.filter((g) => !g.fixed && !headerIds.includes(g.id)), scattered);
  const { float } = config;

  const plans: GroupPlan[] = groups.map((group) => {
    const assembled = group.assembledPositionM;
    if (group.fixed) return { kind: "fixed", id: group.id, assembled };
    const scatter = scattered.get(group.id)!;
    const free: FreePlan = {
      id: group.id,
      assembled,
      ...scatter,
      float: floatParams(createRandom(seedFor(config.scatter.seed, `float-${group.id}`)), float.positionAmpM, float.rotationAmpDeg, float.periodS, float.rotationPeriodS),
    };
    if (headerIds.includes(group.id)) {
      return { ...free, kind: "header", via: [assembled[0], assembled[1] - config.headerPlacement.belowM, assembled[2]], window: headerWindow };
    }
    const placeWindow = placeWindows.get(group.id);
    if (!placeWindow) throw new Error(`Dizgi zamanı atanmamış grup: ${group.id} (${group.category})`);
    return { ...free, kind: "smd", approach: [assembled[0], assembled[1] + config.approachLiftM, assembled[2]], placeWindow };
  });

  const boardFloat = floatParams(
    createRandom(seedFor(config.scatter.seed, "board-float")),
    float.board.positionAmpM,
    float.board.rotationAmpDeg,
    float.board.periodS,
    float.board.periodS,
  );

  const byId = new Map(groups.map((g) => [g.id, g]));
  // Serbest pozlar dönüş ve süzülme payıyla; kart da bütün olarak hafifçe süzülür.
  const freePad = maxFloatOffset() + 0.0008;
  const boardPad = float.board.positionAmpM[1] + 0.0006;
  const boxesFor = (pick: (plan: GroupPlan) => { position: Vec3; rotation?: Vec3; pad: number }[]) =>
    plans.flatMap((plan) => pick(plan).map(({ position, rotation, pad }) => boxAt(byId.get(plan.id)!, position, rotation, pad)));
  const freePoses = (p: Extract<GroupPlan, { kind: "smd" | "header" }>) => [
    { position: p.scattered, rotation: p.rotation, pad: freePad },
    { position: p.gathered, rotation: p.rotation, pad: freePad },
  ];

  const framingBoxes: Record<CameraFraming, readonly Box[]> = {
    wide: boxesFor((p) =>
      p.kind === "fixed"
        ? [{ position: p.assembled, pad: boardPad }]
        : [...freePoses(p), { position: p.assembled, pad: boardPad }],
    ),
    "board-with-headers": boxesFor((p) =>
      p.kind === "header"
        ? [...freePoses(p), { position: p.via, pad: boardPad }, { position: p.assembled, pad: boardPad }]
        : [{ position: p.assembled, pad: boardPad }],
    ),
    assembled: boxesFor((p) => [{ position: p.assembled, pad: boardPad }]),
  };

  const highlightStage = stageIndex(config.highlights.stage);
  const highlights = config.highlights.regions.map((region) => {
    const box = unionBoxes(region.groups.map((id) => boxOf(byId.get(id)!)));
    return { id: region.id, box, window: [highlightStage + region.window[0], highlightStage + region.window[1]] as const };
  });

  const cameraKeys = config.camera.keys.map((key) => ({ at: resolvePoint(key.point), framing: key.framing, view: key.view }));
  const firstCameraMove = cameraKeys.find((key) => key.framing !== cameraKeys[0].framing || key.view !== cameraKeys[0].view);
  const firstMoves = plans.map((plan) =>
    plan.kind === "smd"
      ? Math.min(config.supply.pull > 0 ? supplyWindow[0] : Infinity, plan.placeWindow[0])
      : plan.kind === "header"
        ? plan.window[0]
        : Infinity,
  );
  const introHoldUntil = Math.min(
    ...firstMoves,
    ...highlights.map((h) => h.window[0]),
    // Kamera, farklı kadrajlı ilk anahtardan önceki anahtardan itibaren hareket eder.
    firstCameraMove ? cameraKeys[cameraKeys.indexOf(firstCameraMove) - 1].at : Infinity,
  );

  return {
    groups: plans,
    boardFloat,
    framingBoxes,
    highlights,
    cameraKeys,
    assembledPosterFrom: resolvePoint(config.assembledPosterFrom),
    supplyWindow,
    placementEnd: Math.max(...[...placeWindows.values()].map((w) => w[1])),
    introHoldUntil,
  };
}

// ——— Değerlendirme (her karede; nesne üretmez) ———

function lerpInto(out: MutableVec3, a: Vec3, b: Vec3, t: number) {
  out[0] = a[0] + (b[0] - a[0]) * t;
  out[1] = a[1] + (b[1] - a[1]) * t;
  out[2] = a[2] + (b[2] - a[2]) * t;
}

function setInto(out: MutableVec3, v: Vec3) {
  out[0] = v[0];
  out[1] = v[1];
  out[2] = v[2];
}

const evalAxis = (axis: FloatAxis, time: number) =>
  axis.amp * (0.65 * Math.sin(axis.w1 * time + axis.f1) + 0.35 * Math.sin(axis.w2 * time + axis.f2));

/** Süzülme farkını (konum ve dönüş) `weight` ile ölçekleyip ekler. */
export function addFloat(params: FloatParams, time: number, weight: number, position: MutableVec3, rotation: MutableVec3): void {
  if (weight <= 0) return;
  for (let k = 0; k < 3; k++) {
    position[k] += evalAxis(params.position[k], time) * weight;
    rotation[k] += evalAxis(params.rotation[k], time) * weight;
  }
}

/** Dağılmış ↔ toplanmış konum (tedarik aşaması). */
function writeBase(plan: FreePlan, gather: number, out: MutableVec3) {
  lerpInto(out, plan.scattered, plan.gathered, gather);
}

const scratchBase: MutableVec3 = [0, 0, 0];

/**
 * Ana poz: `s` aşama koordinatındaki grup konumu ve dönüşü (süzülme hariç).
 * Dönüş değeri grubun serbestliğidir (0–1): süzülme bununla çarpılır. Yerleşmiş grup için
 * 0 döner ve konum tam olarak manifest'teki birleşmiş konumdur, dönüş tam sıfırdır.
 */
export function writeGroupPose(plan: GroupPlan, s: number, position: MutableVec3, rotation: MutableVec3, supplyWindow: Window): number {
  rotation[0] = 0;
  rotation[1] = 0;
  rotation[2] = 0;
  if (plan.kind === "fixed") {
    setInto(position, plan.assembled);
    return 0;
  }

  const window = plan.kind === "smd" ? plan.placeWindow : plan.window;
  const t = progressIn(s, window);
  if (t >= 1) {
    setInto(position, plan.assembled);
    return 0;
  }

  writeBase(plan, easeInOutCubic(progressIn(s, supplyWindow)), scratchBase);
  if (t <= 0) {
    setInto(position, scratchBase);
    setInto(rotation, plan.rotation);
    return 1;
  }

  const share = plan.kind === "smd" ? config.placement.approachShare : config.headerPlacement.approachShare;
  if (t >= share) {
    // Dikey son hareket: aşmasız yavaşlama ile tam son konuma. Dönüş ve süzülme zaten sıfır.
    const from = plan.kind === "smd" ? plan.approach : plan.via;
    lerpInto(position, from, plan.assembled, easeOutCubic((t - share) / (1 - share)));
    return 0;
  }

  // Yaklaşma: dağılmış konumdan hedefin üstündeki (header'da altındaki) noktaya geniş bir yay.
  const u = t / share;
  const h = easeInOutCubic(u);
  const end = plan.kind === "smd" ? plan.approach : plan.via;
  const lift = plan.kind === "smd" ? config.placement.arcLiftM : -config.placement.arcLiftM;
  const controlY = plan.kind === "smd" ? Math.max(scratchBase[1], end[1]) + lift : Math.min(scratchBase[1], end[1]) + lift;
  const k0 = (1 - h) * (1 - h);
  const k1 = 2 * (1 - h) * h;
  const k2 = h * h;
  position[0] = k0 * scratchBase[0] + k1 * (scratchBase[0] + end[0]) * 0.5 + k2 * end[0];
  position[1] = k0 * scratchBase[1] + k1 * controlY + k2 * end[1];
  position[2] = k0 * scratchBase[2] + k1 * (scratchBase[2] + end[2]) * 0.5 + k2 * end[2];

  const release = clamp01(u / config.placement.releaseShare);
  const keep = 1 - smootherstep(release);
  rotation[0] = plan.rotation[0] * keep;
  rotation[1] = plan.rotation[1] * keep;
  rotation[2] = plan.rotation[2] * keep;
  return keep;
}

/** Kontrol/test vurgusunun opaklığı (0–1). */
export function highlightOpacity(highlight: HighlightPlan, s: number): number {
  const [a, b] = highlight.window;
  const fade = (b - a) * config.highlights.fadeShare;
  const fadeIn = smoothstep(clamp01((s - a) / fade));
  const fadeOut = 1 - smoothstep(clamp01((s - (b - fade)) / fade));
  return Math.min(fadeIn, fadeOut);
}

/** `s` için iki kamera anahtarı ve aralarındaki karışım oranı. */
export function cameraBlend(plan: MotionPlan, s: number): { from: number; to: number; t: number } {
  const keys = plan.cameraKeys;
  if (s <= keys[0].at) return { from: 0, to: 0, t: 0 };
  for (let i = 0; i < keys.length - 1; i++) {
    if (s < keys[i + 1].at) {
      const t = smoothstep((s - keys[i].at) / (keys[i + 1].at - keys[i].at));
      return { from: i, to: i + 1, t };
    }
  }
  return { from: keys.length - 1, to: keys.length - 1, t: 0 };
}

// ——— Sağ–sol şerit ———

/** Aşamada kartın bulunduğu taraf: giriş (0) sağda, sonra dönüşümlü. +1 sağ, −1 sol. */
export const stageSide = (stage: number) => (stage % 2 === 0 ? 1 : -1);

/**
 * Şerit değeri (−1 sol … +1 sağ) için sunum: `u` iki yerleşim alanı arasındaki oran,
 * `scale` derinliğe çekilme, `rise` yukarı yay (sahne yüksekliğinin oranı), `bell` geçişin
 * ortasında 1 olan ağırlık. Poster (CSS) ve 3D kamera aynı değerleri kullanır.
 */
export function lanePose(lane: number): { u: number; scale: number; rise: number; bell: number } {
  const bell = 1 - lane * lane;
  return {
    u: (lane + 1) / 2,
    scale: 1 - config.lane.depthDip * bell,
    rise: config.lane.arcRise * bell,
    bell,
  };
}
