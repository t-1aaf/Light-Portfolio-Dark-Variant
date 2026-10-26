"use client";

import { Fragment, useRef } from "react";
import { gsap, useScope } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/anim";
import { statement } from "@/data/content";

/** The one-sentence introduction. The words light up as you scroll through it. */
export default function Statement() {
  const root = useRef<HTMLElement>(null);
  const words = statement.text.split(" ");

  useScope(root, () => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ws = el.querySelectorAll<HTMLElement>(".st__w");
    const text = el.querySelector<HTMLElement>(".st__text");
    if (!text) return;

    gsap.fromTo(
      ws,
      { opacity: 0.14 },
      {
        opacity: 1,
        ease: "none",
        duration: 1,
        stagger: 0.35,
        scrollTrigger: { trigger: text, start: "top 78%", end: "bottom 48%", scrub: 0.6 },
      },
    );
  });

  return (
    <section id="intro" ref={root} className="section statement" data-section="Intro">
      <p className="label">{statement.label}</p>
      <p className="st__text">
        {words.map((w, i) => (
          <Fragment key={i}>
            <span className="st__w">{w}</span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </p>
    </section>
  );
}
