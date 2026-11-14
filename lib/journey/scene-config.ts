import { stageAt, type JourneyStageId } from "./stages";

/**
 * Yolculuk sahnesinin tek yapılandırması. Bütün zamanlamalar aşama koordinatıyla
 * (bkz. `stages.ts`) verilir; hareketler `motion-plan.ts` içinde bu değerlerden
 * ve manifest'teki değişmeyen konumlardan hesaplanır.
 *
 * Mesafeler metredir ve modelin kendi (parent) uzayındadır; sunum ölçeği
 * (`recommendedPresentationScale`) yalnızca kök grupta bir kez uygulanır.
 */

type StagePoint = { stage: JourneyStageId; at: number };
type StageWindow = { from: StagePoint; to: StagePoint };

export type CameraFraming = "wide" | "board-with-headers" | "assembled";
export type CameraView = "overview" | "low" | "top";

export type CameraKey = {
  point: StagePoint;
  framing: CameraFraming;
  view: CameraView;
};

export type HighlightRegion = {
  id: string;
  groups: readonly string[];
  /** Kontrol ve test aşaması içindeki görünürlük penceresi (0–1). */
  window: readonly [number, number];
};

export const journeySceneConfig = {
  /** Kartın üst yüzeyi (manifest boundsMm'den): 1,5 mm. */
  boardTopM: 0.0015,

  /**
   * Yerleşmiş en yüksek parça ESP32 modülüdür (üst yüzeyi 4,6 mm). Hareket eden parça
   * kendi yerinin bu kadar üstünde yatay ilerler, sonra dikey iner; böylece
   * yerleşmiş komponentlerin içinden geçmez.
   */
  approachLiftM: 0.0065,

  /** PCB_BASE üst sınırı (lehim maskesi ve baskılar dahil): kart üstü çizimler bunun üstünde kalır. */
  boardSurfaceTopM: 0.0019,

  /**
   * Dağılmış başlangıç: komponentler kartın çevresindeki düzensiz bir 3D hacimde süzülür.
   * Konumlar, başlangıç dönüşleri ve süzülme parametreleri `seed` ile bir kez üretilir
   * (motion-plan.ts); render, kaydırma, resize veya geri kaydırma dağılımı değiştirmez.
   * Tepsi, ızgara, raf veya eşit aralıklı sıra kullanılmaz.
   */
  scatter: {
    seed: 0x50e5_0402,
    /** Örnekleme hacmi, kartın merkezine göre (x: kart genişliği, z: kart uzunluğu yönü). */
    volumeM: { x: [-0.036, 0.036], y: [0.0095, 0.03], z: [-0.042, 0.04] } as const,
    /**
     * Parçanın alt yüzeyi en az bu yükseklikte (kart üstü 1,5 mm). Yaklaşma yolu (`approachLiftM`)
     * bunun altında kaldığı için havadaki parçalar yerleşmiş komponentlerin içinden geçmez.
     */
    minBottomM: 0.0085,
    /** Kartın sınır kutusuna en az uzaklık. */
    boardClearanceM: 0.0035,
    /** Yakın / uzak karışımı: kart kutusuna olan uzaklık aralıkları ve yakın parçaların payı. */
    nearShare: 0.45,
    nearDistanceM: [0.0035, 0.011] as const,
    farDistanceM: [0.011, 0.026] as const,
    /** İki parçanın (dönmüş) kutuları arasındaki en az boşluk; süzülme genliği ayrıca eklenir. */
    gapM: 0.0016,
    attempts: 600,
    /** Hafif başlangıç dönüşü (derece, eksen başına en fazla). Büyük gruplar daha sakin döner. */
    rotationDeg: [6, 24] as const,
    largeRotationDeg: [2, 6] as const,
    /** Bu hacmi (mm³) aşan gruplar "büyük" sayılır (ESP32 modülü, pin header'lar). */
    largeVolumeMm3: 300,
    /**
     * Büyük grupların dağılımı kendi yerlerinin yakınında tutulur: ESP32 modülü kartın üstünde,
     * pin header'lar kartın altında ve yanında süzülür.
     */
    anchors: {
      ESP32_STEP_1: { offsetM: [0.003, 0.0215, -0.007], jitterM: [0.004, 0.003, 0.004] },
      PIN_HEADER_LEFT: { offsetM: [-0.0105, -0.0125, 0.003], jitterM: [0.002, 0.002, 0.004] },
      PIN_HEADER_RIGHT: { offsetM: [0.0115, -0.0105, -0.002], jitterM: [0.002, 0.002, 0.004] },
    } as Record<string, { offsetM: readonly [number, number, number]; jitterM: readonly [number, number, number] }>,
  },

  /**
   * Zamana bağlı süzülme (kaydırmadan bağımsız ikinci katman). Her eksen, oranı irrasyonel iki
   * yavaş sinüsün toplamıdır: düzenli zıplama, mekanik salınım veya tam tur dönüş oluşmaz.
   */
  float: {
    positionAmpM: [0.0005, 0.0013] as const,
    periodS: [6.5, 13] as const,
    rotationAmpDeg: [1.5, 5] as const,
    rotationPeriodS: [8, 17] as const,
    /** Kartın (ve yerleşmiş komponentlerin) bütün olarak süzülmesi. */
    board: {
      positionAmpM: [0.00035, 0.0007] as const,
      periodS: [9, 15] as const,
      rotationAmpDeg: [0.5, 1.1] as const,
    },
    /** Mobil / dokunmatik ekranda yalnızca süzülme için üretilen kare sınırı. */
    coarseMaxFps: 30,
  },

  /**
   * Tedarik: parçalar sıraya girmeden, dağınık düzenini koruyarak kendi yerlerine doğru
   * ölçülü biçimde yaklaşır (yolun `pull` kadarı).
   */
  supply: {
    window: { from: { stage: "pcb-ve-komponent-tedarigi", at: 0.12 }, to: { stage: "pcb-ve-komponent-tedarigi", at: 0.85 } } satisfies StageWindow,
    pull: 0.24,
  },

  /**
   * Dizgi: en uzun aşama. Her SMD grubunun başlangıcı ve süresi seed ile çeşitlenir; türlere
   * göre dalga yoktur. ESP32 modülü son yerleşir.
   */
  placement: {
    stage: "dizgi-islemleri" as JourneyStageId,
    /** Dizgi aşaması içindeki toplam pencere (0–1). */
    window: [0.07, 0.92] as const,
    /** Tek bir parçanın hareket süresi (aşama oranı). */
    durationRange: [0.09, 0.15] as const,
    /** Yol uzunluğuna göre ek süre (aşama oranı / mm). */
    durationPerMm: 0.0016,
    /** Sıradaki başlangıç zamanına eklenen seed'li sapma (aşama oranı). */
    jitter: 0.03,
    lastGroups: ["ESP32_STEP_1"] as const,
    /** Hareketin ne kadarı havadan yaklaşma (yay), ne kadarı dikey iniş. */
    approachShare: 0.64,
    /** Yayın ortasında hedef üstüne eklenen yükseklik. */
    arcLiftM: 0.003,
    /** Serbest süzülme ve başlangıç dönüşü, yaklaşmanın bu oranında sıfıra iner. */
    releaseShare: 0.85,
  },

  /**
   * Pin header'lar: gerçek montaj sırası teyit edilene kadar SMD dizgisinden ayrı,
   * fırınlamanın sonunda kısa bir tamamlanma geçişiyle yerleşir. Üretim sırası
   * netleştiğinde yalnızca bu pencereyi değiştirmek yeterli.
   */
  headerPlacement: {
    groups: ["PIN_HEADER_LEFT", "PIN_HEADER_RIGHT"] as const,
    window: { from: { stage: "firinlama", at: 0.78 }, to: { stage: "kontrol-ve-test", at: 0.18 } } satisfies StageWindow,
    /** Önce kartın altına süzülme, sonra dikey yerleşme. */
    approachShare: 0.55,
    /** Kartın altında, dikey yerleşmenin başladığı mesafe. */
    belowM: 0.0075,
  },

  /** Kontrol ve test: tamamlanmış kartın bölgeleri sırayla, ölçülü çerçevelerle gösterilir. */
  highlights: {
    stage: "kontrol-ve-test" as JourneyStageId,
    regions: [
      { id: "esp32", groups: ["ESP32_STEP_1"], window: [0.22, 0.48] },
      { id: "usb-uart-regulator", groups: ["CP2102_STEP_1", "AMS1173_3V_STEP_1"], window: [0.44, 0.7] },
      { id: "usb-butonlar", groups: ["MICROUSB_STEP_1", "PUSH_BOTTOM_STEP_1", "PUSH_BOTTOM_STEP_2"], window: [0.66, 0.92] },
    ] satisfies HighlightRegion[],
    marginM: 0.0007,
    /** Çerçeve şeridinin kalınlığı (model uzayında). */
    strokeM: 0.0003,
    fadeShare: 0.25,
    color: "#60c1e5",
    maxOpacity: 0.9,
  },

  /**
   * Sakin kamera: anahtarlar arasında yumuşak geçiş, aralarda sabit.
   * - wide: dağılmış, toplanmış ve birleşmiş pozların tamamı (header'lar dahil)
   * - board-with-headers: SMD'ler yerinde, header'lar henüz kartın altında
   * - assembled: tamamlanmış kart
   */
  camera: {
    fovDeg: 24,
    frameFill: 0.92,
    views: {
      overview: [0.65, 1.2, 1],
      low: [0.75, 0.82, 1],
      top: [0.42, 1.55, 0.85],
    } satisfies Record<CameraView, readonly [number, number, number]>,
    keys: [
      { point: { stage: "giris", at: 0 }, framing: "wide", view: "overview" },
      { point: { stage: "dizgi-islemleri", at: 0.9 }, framing: "wide", view: "overview" },
      { point: { stage: "firinlama", at: 0.3 }, framing: "board-with-headers", view: "low" },
      { point: { stage: "firinlama", at: 0.75 }, framing: "board-with-headers", view: "low" },
      { point: { stage: "kontrol-ve-test", at: 0.2 }, framing: "assembled", view: "overview" },
      { point: { stage: "kontrol-ve-test", at: 0.95 }, framing: "assembled", view: "overview" },
      { point: { stage: "paketleme-ve-gonderim", at: 0.45 }, framing: "assembled", view: "top" },
    ] satisfies CameraKey[],
  },

  /**
   * Sağ–sol kompozisyon. Masaüstünde metin bölümleri dönüşümlü yerleşir: giriş metni solda
   * (kart sağda), sonraki bölüm sağda (kart solda)… Kart bir taraftan diğerine, metinler
   * arasındaki ölçülmüş boşlukta (`data-journey-gap`) geniş bir yayla geçer.
   * Yerleşim alanları CSS'te (`journey-section.module.css`, `[data-model-slot]`) tanımlıdır.
   *
   * Karşılıklı yatış: sağdaki görünüm referanstır (kompozisyon dönüşü yok). Solda kompozisyon,
   * kartın merkezinden geçen dikey eksen etrafında, kameranın yatay açısının (az) karşı tarafına
   * gelecek kadar döner: ekranda kartın uzun ekseni ters yöne yatar. Bu gerçek bir 3D dönüştür;
   * geometri aynalanmaz, yazılar düz okunur, parçaların kart üzerindeki yerleri değişmez.
   * Güç (`--lane-mirror`, CSS) 1 iken sol açı −az'dır; mobilde daha küçük bir karşı yatış için
   * 1'in altında tutulur (journey-section.module.css: 0,75).
   */
  lane: {
    /** Geçişin ortasında sunum alanının küçülme oranı (derinliğe çekilme). */
    depthDip: 0.4,
    /**
     * Geçişin ortasında yukarı doğru yay (sahne yüksekliğinin oranı). 0: kart sahnedeki PCB
     * yolunun (ray) üzerinde kalır; yay verilirse kart geçişte yoldan kalkar.
     */
    arcRise: 0,
    /** CSS'te `--lane-mirror` tanımlı değilse kullanılan karşı yatış gücü. */
    defaultMirror: 1,
  },

  /**
   * Kaydırma takibi: 3D sürücüde kritik sönümlemeli yumuşatma (global smooth scroll yok).
   * Zaman sabiti ~0,17 sn → hedefe ~0,5 sn içinde oturur. Kullanıcı kaydırması olmayan
   * sıçramalar (geri gezinme, hash, yeniden ölçüm) ve çok büyük sıçramalar doğrudan eşitlenir.
   */
  scrollSmoothing: {
    timeConstantS: 0.17,
    /** Kullanıcı girdisinden (wheel, dokunma, tuş, işaretçi) sonra yumuşatmanın geçerli olduğu süre. */
    intentWindowMs: 450,
    /** Bu kadar ekran yüksekliğinden büyük sıçrama yumuşatılmaz. */
    maxSmoothJumpViewports: 1.5,
  },

  /**
   * Statik poster geçişi (WebGL yokken veya model yüklenmeden): bu noktadan sonra
   * birleşmiş kart posteri gösterilir.
   */
  assembledPosterFrom: { stage: "dizgi-islemleri", at: 0.95 } satisfies StagePoint,
} as const;

export function resolvePoint(point: StagePoint): number {
  return stageAt(point.stage, point.at);
}

export function resolveWindow(window: StageWindow): readonly [number, number] {
  return [resolvePoint(window.from), resolvePoint(window.to)];
}
