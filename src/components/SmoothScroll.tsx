"use client";

import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scroll, scrollTo } from "@/lib/scroll";
import { fontsReady } from "@/lib/fonts";
import { prefersReducedMotion } from "@/lib/anim";
import { useIsoLayoutEffect } from "@/lib/useIso";

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis always agree on where
 * the page is. Also handles in-page #anchor links and flags the document as "ready" so the CSS-only
 * fallbacks (which un-hide content if JS never arrives) stand down. Renders nothing.
 */
export default function SmoothScroll() {
  useIsoLayoutEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.setAttribute("data-ready", "");

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      const hash = a?.getAttribute("href");
      if (!a || !hash || hash === "#") return;
      e.preventDefault();
      scrollTo(hash === "#top" ? 0 : hash);
    };
    document.addEventListener("click", onClick);

    // Layout depends on the webfonts, so re-measure every trigger once they land.
    fontsReady().then(() => ScrollTrigger.refresh());

    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    if (!prefersReducedMotion()) {
      const instance = new Lenis({ lerp: 0.09 });
      lenis = instance;
      scroll.lenis = instance;
      instance.on("scroll", (l: Lenis) => {
        scroll.velocity = l.velocity;
        scroll.time = performance.now();
        ScrollTrigger.update();
      });
      tick = (time: number) => instance.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    return () => {
      document.removeEventListener("click", onClick);
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      scroll.lenis = null;
    };
  }, []);

  return null;
}
