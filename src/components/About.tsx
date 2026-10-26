"use client";

import { useRef } from "react";
import { gsap, useScope } from "@/lib/gsap";
import { prefersReducedMotion, revealHeadings, riseIn } from "@/lib/anim";
import { about, site } from "@/data/content";
import Words from "@/components/ui/Words";
import Cover from "@/components/ui/Cover";

export default function About() {
  const root = useRef<HTMLElement>(null);

  useScope(root, () => {
    const el = root.current;
    if (!el) return;
    revealHeadings(el);
    riseIn(el.querySelectorAll(".about__text .js-hide"), el.querySelector(".about__text") as Element);

    if (prefersReducedMotion()) return;
    const frame = el.querySelector<HTMLElement>(".about__frame");
    const inner = el.querySelector<HTMLElement>(".about__inner");
    if (!frame || !inner) return;

    gsap.fromTo(
      frame,
      { clipPath: "inset(100% 0% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: frame, start: "top 86%", once: true },
      },
    );
    gsap.fromTo(
      inner,
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });

  return (
    <section id="about" ref={root} className="section about" data-section="About">
      <div className="about__grid">
        <div className="about__frame js-clip">
          <div className="about__inner">
            {site.portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="about__img" src={site.portrait} alt={`Portrait of ${site.name}`} loading="lazy" />
            ) : (
              <>
                <Cover className="about__img" seed={99} hues={[160, 250]} strands={34} />
                <span className="about__initials" aria-hidden="true">
                  {site.first[0]}
                  {site.last[0]}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="about__text">
          <p className="label js-hide">{about.label}</p>
          <Words as="h2" className="h2" text={about.title} />
          {about.paragraphs.map((p, i) => (
            <p key={i} className="about__p js-hide">
              {p}
            </p>
          ))}
          <dl className="about__facts">
            {about.facts.map((f) => (
              <div key={f.k} className="about__fact js-hide">
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
