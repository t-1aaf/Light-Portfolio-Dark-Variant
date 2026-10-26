"use client";

import { useRef, type CSSProperties } from "react";
import { gsap, useScope } from "@/lib/gsap";
import { prefersReducedMotion, revealHeadings, riseIn } from "@/lib/anim";
import { method } from "@/data/content";
import Words from "@/components/ui/Words";

/**
 * A line of light draws across (down, on small screens) as you scroll, and each step switches on
 * when it reaches it. One number drives it all: the CSS variable --p (0..1) on the steps list.
 * Each step reads it through its own --t (the point at which it comes on); see globals.css.
 */
export default function Process() {
  const root = useRef<HTMLElement>(null);

  useScope(root, () => {
    const el = root.current;
    if (!el) return;
    revealHeadings(el);
    riseIn(el.querySelectorAll(".process__head .js-hide"), el.querySelector(".process__head") as Element);

    const steps = el.querySelector<HTMLElement>(".process__steps");
    if (!steps) return;
    if (prefersReducedMotion()) {
      gsap.set(steps, { "--p": 1 });
      return;
    }
    gsap.fromTo(
      steps,
      { "--p": 0 },
      {
        "--p": 1,
        ease: "none",
        scrollTrigger: { trigger: steps, start: "top 72%", end: "bottom 58%", scrub: 0.5 },
      },
    );
  });

  const n = method.steps.length;

  return (
    <section id="process" ref={root} className="section process" data-section="Process">
      <header className="process__head">
        <p className="label js-hide">{method.label}</p>
        <Words as="h2" className="h2" text={method.title} />
      </header>

      <div className="process__steps">
        <div className="process__rail" aria-hidden="true">
          <div className="process__fill" />
        </div>
        <ol className="process__list">
          {method.steps.map((s, i) => (
            <li key={s.n} className="step" style={{ "--t": (i / n + 0.04).toFixed(3) } as CSSProperties}>
              <span className="step__n">{s.n}</span>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__text">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
