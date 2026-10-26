import type Lenis from "lenis";

/** Shared scroll state, written by <SmoothScroll/> and read by the aurora and anchors. */
export const scroll = {
  lenis: null as Lenis | null,
  velocity: 0,
  time: 0,
};

/** Signed scroll velocity, or 0 if the page hasn't scrolled in the last few frames. */
export function scrollVelocity(): number {
  return typeof performance !== "undefined" && performance.now() - scroll.time > 120 ? 0 : scroll.velocity;
}

export function scrollTo(target: string | number | HTMLElement, options: { offset?: number; duration?: number } = {}) {
  const lenis = scroll.lenis;
  if (lenis) {
    lenis.scrollTo(target, {
      offset: options.offset ?? 0,
      duration: options.duration ?? 1.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
    return;
  }
  if (typeof target === "number") {
    window.scrollTo({ top: target });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  el?.scrollIntoView();
}
