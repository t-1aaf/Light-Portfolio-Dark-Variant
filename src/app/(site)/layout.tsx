import type { ReactNode } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import Aurora from "@/components/Aurora";
import Nav from "@/components/Nav";

/**
 * Chrome for the whole site: smooth scroll, the aurora canvas and the centered nav live here, so
 * every page in this route group gets them.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#work">
        Skip to work
      </a>
      <SmoothScroll />
      <Aurora />
      <Nav />
      {children}
    </>
  );
}
