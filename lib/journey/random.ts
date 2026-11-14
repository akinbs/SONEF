/**
 * Seed'li, deterministik sayı üreteci (mulberry32). Hareket planı başlangıçta bir kez
 * kurulur; aynı seed her yüklemede, resize'da ve geri kaydırmada aynı dağılımı verir.
 * `Math.random()` bu modülün dışında hareket için kullanılmaz.
 */
export type Random = {
  /** [0, 1) */
  next: () => number;
  /** [min, max) */
  range: (min: number, max: number) => number;
  /** -1 veya 1 */
  sign: () => number;
};

export function createRandom(seed: number): Random {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min, max) => min + (max - min) * next(),
    sign: () => (next() < 0.5 ? -1 : 1),
  };
}

/** Grup kimliğinden türetilen alt seed: bir grubun parametreleri diğer grupların sırasına bağlı olmaz. */
export function seedFor(base: number, id: string): number {
  let h = base ^ 0x9e3779b9;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 0x85ebca6b);
  return (h ^ (h >>> 13)) >>> 0;
}
