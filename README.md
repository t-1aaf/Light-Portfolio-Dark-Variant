# Tariq Hassan: lamp + aurora portfolio (dark edition)

Same site, same copy, same motion as the first build, with the light turned down: on average about 60% darker.
The lamp and the name are still the brightest things on the page; the aurora is now a faint glow behind the
content rather than a feature in its own right. Nothing structural changed, so you can run both side by side.

Dark, minimal portfolio. Next.js 15 (App Router) · TypeScript · GSAP + ScrollTrigger · Lenis · one WebGL shader · plain CSS.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Node 18.18 or newer. Fonts (Instrument Sans, JetBrains Mono) come through `next/font/google`, so the first
`dev`/`build` needs internet.

## Make it yours: one file

Every word lives in **`src/data/content.ts`**. Anything marked `TODO` is a stand-in:

| Replace | Where |
| --- | --- |
| Email, social links | `site.email`, `contact.links` |
| Your photo | drop `me.jpg` in `public/`, set `site.portrait = "/me.jpg"` |
| The five projects | `projects` (title, blurb, tags, `href`; screenshots in `public/projects/` via `image`) |
| About / process copy | `about`, `method` |

## What is on the page

1. **Hero: the lamp.** One bar light hangs above the name. On: the tube glows, light pools on the name, and the
   name is visible only where the light reaches. Off: the tube goes dark and the name disappears. Click the lamp
   (or Tab to it and press Enter/Space) to switch it; a pull-cord hangs from its middle. If nobody touches it
   for 8 seconds it blinks off and on once to show what it does.
2. **Scroll sequence (hero is pinned for about 2.6 screens).**
   `0 to 30%` the bar shrinks and slides to the first letter, the pool tightens, the far end of the name falls into the dark.
   `30 to 85%` the small light glides sideways across the name; letters it has passed stay dimly lit behind it.
   `85 to 100%` the trail fills in, the name is fully lit, the bar rests at the far end, the aurora blooms.
3. **Aurora.** A fixed WebGL layer behind everything. Three silk ribbons (14 hair-thin strands each, pinching and
   fanning) plus a faint curtain and dust. Their shape, angle and palette (mint, ice blue, violet, back to mint) are
   functions of the page's scroll position; scroll speed brightens it briefly; the last stretch settles it into low
   bands under the footer. While the lamp is off the whole hero dims.
4. **Statement** (words light up), **Work** (staggered frames, shutter reveal, drift inside the frame),
   **About**, **Process** (a line of light draws and each step switches on), **Contact** (the lamp returns).
5. **Centered nav** pill with scroll-spy.

## Tuning

| To change | Edit |
| --- | --- |
| Length of the pinned sequence | `end: "+=260%"` in `Hero.tsx` |
| How wide the light starts and ends, how far it glides | the `tl.fromTo` / `tl.to` block in `Hero.tsx` (values are fractions of the name's width) |
| Flicker on start-up | `lightOn()` in `Hero.tsx` |
| Light colour | `--accent` in `globals.css`, plus the `rgba(...)` glows on `.lamp__glow` / `.hero__pool` |
| Aurora palette | `pal()` in `Aurora.tsx` |
| Aurora strength | `AURORA_BASE` (during the lamp sequence) and `AURORA_PEAK` (rest of the page) at the top of `Aurora.tsx`: 0.10 and 0.40 here, 0.14 and 0.62 in the first build |
| Page darkness | `--bg` in `globals.css` (`#030507`), and the near-black floor `vec3(0.008, 0.011, 0.016)` in the shader |
| How much light the lamp throws | the two `rgba(...)` stops in `.hero__pool`, and the `box-shadow` on `.lamp__glow` |
| Aurora cost | render scale in `resize()` (`0.55`, `0.42` on small screens) |

## Files

```
src/data/content.ts      all copy and data
src/app/(site)/          the page and its chrome (smooth scroll, aurora, nav)
src/components/Hero.tsx  the lamp: toggle, flicker, pinned scroll sequence, name mask
src/components/Aurora.tsx  the WebGL shader and its scroll/velocity/hero coupling
src/lib/gsap.ts          the one place GSAP is registered; useScope() wraps useGSAP
src/lib/stage.ts         tiny store the hero writes and the aurora reads
src/app/globals.css      tokens, then one block per section in page order
```

## Behaviour notes

- **Reduced motion:** no pinning, no smooth scroll, no flicker, no blink; the name is simply lit (the lamp still
  toggles, with a plain fade); the aurora is a single still frame.
- **No WebGL:** the aurora layer falls back to two soft CSS gradients.
- **No JS:** everything is visible (hidden start states only apply once `data-js` is set before first paint).
- **Touch:** nothing depends on hover.
- **Accessibility:** the name stays in the DOM as the `h1` while the lamp is off (it is only visually hidden); the
  lamp is a real `button` with `aria-pressed`.
