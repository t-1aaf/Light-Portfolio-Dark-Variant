"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useScope } from "@/lib/gsap";
import { fitText, prefersReducedMotion } from "@/lib/anim";
import { fontsReady } from "@/lib/fonts";
import { markIntroDone } from "@/lib/intro";
import { stage } from "@/lib/stage";
import { site, hero } from "@/data/content";

/**
 * The lamp.
 *
 * One bar light hangs above the name. It is the only light source on the page:
 *
 *   - ON:  the tube glows, a pool of light falls on the name, and the name is visible only where
 *          that light reaches (a mask, not a fade: the letters are lit by it).
 *   - OFF: the tube goes dark and the name disappears with it. Click the lamp (or press Enter /
 *          Space on it) to switch it. A pull-cord hangs from the middle of the bar.
 *
 * Scrolling pins the hero and plays one scrubbed sequence over about 2.6 screens:
 *
 *   0.00 - 0.30  the bar shrinks and slides to the first letter; the pool tightens, so the far end
 *                of the name falls back into the dark
 *   0.30 - 0.85  the small light glides sideways across the name; letters it has passed stay dimly
 *                lit behind it (the "trail"), so the name is read left to right
 *   0.85 - 1.00  the trail fills in, the name is fully lit, the bar rests at the far end, and the
 *                aurora blooms (see Aurora.tsx / lib/stage.ts)
 *
 * State lives in the plain object `st`. `render()` turns it into pixels with direct style writes
 * (no React renders, no layout reads). Layout is measured only in `layout()`.
 */

type Rig = {
  lit: number; // lamp brightness 0..1 (toggle + flicker)
  w: number; // bar width, px
  x: number; // bar centre offset from the stage centre, px
  spread: number; // half-width of the pool of light on the name, px
  trail: number; // brightness of letters the light has passed, 0..1
  fill: number; // 0..1 how far the trail has completed to "everything lit"
  meta: number; // opacity of the role line
};

type Geo = { W: number; H: number; nw: number; nh: number; nameLeft: number; D: number };

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const toggleRef = useRef<() => void>(() => {});
  const [on, setOn] = useState(true);
  const [touched, setTouched] = useState(false);

  useScope(root, (safe) => {
    const el = root.current;
    if (!el) return;
    const q = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel)!;

    const stageEl = q(".hero__stage");
    const lamp = q(".lamp");
    const glow = q(".lamp__glow");
    const cord = q(".lamp__cord");
    const pool = q(".hero__pool");
    const litWrap = q(".hero__lit");
    const name = q(".name");
    const role = q(".hero__role");
    const cue = q(".hero__scroll");

    const reduce = prefersReducedMotion();
    let dead = false;
    let isOn = true;
    let touchedOnce = false;
    let geo: Geo = { W: 1, H: 1, nw: 1, nh: 1, nameLeft: 0, D: 0 };

    const st: Rig = { lit: 0, w: 0, x: 0, spread: 0, trail: 0, fill: 0, meta: 1 };

    gsap.set([lamp, pool], { xPercent: -50 });
    const setW = gsap.quickSetter(lamp, "width", "px");
    const setX = gsap.quickSetter(lamp, "x", "px");
    const setPoolX = gsap.quickSetter(pool, "x", "px");
    const setPoolS = gsap.quickSetter(pool, "scaleX");

    /* ------------------------------------------------------------------ paint */
    const render = () => {
      const { W, nw, nh, nameLeft, D } = geo;

      setW(st.w);
      setX(st.x);
      setPoolX(st.x);
      setPoolS(Math.max(0.05, (st.spread * 2.3 + st.w) / W));

      glow.style.opacity = String(st.lit);
      pool.style.opacity = String(st.lit * 0.9);
      litWrap.style.opacity = String(st.lit);
      role.style.opacity = String(st.meta);

      // lamp centre in the name's own coordinates (the mask lives on the name)
      const rel = W / 2 + st.x - nameLeft;
      const edge = rel - nw * 0.03;
      const tx = edge + (nw + 160 - edge) * st.fill;
      const tr = st.trail + (1 - st.trail) * st.fill;

      name.style.setProperty("--mx", `${rel.toFixed(1)}px`);
      name.style.setProperty("--my", `${(-D).toFixed(1)}px`);
      name.style.setProperty("--rx", `${st.spread.toFixed(1)}px`);
      name.style.setProperty("--ry", `${(D + nh * 2.2).toFixed(1)}px`);
      name.style.setProperty("--tx", `${tx.toFixed(1)}px`);
      name.style.setProperty("--tr", tr.toFixed(3));

      stage.lit = st.lit;
    };

    /* ----------------------------------------------------------------- layout */
    // The only place that reads layout. Runs on mount, when fonts land, and before every
    // ScrollTrigger refresh (resize / rotate).
    const layout = () => {
      const W = stageEl.clientWidth || window.innerWidth;
      const H = stageEl.clientHeight || window.innerHeight;
      const stacked = W < 640;
      name.classList.toggle("is-stacked", stacked);

      fitText(name, stacked ? W * 0.8 : Math.min(W * 0.9, 1560));
      const nw = name.offsetWidth;
      const nh = name.offsetHeight;

      const nameTop = H * (stacked ? 0.5 : 0.54) - nh / 2;
      name.style.top = `${nameTop}px`;
      role.style.top = `${nameTop + nh + Math.max(18, nh * 0.16)}px`;

      const gap = Math.max(64, Math.min(H * 0.17, 180));
      const lampY = Math.max(76, nameTop - gap);
      stageEl.style.setProperty("--lamp-y", `${lampY}px`);

      // vertical distance from the middle of the tube down to the top of the name
      const D = Math.max(20, nameTop - (lampY + 14));
      geo = { W, H, nw, nh, nameLeft: (W - nw) / 2, D };

      if (reduce) {
        st.w = nw * 0.5;
        st.x = 0;
        st.spread = nw * 1.1;
        st.trail = 0;
        st.fill = 1;
        st.meta = 1;
      }
      render();
    };
    layout();
    ScrollTrigger.addEventListener("refreshInit", layout);

    /* -------------------------------------------------------- scroll sequence */
    if (!reduce) {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=260%",
          scrub: 0.8,
          pin: stageEl,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            stage.hero = self.progress;
          },
          onRefresh: (self) => {
            stage.hero = self.progress;
          },
        },
        onUpdate: render,
      });

      // Only the first tween of each property is a fromTo (its start is the page-load state).
      // Everything after it is a plain .to(), so a later tween never re-applies its own start
      // value on top of an earlier phase and scrubbing back and forth stays consistent.

      // phase 1: smaller, and over to the first letter; the pool tightens around it
      tl.fromTo(
        st,
        { w: () => geo.nw * 0.9, x: 0, spread: () => geo.nw * 1.1 },
        {
          w: () => geo.nw * 0.2,
          x: () => -geo.nw * 0.4,
          spread: () => geo.nw * 0.2,
          duration: 0.3,
          ease: "power2.inOut",
        },
        0,
      );
      tl.to(st, { meta: 0, duration: 0.08 }, 0);

      // phase 2: the small light reads the name left to right, leaving a dim trail
      tl.to(st, { trail: 0.42, duration: 0.06 }, 0.3);
      tl.to(
        st,
        { w: () => geo.nw * 0.13, x: () => geo.nw * 0.4, duration: 0.55, ease: "power1.inOut" },
        0.3,
      );
      tl.to(st, { spread: () => geo.nw * 0.17, duration: 0.55 }, 0.3);

      // phase 3: everything lit, role line returns
      tl.to(st, { fill: 1, duration: 0.15, ease: "power2.out" }, 0.85);
      tl.to(st, { meta: 1, duration: 0.15 }, 0.85);

      // the scroll cue leaves as soon as the visitor does what it asks
      gsap.to(cue, {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "+=12%", scrub: true },
      });
    }

    /* ---------------------------------------------------------------- the light */
    let lightTl: ReturnType<typeof gsap.timeline> | null = null;

    // fluorescent start-up: a few stutters, then steady
    const lightOn = (fast = false) => {
      lightTl?.kill();
      const tl = gsap.timeline({ onUpdate: render });
      if (reduce) {
        tl.to(st, { lit: 1, duration: 0.4, ease: "power1.out" });
      } else {
        tl.to(st, { lit: 0.9, duration: 0.04 })
          .to(st, { lit: 0.04, duration: 0.06 })
          .to(st, { lit: 0.65, duration: 0.05 })
          .to(st, { lit: 0.08, duration: fast ? 0.05 : 0.14 })
          .to(st, { lit: 0.8, duration: 0.04 })
          .to(st, { lit: 0.2, duration: 0.05 })
          .to(st, { lit: 1, duration: fast ? 0.35 : 0.7, ease: "power2.out" });
      }
      lightTl = tl;
    };

    const lightOff = () => {
      lightTl?.kill();
      lightTl = gsap
        .timeline({ onUpdate: render })
        .to(st, { lit: 0, duration: reduce ? 0.3 : 0.26, ease: "power3.in" });
    };

    let demo: ReturnType<typeof gsap.delayedCall> | null = null;

    toggleRef.current = safe(() => {
      touchedOnce = true;
      demo?.kill();
      isOn = !isOn;
      setOn(isOn);
      setTouched(true);
      if (!reduce) {
        gsap.fromTo(
          cord,
          { scaleY: 1 },
          { scaleY: 1.5, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "50% 0%" },
        );
      }
      if (isOn) lightOn(true);
      else lightOff();
    });

    // If nobody has touched the lamp after a few seconds, show once what it does.
    const startDemo = () => {
      if (reduce) return;
      demo = gsap.delayedCall(
        8,
        safe(() => {
          if (touchedOnce || window.scrollY > 40) return;
          isOn = false;
          setOn(false);
          lightOff();
          gsap.delayedCall(
            1.1,
            safe(() => {
              if (touchedOnce) return;
              isOn = true;
              setOn(true);
              lightOn(true);
            }),
          );
        }),
      );
    };

    /* ----------------------------------------------------------------- start up */
    fontsReady().then(
      safe(() => {
        if (dead) return;
        layout();
        ScrollTrigger.refresh();
        markIntroDone();
        lightOn();
        startDemo();
      }),
    );

    return () => {
      dead = true;
      ScrollTrigger.removeEventListener("refreshInit", layout);
      stage.hero = 0;
      stage.lit = 0;
    };
  });

  const label = on ? "Light is on. Press to turn it off." : "Light is off. Press to turn it on.";
  const hint = !touched ? hero.hintOn : on ? "Light on" : hero.hintOff;

  return (
    <section id="top" ref={root} className="hero" data-section="Intro">
      <div className="hero__stage">
        <div className="hero__pool" aria-hidden="true" />

        <button type="button" className="lamp" aria-pressed={on} aria-label={label} onClick={() => toggleRef.current()}>
          <span className="lamp__wire lamp__wire--l" aria-hidden="true" />
          <span className="lamp__wire lamp__wire--r" aria-hidden="true" />
          <span className="lamp__tube" aria-hidden="true" />
          <span className="lamp__glow" aria-hidden="true" />
          <span className="lamp__cord" aria-hidden="true">
            <i className="lamp__bead" />
          </span>
        </button>

        <div className="hero__lit">
          <h1 className="name" aria-label={site.name}>
            <span className="name__w" aria-hidden="true">
              {site.first}
            </span>{" "}
            <span className="name__w" aria-hidden="true">
              {site.last}
            </span>
          </h1>
          <p className="hero__role">{site.role}</p>
        </div>

        <div className="hero__foot">
          <span className="hero__hint">{hint}</span>
          <span className="hero__scroll">
            {hero.scroll}
            <i aria-hidden="true" />
          </span>
          <span className="hero__loc">{site.location}</span>
        </div>
      </div>
    </section>
  );
}
