import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { RefObject } from "react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The mobile URL bar showing and hiding must not re-measure every pin on the page.
ScrollTrigger.config({ ignoreMobileResize: true });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;
/** Wraps a callback so any GSAP animation it creates later is cleaned up with the component. */
export type Safe = <F extends AnyFn>(fn: F) => F;

/**
 * Thin wrapper around useGSAP: runs `setup` once on mount inside a gsap.context,
 * everything created synchronously is reverted on unmount. Use `safe()` for callbacks
 * (event handlers, timers, promises) that create tweens after setup has finished.
 * `setup` may return a cleanup function.
 */
export function useScope(
  scope: RefObject<Element | null>,
  setup: (safe: Safe) => void | (() => void),
) {
  useGSAP(
    (_context, contextSafe) => {
      const safe: Safe = (fn) => (contextSafe ? (contextSafe(fn) as typeof fn) : fn);
      return setup(safe);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { scope: scope as any },
  );
}

export { gsap, ScrollTrigger };
