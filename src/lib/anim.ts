import { gsap } from "./gsap";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isFinePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * Sets the font-size of `el` so its text is `targetWidth` wide (never larger than maxFontSize).
 * Returns the resulting font-size in px. `el` must be inline-block / max-content with white-space: nowrap.
 */
export function fitText(el: HTMLElement, targetWidth: number, maxFontSize = Infinity): number {
  el.style.fontSize = "100px";
  const w = el.offsetWidth || el.getBoundingClientRect().width || 1;
  const size = Math.max(12, Math.min((100 * targetWidth) / w, maxFontSize));
  el.style.fontSize = `${size}px`;
  return size;
}

/** Masked word-by-word rise for every [data-reveal] heading inside `scope`. */
export function revealHeadings(scope: HTMLElement | null) {
  if (!scope || prefersReducedMotion()) return;
  scope.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
    const words = el.querySelectorAll(".sw__i");
    if (!words.length) return;
    gsap.from(words, {
      yPercent: 118,
      duration: 1.15,
      ease: "expo.out",
      stagger: 0.055,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });
}

/**
 * Fade-and-rise for elements marked `.js-hide` (hidden by CSS until JS takes over, so there is no
 * flash of content). Plays once when `trigger` enters the viewport.
 */
export function riseIn(targets: gsap.TweenTarget, trigger: Element, start = "top 82%") {
  if (prefersReducedMotion()) {
    gsap.set(targets, { opacity: 1 });
    return;
  }
  gsap.fromTo(
    targets,
    { y: 36, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.09,
      scrollTrigger: { trigger, start, once: true },
    },
  );
}
