/**
 * Every word on the page lives here. Components contain no copy.
 * Anything marked TODO is a stand-in: replace it with the real thing.
 */

export const site = {
  name: "YOUR NAME",
  first: "YOUR",
  last: "NAME",
  handle: "NAME",
  role: "Designer & full-stack developer",
  location: "Bangladesh · Remote",
  /** IANA zone for the live clock in the footer (Bangladesh is a single zone, UTC+6). */
  timezone: "Asia/Dhaka",
  description:
    "Tariq Hassan is a designer and full-stack developer who designs interfaces and builds the systems behind them.",
  url: "https://tariq-hassan-tiaaf.vercel.app",
  year: 2026,
  /** TODO: your real email. */
  email: "hello@example.com",
  /** TODO: drop a photo in /public (for example /me.jpg) and set it here. Empty = generated portrait. */
  portrait: "",
};

/** Center navbar. `id` must equal the section's DOM id. */
export const nav = {
  items: [
    { label: "Intro", id: "top" },
    { label: "Work", id: "work" },
    { label: "About", id: "about" },
    { label: "Process", id: "process" },
    { label: "Contact", id: "contact" },
  ],
};

export const hero = {
  hintOn: "Click the lamp",
  hintOff: "Light off · click the lamp",
  scroll: "Scroll",
};

export const statement = {
  label: "01 / Intro",
  text: "I design interfaces and build the systems behind them. I like hard problems, tight feedback loops, and the small details most people never notice.",
};

export type Project = {
  id: string;
  title: string;
  blurb: string;
  tags: string[];
  year: string;
  /** Link out (live site, repo, itch.io page). Leave undefined for a non-clickable card. */
  href?: string;
  /** Real screenshot in /public/projects (about 1600x1200). Empty = generated cover. */
  image?: string;
  /** Two hues (0-360) that tint the generated cover. */
  hues: [number, number];
  seed: number;
};

/** TODO: these five are stand-ins. Replace titles, blurbs, links and add screenshots. Newest first. */
export const projects: Project[] = [
  {
    id: "northlight",
    title: "Northlight",
    blurb: "Brand identity and marketing site for a small travel studio.",
    tags: ["Brand", "Design", "Next.js"],
    year: "2026",
    hues: [165, 205],
    seed: 11,
  },
  {
    id: "signal-desk",
    title: "Signal Desk",
    blurb: "A support dashboard that surfaces what needs a human first.",
    tags: ["Product design", "Full-stack", "Python"],
    year: "2026",
    hues: [205, 262],
    seed: 27,
  },
  {
    id: "hollow-keep",
    title: "Hollow Keep",
    blurb: "A small puzzle-action game about a lantern and a very dark castle.",
    tags: ["Game", "Godot", "GDScript"],
    year: "2025",
    hues: [150, 190],
    seed: 41,
  },
  {
    id: "pinewright",
    title: "Pinewright",
    blurb: "A fast, calm storefront for handmade furniture.",
    tags: ["E-commerce", "Next.js", "Stripe"],
    year: "2025",
    hues: [185, 232],
    seed: 58,
  },
  {
    id: "quiet-hours",
    title: "Quiet Hours",
    blurb: "A habit tracker with a Python API and an interface that stays out of the way.",
    tags: ["Web app", "Python", "Design"],
    year: "2024",
    hues: [250, 290],
    seed: 73,
  },
];

export const work = {
  label: "02 / Work",
  title: "Selected work",
};

export const about = {
  label: "03 / About",
  title: "A designer who ships the code.",
  paragraphs: [
    "I’m Tariq, though most people know me as Tiaaf. I’m a designer and full-stack developer working from Bangladesh, mostly remote.",
    "I like to own a product from the first sketch to the deployed build: the interface, the API behind it, and everything awkward in between. Away from client work I build games in Godot, write Python, and chase puzzles and challenges for fun.",
  ],
  facts: [
    { k: "Role", v: "Designer & full-stack developer" },
    { k: "Based", v: "Bangladesh · Remote" },
    { k: "Stack", v: "Next.js, TypeScript, Python, Godot" },
    { k: "Off the clock", v: "Games, puzzles and challenges" },
  ],
};

export const method = {
  label: "04 / Process",
  title: "How a project moves.",
  steps: [
    { n: "01", title: "Listen", text: "Start with the problem, the people it is for, and what “done” looks like." },
    { n: "02", title: "Shape", text: "Sketch, prototype and argue with myself until the shape is right." },
    { n: "03", title: "Build", text: "Ship real code early: typed, tested where it counts, and fast." },
    { n: "04", title: "Refine", text: "Polish the details, measure, and keep improving after launch." },
  ],
};

export const contact = {
  label: "05 / Contact",
  title: "Let’s build something worth switching on.",
  cta: "Say hello",
  /** TODO: real profile links. `#` keeps them inert until you do. */
  links: [
    { label: "GitHub", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "X", href: "#" },
  ],
  clockLabel: "Local time · UTC+6",
  top: "Back to top",
};
