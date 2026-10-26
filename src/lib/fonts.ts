let cached: Promise<void> | null = null;

/**
 * Resolves when the webfonts have loaded (or after `timeout` ms, so a blocked font request can
 * never hang the intro). Shared between callers. next/font mangles family names, so instead of
 * loading families by name this waits one frame (so layout has requested them) and then for
 * document.fonts.ready.
 */
export function fontsReady(timeout = 2500): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return Promise.resolve();
  if (cached) return cached;
  const load = new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    .then(() => document.fonts.ready)
    .then(() => undefined);
  const timer = new Promise<void>((resolve) => setTimeout(resolve, timeout));
  cached = Promise.race([load, timer]).catch(() => undefined);
  return cached;
}
