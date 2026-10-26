"use client";

import { useRef } from "react";
import { gsap, useScope } from "@/lib/gsap";
import { prefersReducedMotion, revealHeadings, riseIn } from "@/lib/anim";
import { work, type Project } from "@/data/content";
import Words from "@/components/ui/Words";
import Cover from "@/components/ui/Cover";

export default function Work({ projects }: { projects: Project[] }) {
  const root = useRef<HTMLElement>(null);

  useScope(root, () => {
    const el = root.current;
    if (!el) return;
    revealHeadings(el);
    riseIn(el.querySelectorAll(".work__head .js-hide"), el.querySelector(".work__head") as Element);

    const reduce = prefersReducedMotion();
    el.querySelectorAll<HTMLElement>(".card").forEach((card) => {
      const media = card.querySelector<HTMLElement>(".card__media");
      const inner = card.querySelector<HTMLElement>(".card__inner");
      const meta = card.querySelector<HTMLElement>(".card__meta");
      if (!media || !inner || !meta) return;

      if (reduce) {
        gsap.set([media, meta], { clearProps: "all" });
        return;
      }

      // the frame opens like a shutter, once
      gsap.fromTo(
        media,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: card, start: "top 86%", once: true },
        },
      );
      riseIn(meta, card, "top 78%");

      // the picture drifts inside its frame as you pass
      gsap.fromTo(
        inner,
        { yPercent: -7 },
        {
          yPercent: 7,
          ease: "none",
          scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });
  });

  return (
    <section id="work" ref={root} className="section work" data-section="Work">
      <header className="work__head">
        <p className="label js-hide">{work.label}</p>
        <div className="work__title">
          <Words as="h2" className="h2" text={work.title} />
          <p className="work__count js-hide">{String(projects.length).padStart(2, "0")}</p>
        </div>
      </header>

      <ol className="work__grid">
        {projects.map((p, i) => {
          const body = (
            <>
              <div className="card__media js-clip">
                <div className="card__inner">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="card__img" src={p.image} alt={`${p.title}: ${p.blurb}`} loading="lazy" />
                  ) : (
                    <Cover className="card__img" seed={p.seed} hues={p.hues} />
                  )}
                </div>
                <span className="card__no" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="card__meta js-hide">
                <div className="card__row">
                  <h3 className="card__title">{p.title}</h3>
                  <span className="card__year">{p.year}</span>
                </div>
                <p className="card__blurb">{p.blurb}</p>
                <ul className="card__tags">
                  {p.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </>
          );
          return (
            <li key={p.id} className="card">
              {p.href ? (
                <a className="card__link" href={p.href} target="_blank" rel="noreferrer">
                  {body}
                </a>
              ) : (
                <div className="card__link">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
