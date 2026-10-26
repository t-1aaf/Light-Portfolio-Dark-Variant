"use client";

import { useRef, useState } from "react";
import { ScrollTrigger, gsap, useScope } from "@/lib/gsap";
import { fontsReady } from "@/lib/fonts";
import { nav } from "@/data/content";

/**
 * Centered floating nav. In-page links are handled globally by <SmoothScroll/> (it scrolls through
 * Lenis), so these are plain anchors. A scroll-spy trigger per section moves the pill.
 * Keep each item's `id` equal to its section's DOM id (see content.ts).
 */
export default function Nav() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useScope(root, (safe) => {
    const el = root.current;
    if (!el) return;
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>("a"));
    const pill = el.querySelector<HTMLElement>(".nav__pill");
    if (!pill) return;

    let current = 0;
    const place = safe((i: number, animate = true) => {
      const a = links[i];
      if (!a) return;
      gsap.to(pill, {
        x: a.offsetLeft,
        width: a.offsetWidth,
        duration: animate ? 0.6 : 0,
        ease: "expo.out",
        overwrite: "auto",
      });
    });

    nav.items.forEach((item, i) => {
      const target = document.getElementById(item.id);
      if (!target) return;
      ScrollTrigger.create({
        trigger: target,
        start: "top 55%",
        end: "bottom 55%",
        // measure after the hero's pin so the first section's range is right
        refreshPriority: -1,
        onToggle: (self) => {
          if (!self.isActive) return;
          current = i;
          setActive(i);
          place(i);
        },
      });
    });

    place(0, false);
    fontsReady().then(() => place(current, false));

    const ro = new ResizeObserver(() => place(current, false));
    ro.observe(el);
    return () => ro.disconnect();
  });

  return (
    <nav ref={root} className="nav" aria-label="Primary">
      <ul className="nav__list">
        <li className="nav__pill" aria-hidden="true" />
        {nav.items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={active === i ? "true" : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
