"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useScope } from "@/lib/gsap";
import { prefersReducedMotion, revealHeadings, riseIn } from "@/lib/anim";
import { contact, site } from "@/data/content";
import Words from "@/components/ui/Words";

/**
 * The lamp comes back at the end: a bar light switches on above the closing line as the section
 * scrolls in (one scrubbed CSS variable, --on), then the page settles into the footer.
 */
export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const [time, setTime] = useState("");

  useScope(root, () => {
    const el = root.current;
    if (!el) return;
    revealHeadings(el);
    riseIn(el.querySelectorAll(".contact__body .js-hide"), el.querySelector(".contact__body") as Element, "top 85%");

    const foot = el.querySelector<HTMLElement>(".contact__foot");
    if (foot) riseIn(foot, foot, "top 98%");

    const lamp = el.querySelector<HTMLElement>(".contact__lamp");
    if (!lamp) return;
    if (prefersReducedMotion()) {
      gsap.set(lamp, { "--on": 1 });
      return;
    }
    gsap.fromTo(
      lamp,
      { "--on": 0 },
      {
        "--on": 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "top 25%", scrub: 0.6 },
      },
    );
  });

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: site.timezone,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer id="contact" ref={root} className="section contact" data-section="Contact">
      <div className="contact__lamp" aria-hidden="true">
        <span className="contact__pool" />
        <span className="contact__bar" />
      </div>

      <div className="contact__body">
        <p className="label js-hide">{contact.label}</p>
        <Words as="h2" className="contact__title" text={contact.title} />
        <a className="contact__mail js-hide" href={`mailto:${site.email}`}>
          <span>{site.email}</span>
          <i aria-hidden="true">↗</i>
        </a>
      </div>

      <div className="contact__foot js-hide">
        <ul className="contact__links">
          {contact.links.map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="contact__time">
          {contact.clockLabel} <span suppressHydrationWarning>{time}</span>
        </p>
        <p className="contact__copy">
          © {site.year} {site.name}
        </p>
        <a className="contact__top" href="#top">
          {contact.top} ↑
        </a>
      </div>
    </footer>
  );
}
