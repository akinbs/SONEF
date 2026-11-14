import { STAGE_COUNT } from "@/lib/journey/stages";

/**
 * Kaydırma sürücüsü (GSAP) ile 3D sahne ve aşama göstergesi arasındaki köprü.
 *
 * - `progress` / `coord` her kaydırma güncellemesinde değişir ama React render'ı
 *   tetiklemez; sahne bunları kendi karesinde okur ve yalnızca `invalidate` edilir.
 * - Aktif aşama yalnızca gerçekten değiştiğinde abonelere bildirilir.
 */

type Listener = () => void;

const state = {
  progress: 0,
  coord: 0,
  /** Sağ–sol şerit: +1 kart sağda, −1 solda (ölçülen geçiş boşluklarından). */
  lane: 1,
  activeIndex: 0,
  /** Azaltılmış hareket: kaydırma sahneyi sürmez, tamamlanmış kart gösterilir. */
  isStatic: false,
};

const activeListeners = new Set<Listener>();
const frameListeners = new Set<Listener>();

function setActive(index: number) {
  if (index === state.activeIndex) return;
  state.activeIndex = index;
  activeListeners.forEach((listener) => listener());
}

export const journeyStore = {
  getCoord: () => state.coord,
  getProgress: () => state.progress,
  getLane: () => state.lane,
  getActiveIndex: () => state.activeIndex,
  getIsStatic: () => state.isStatic,

  update(progress: number, coord: number, lane: number) {
    state.progress = progress;
    state.coord = coord;
    state.lane = lane;
    state.isStatic = false;
    setActive(Math.min(STAGE_COUNT - 1, Math.floor(coord)));
    frameListeners.forEach((listener) => listener());
  },

  setStatic() {
    state.progress = 1;
    state.coord = STAGE_COUNT;
    state.lane = 1;
    state.isStatic = true;
    setActive(STAGE_COUNT - 1);
    frameListeners.forEach((listener) => listener());
  },

  reset() {
    state.progress = 0;
    state.coord = 0;
    state.lane = 1;
    state.isStatic = false;
    setActive(0);
  },

  subscribeActive(listener: Listener) {
    activeListeners.add(listener);
    return () => {
      activeListeners.delete(listener);
    };
  },

  /** Sahne, kaydırma değiştiğinde yeniden çizim istemek için kaydolur (`invalidate`). */
  subscribeFrame(listener: Listener) {
    frameListeners.add(listener);
    return () => {
      frameListeners.delete(listener);
    };
  },
};
