"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { lanePose, stageSide, traceEase } from "@/lib/journey/motion-plan";
import { journeySceneConfig, resolvePoint, SPLIT_LAYOUT_QUERY } from "@/lib/journey/scene-config";
import { STAGE_COUNT } from "@/lib/journey/stages";
import { journeyStore } from "./journey-store";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Alt alta yerleşimde referans çizgisi, metin alanının bu oranında. */
const STACKED_REFERENCE_RATIO = 0.3;
const ASSEMBLED_POSTER_FROM = resolvePoint(journeySceneConfig.assembledPosterFrom);

let activeDrivers = 0;

type Layout = {
  /** `bounds[i]`: i. aşamanın başladığı kaydırma ilerlemesi (0–1). */
  bounds: number[];
  /**
   * `lanes[k]`: k. adımdan önceki geçiş boşluğunun ilerleme aralığı ve köşe oranı; kart bu
   * aralıkta taraf değiştirir (`traceEase`). Köşe oranı, yolun ortası mümkünse 45° olacak şekilde
   * yerleşim alanları arasındaki yatay mesafeden ve geçişin piksel uzunluğundan hesaplanır.
   */
  lanes: [number, number, number][];
};

/** Sahnedeki yerleşim alanlarının merkezleri (canvasArea koordinatı, px). */
type Slots = { left: number; right: number; y: number; width: number; height: number };

/** Köşe oranı sınırları: çok kısa geçişte de köşe yuvarlak kalır, çok uzunda yol dikleşmez. */
const CORNER_MIN = 0.15;
const CORNER_MAX = 0.6;

function cornerFor(dx: number, length: number): number {
  return Math.min(CORNER_MAX, Math.max(CORNER_MIN, 1 - Math.abs(dx) / Math.max(1, length)));
}

function measureSlots(canvasArea: HTMLElement): Slots | undefined {
  const box = canvasArea.getBoundingClientRect();
  const left = canvasArea.querySelector<HTMLElement>('[data-model-slot="left"]')?.getBoundingClientRect();
  const right = canvasArea.querySelector<HTMLElement>('[data-model-slot="right"]')?.getBoundingClientRect();
  if (!left || !right || box.width === 0) return undefined;
  return {
    left: left.left + left.width / 2 - box.left,
    right: right.left + right.width / 2 - box.left,
    y: left.top + left.height / 2 - box.top,
    width: box.width,
    height: box.height,
  };
}

/** Şerit değerinin (−1 sol … +1 sağ) sahnedeki yatay konumu; 3D kamera ile aynı doğrusal eşleme (lanePose.u). */
const laneX = (lane: number, slots: Slots) => slots.left + (slots.right - slots.left) * ((lane + 1) / 2);

/**
 * Sahnedeki PCB yolu: kartın bütün yolculuk boyunca izlediği yolun kendisi. Yol "ilerleme
 * uzayında" çizilir (y = ilerleme × kaydırma aralığı); sürücü onu her karede kartın altına kaydırır.
 * Geçişler `traceEase` ile aynı geometridir: dikey → parabol köşe (quadratic Bézier) → doğru → köşe → dikey.
 */
function buildTrackPath(layout: Layout, range: number, slots: Slots): { d: string; end: [number, number] } {
  let lane = stageSide(0);
  let x = laneX(lane, slots);
  const parts = [`M${x.toFixed(1)} 0`];
  layout.lanes.forEach(([a, b, c], k) => {
    const to = stageSide(k + 1);
    const x0 = x;
    const x1 = laneX(to, slots);
    const y0 = a * range;
    const h = (b - a) * range;
    const dx = x1 - x0;
    const f = (t: number) => traceEase(t, c);
    const slope = dx / (1 - c); // dx/dt ortada
    const p1 = [x0 + dx * f(c), y0 + c * h];
    const p2 = [x0 + dx * f(1 - c), y0 + (1 - c) * h];
    const q1 = [x0, y0 + (c / 2) * h];
    const q2 = [p2[0] + (c / 2) * slope, p2[1] + (c / 2) * h];
    const n = (v: number) => v.toFixed(1);
    parts.push(
      `V${n(y0)}`,
      `Q${n(q1[0])} ${n(q1[1])} ${n(p1[0])} ${n(p1[1])}`,
      `L${n(p2[0])} ${n(p2[1])}`,
      `Q${n(q2[0])} ${n(q2[1])} ${n(x1)} ${n(y0 + h)}`,
    );
    lane = to;
    x = x1;
  });
  parts.push(`V${range.toFixed(1)}`);
  return { d: parts.join(" "), end: [x, range] };
}

/**
 * Aşama sınırlarını ve sağ–sol geçişlerini sayfadaki gerçek konumlardan ölçer.
 *
 * Her süreç adımı, metninden önce bir geçiş boşluğu (`data-journey-gap`) içerir. Boşluk
 * referans çizgisinden geçerken önceki metin bu çizginin üstünde, sonraki metin altında
 * kalır; kart bu sırada bir taraftan diğerine geçer. Aşama sınırı boşluğun ortasıdır.
 */
function measureLayout(
  root: HTMLElement,
  steps: HTMLElement[],
  start: number,
  end: number,
  split: boolean,
  slots: Slots | undefined,
): Layout {
  const viewport = window.innerHeight;
  const header = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
  const stage = root.querySelector<HTMLElement>("[data-journey-stage]");
  // Yan yana: sahnenin dikey ortası (kartın merkezi). Alt alta: sticky sahnenin altındaki metin alanı.
  const reference = split || !stage
    ? header + (viewport - header) / 2
    : header + stage.offsetHeight + (viewport - header - stage.offsetHeight) * STACKED_REFERENCE_RATIO;
  const range = Math.max(1, end - start);
  const toProgress = (docY: number) => Math.min(1, Math.max(0, (docY - reference - start) / range));

  const bounds = [0];
  const lanes: [number, number, number][] = [];
  const dx = slots ? slots.right - slots.left : 0;
  for (const step of steps) {
    const gap = step.querySelector<HTMLElement>("[data-journey-gap]") ?? step;
    const rect = gap.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const bottom = (gap === step ? top : rect.bottom + window.scrollY);
    const previous = bounds[bounds.length - 1];
    const from = Math.max(toProgress(top), previous);
    const to = Math.max(toProgress(bottom), from + 1e-4);
    lanes.push([from, to, cornerFor(dx, (to - from) * range)]);
    bounds.push(Math.max((from + to) / 2, previous + 1e-4));
  }
  bounds.push(1);

  // Son aşamalar sayfa sonunda sıkışmasın: kartlar kısa olduğunda (alt alta yerleşim) son kartın
  // başı okuma çizgisine ulaşmadan sayfa biter; sınırlar 1'e yığılır ve gösterge bir aşamayı
  // atlar. Her aşamaya sondan geriye doğru en az MIN_STAGE_PX kaydırma payı ayrılır. Yan yana
  // yerleşimde aşamalar bundan çok daha uzun olduğu için sonuç değişmez.
  const minSpan = Math.min(MIN_STAGE_PX / range, 1 / (bounds.length - 1));
  for (let i = bounds.length - 2; i >= 1; i--) {
    if (bounds[i] > bounds[i + 1] - minSpan) {
      bounds[i] = bounds[i + 1] - minSpan;
      const half = Math.min(lanes[i - 1][1] - lanes[i - 1][0], minSpan) / 2;
      lanes[i - 1] = [bounds[i] - half, bounds[i] + half, lanes[i - 1][2]];
    }
  }
  return { bounds, lanes };
}

/** Sayfa sonunda her aşamaya ayrılan en az kaydırma payı (px). */
const MIN_STAGE_PX = 200;

function toCoord(progress: number, bounds: readonly number[]): number {
  if (progress >= 1) return STAGE_COUNT;
  for (let i = 0; i < bounds.length - 1; i++) {
    if (progress < bounds[i + 1]) return i + (progress - bounds[i]) / (bounds[i + 1] - bounds[i]);
  }
  return STAGE_COUNT;
}

/** Şerit değeri (−1 sol … +1 sağ): geçiş boşluklarında yumuşak, aralarda sabit. */
function toLane(progress: number, lanes: readonly [number, number, number][]): number {
  let lane = stageSide(0);
  for (let k = 0; k < lanes.length; k++) {
    const [a, b, c] = lanes[k];
    if (progress <= a) break;
    const from = stageSide(k);
    const to = stageSide(k + 1);
    lane = from + (to - from) * traceEase((progress - a) / (b - a), c);
  }
  return lane;
}

/** Ana sayfa yolculuğunu kaydırmaya bağlar. Görsel bir çıktısı yoktur. */
export function JourneyDriver() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const root = markerRef.current?.closest<HTMLElement>("[data-journey]");
    if (!root) return;
    const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-journey-step]"));
    const canvasArea = root.querySelector<HTMLElement>("[data-canvas-area]") ?? root;
    if (steps.length !== STAGE_COUNT - 1 && process.env.NODE_ENV !== "production") {
      console.warn(`[Journey] ${STAGE_COUNT - 1} süreç adımı bekleniyordu, ${steps.length} bulundu.`);
    }

    // Bütünlük kontrolü: aynı anda yalnızca bir sürücü kurulu olmalı (Strict Mode ve geri gezinme).
    activeDrivers++;
    root.dataset.drivers = String(activeDrivers);

    let currentStep = -1;
    const applyDom = (coord: number, progress: number, lane: number, activeIndex: number) => {
      root.style.setProperty("--journey-progress", progress.toFixed(4));
      // Poster ve parıltı, 3D kamerayla aynı şerit pozunu izler (yalnızca sahne alanında).
      const pose = lanePose(lane);
      canvasArea.style.setProperty("--journey-lane-u", pose.u.toFixed(4));
      canvasArea.style.setProperty("--journey-scale", pose.scale.toFixed(4));
      canvasArea.style.setProperty("--journey-rise", pose.rise.toFixed(4));
      // Doğrulama ve hata ayıklama için okunabilir değerler (CSS'te kullanılmaz).
      root.dataset.coord = coord.toFixed(3);
      root.dataset.lane = lane.toFixed(3);
      root.dataset.poster = coord >= ASSEMBLED_POSTER_FROM ? "assembled" : "exploded";
      const stepIndex = activeIndex - 1;
      if (stepIndex === currentStep) return;
      steps[currentStep]?.removeAttribute("data-current");
      steps[stepIndex]?.setAttribute("data-current", "true");
      currentStep = stepIndex;
    };

    const mm = gsap.matchMedia();
    // gsap.matchMedia işleyiciyi koşullardan en az biri eşleşince çalıştırır; "all" her
    // zaman eşleşir, böylece işleyici yerleşim değiştiğinde yeniden kurulur ama hiç atlanmaz.
    mm.add(
      { reduce: "(prefers-reduced-motion: reduce)", split: SPLIT_LAYOUT_QUERY, any: "all" },
      (context) => {
        const { reduce, split } = context.conditions as { reduce: boolean; split: boolean };

        if (reduce) {
          // Kaydırma sahneyi sürmez; 3D açılırsa tamamlanmış kart statik ve sağda gösterilir.
          journeyStore.setStatic();
          applyDom(STAGE_COUNT, 1, 1, -1);
          root.dataset.motion = "static";
          return () => {
            delete root.dataset.motion;
            journeyStore.reset();
          };
        }

        root.dataset.motion = "scroll";
        let layout: Layout = {
          bounds: [0, ...steps.map((_, i) => (i + 1) / STAGE_COUNT), 1],
          lanes: steps.map((_, i) => [(i + 0.9) / STAGE_COUNT, (i + 1.1) / STAGE_COUNT, 0.3]),
        };
        let range = 1;
        let slots: Slots | undefined;

        // ——— Sahnedeki PCB yolu (ray) ———
        // Yol ilerleme uzayında bir kez çizilir; her karede kartın altına kaydırılır. Kart ve yol
        // aynı (yumuşatılmış) ilerlemeyle sürüldüğü için kart hızlı kaydırmada da yoldan çıkmaz.
        const track = root.querySelector<SVGSVGElement>("[data-journey-track]");
        const trackShift = track?.querySelector<SVGGElement>("[data-track-shift]");
        const trackTraveled = track?.querySelector<SVGRectElement>("[data-track-traveled]");
        const TRACK_MARGIN = 600;
        const renderTrack = () => {
          if (!track || !slots) return;
          const { d, end } = buildTrackPath(layout, range, slots);
          track.querySelectorAll("[data-track-path]").forEach((path) => path.setAttribute("d", d));
          const area = {
            x: String(-TRACK_MARGIN),
            y: String(-TRACK_MARGIN),
            width: String(slots.width + 2 * TRACK_MARGIN),
            height: String(range + 2 * TRACK_MARGIN),
          };
          track.querySelectorAll("[data-track-area]").forEach((el) => {
            for (const [key, value] of Object.entries(area)) el.setAttribute(key, value);
          });
          const startPad = track.querySelector("[data-track-start]");
          startPad?.setAttribute("cx", laneX(stageSide(0), slots).toFixed(1));
          startPad?.setAttribute("cy", "0");
          const endPad = track.querySelector("[data-track-end]");
          endPad?.setAttribute("cx", end[0].toFixed(1));
          endPad?.setAttribute("cy", end[1].toFixed(1));
          trackTraveled?.setAttribute("x", area.x);
          trackTraveled?.setAttribute("y", area.y);
          trackTraveled?.setAttribute("width", area.width);
        };
        const moveTrack = (progress: number) => {
          if (!trackShift || !slots) return;
          const travelled = progress * range;
          trackShift.setAttribute("transform", `translate(0 ${(slots.y - travelled).toFixed(2)})`);
          trackTraveled?.setAttribute("height", (travelled + TRACK_MARGIN).toFixed(2));
        };

        const sync = (progress: number) => {
          const coord = toCoord(progress, layout.bounds);
          const lane = toLane(progress, layout.lanes);
          journeyStore.update(progress, coord, lane);
          applyDom(coord, progress, lane, journeyStore.getActiveIndex());
          moveTrack(progress);
        };

        // ——— Kontrollü yumuşatma ———
        // Kaydırma hedefi doğrudan ölçülür; görünen ilerleme ona kritik sönümlemeyle yaklaşır.
        // Kullanıcı kaydırmasıyla başlamayan sıçramalar (geri gezinme, hash, yeniden ölçüm,
        // ilk kare) beklemeden eşitlenir: sahne başlangıçtan mevcut konuma oynatılmaz.
        const { timeConstantS, intentWindowMs, maxSmoothJumpViewports } = journeySceneConfig.scrollSmoothing;
        let target = 0;
        let shown = 0;
        let synced = false;
        let ticking = false;
        let lastIntent = -Infinity;
        // Dokunmatik: tarayıcının kendi kaydırması (parmak + momentum) zaten akıcıdır. Üstüne ikinci
        // bir yumuşatma eklemek, momentum sırasında yumuşatma ile doğrudan eşitleme arasında gidip
        // gelmeye (titreme) ve kartın sayfanın gerisinde kalmasına yol açıyordu. Son girdi dokunma
        // ise ilerleme doğrudan uygulanır; tekerlek/klavye/işaretçide yumuşatma sürer.
        let touchDriven = false;
        root.dataset.coordTarget = "0.000";

        const stopTicker = () => {
          if (!ticking) return;
          gsap.ticker.remove(tick);
          ticking = false;
        };
        function tick(_time: number, deltaMs: number) {
          const dt = Math.min(deltaMs, 100) / 1000;
          shown += (target - shown) * (1 - Math.exp(-dt / timeConstantS));
          // Yarım pikselden küçük fark: hedefe otur ve dur (uzun süre yetişmeye çalışmaz).
          if (Math.abs(target - shown) * range < 0.5) {
            shown = target;
            stopTicker();
          }
          sync(shown);
        }
        const snap = (progress: number) => {
          stopTicker();
          target = shown = progress;
          synced = true;
          sync(progress);
        };
        const onTarget = (progress: number) => {
          target = progress;
          root.dataset.coordTarget = toCoord(progress, layout.bounds).toFixed(3);
          const jump = Math.abs(target - shown) * range;
          const intended = performance.now() - lastIntent < intentWindowMs;
          if (touchDriven || !synced || jump > window.innerHeight * maxSmoothJumpViewports || (!ticking && !intended)) {
            snap(progress);
            return;
          }
          if (!ticking) {
            ticking = true;
            gsap.ticker.add(tick);
          }
        };

        const markIntent = (event: Event) => {
          lastIntent = performance.now();
          touchDriven = event.type === "touchstart" || event.type === "touchmove";
        };
        const intentEvents = ["wheel", "touchstart", "touchmove", "keydown", "pointerdown"] as const;
        // Yakalama aşaması: ScrollTrigger'ın pencere dinleyicilerinden önce çalışır. Aksi halde
        // wheel ile kaydırma aynı karede işlendiğinde hedef, niyet işaretlenmeden güncellenir ve
        // yumuşatma atlanır.
        intentEvents.forEach((type) => window.addEventListener(type, markIntent, { passive: true, capture: true }));

        const proxy = { progress: 0 };
        gsap.to(proxy, {
          progress: 1,
          ease: "none",
          onUpdate: () => onTarget(proxy.progress),
          scrollTrigger: {
            trigger: root,
            start: 0,
            end: "bottom bottom",
            scrub: true,
            onRefresh: (self) => {
              range = Math.max(1, self.end - self.start);
              slots = canvasArea === root ? undefined : measureSlots(canvasArea);
              layout = measureLayout(root, steps, self.start, self.end, split, slots);
              renderTrack();
              // Yeniden ölçüm (resize, font, yerleşim) yumuşatılmaz.
              snap(self.progress);
              root.dataset.coordTarget = toCoord(self.progress, layout.bounds).toFixed(3);
            },
          },
        });

        return () => {
          stopTicker();
          intentEvents.forEach((type) => window.removeEventListener(type, markIntent, { capture: true }));
          delete root.dataset.motion;
          journeyStore.reset();
        };
      },
    );

    return () => {
      mm.revert();
      activeDrivers--;
      root.dataset.drivers = String(activeDrivers);
    };
  });

  return <span ref={markerRef} hidden />;
}
