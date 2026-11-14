/**
 * Ağır 3D sahnenin (≈5,8 MB GLB, ≈508 bin üçgen) nasıl yükleneceğine karar verir.
 *
 * - `auto`: WebGL 2 var ve kısıtlayıcı bir koşul yok; model kendiliğinden yüklenir.
 * - `on-demand`: WebGL 2 var ama ziyaretçi tercihi/bağlantısı/belleği nedeniyle model
 *   ancak "3D Olarak İncele" düğmesine basılınca indirilir.
 * - `unsupported`: WebGL 2 yok; yalnızca poster gösterilir, düğme sunulmaz.
 *
 * Tarayıcının bildirmediği bilgi (Network Information, Device Memory API) kısıt
 * sayılmaz; karar yalnızca gerçekten bildirilen değerlerle verilir.
 */

export type OnDemandReason = "save-data" | "slow-network" | "low-memory" | "reduced-motion";

export type ModelSupport =
  | { kind: "auto" }
  | { kind: "on-demand"; reason: OnDemandReason }
  | { kind: "unsupported" };

/** Yalnızca okuduğumuz alanlar; hepsi tarayıcıya göre bulunmayabilir. */
type NetworkHints = {
  readonly saveData?: unknown;
  readonly effectiveType?: unknown;
};

type NavigatorHints = {
  readonly connection?: NetworkHints;
  readonly deviceMemory?: unknown;
};

/** Desteği sınar ve geçici bağlamı hemen serbest bırakır. */
function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function readHints(): { saveData: boolean; slowNetwork: boolean; lowMemory: boolean } {
  const nav = navigator as Navigator & NavigatorHints;
  const connection = typeof nav.connection === "object" && nav.connection !== null ? nav.connection : undefined;

  const saveData = connection?.saveData === true;
  const effectiveType = connection?.effectiveType;
  const slowNetwork = effectiveType === "slow-2g" || effectiveType === "2g";

  // Yalnızca pozitif, sonlu bir sayı bildirilmişse dikkate alınır.
  const memory = nav.deviceMemory;
  const lowMemory = typeof memory === "number" && Number.isFinite(memory) && memory > 0 && memory < 2;

  return { saveData, slowNetwork, lowMemory };
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function detectModelSupport(): ModelSupport {
  if (!hasWebGL2()) return { kind: "unsupported" };

  const hints = readHints();
  if (hints.saveData) return { kind: "on-demand", reason: "save-data" };
  if (hints.slowNetwork) return { kind: "on-demand", reason: "slow-network" };
  if (hints.lowMemory) return { kind: "on-demand", reason: "low-memory" };
  if (prefersReducedMotion()) return { kind: "on-demand", reason: "reduced-motion" };

  return { kind: "auto" };
}
