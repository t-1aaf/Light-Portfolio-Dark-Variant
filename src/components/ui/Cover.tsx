/**
 * Generated cover art: a bundle of silk strands on a dark ground, in the same language as the
 * aurora. Deterministic per `seed` (so server and client agree), no hooks, no images.
 * Real screenshots simply replace it (set `image` on a project).
 */

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

type Props = { seed: number; hues: [number, number]; strands?: number; className?: string };

export default function Cover({ seed, hues, strands = 28, className }: Props) {
  const r = rng(seed * 9973 + 17);
  const id = `cv${seed}`;

  const base = [120 + r() * 360, 80 + r() * 440, 120 + r() * 360, 80 + r() * 440];
  const fan = [1, 0.3 + r() * 0.2, 1.1 + r() * 0.3, 0.4 + r() * 0.3];
  const spread = 7 + r() * 5;

  const paths = Array.from({ length: strands }, (_, i) => {
    const off = (i - strands / 2) * spread;
    const f = i / (strands - 1);
    const hue = hues[0] + (hues[1] - hues[0]) * f;
    const y = (k: number) => (base[k] + off * fan[k] + (r() - 0.5) * 6).toFixed(1);
    return {
      d: `M -20 ${y(0)} C 220 ${y(1)}, 520 ${y(2)}, 820 ${y(3)}`,
      stroke: `hsl(${hue.toFixed(0)} 80% ${(48 + r() * 16).toFixed(0)}%)`,
      width: (0.7 + r() * 1.1).toFixed(2),
      opacity: (0.22 + r() * 0.5).toFixed(2),
    };
  });

  return (
    <svg
      className={className}
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="38%" r="75%">
          <stop offset="0" stopColor={`hsl(${hues[0]} 50% 6%)`} />
          <stop offset="1" stopColor="#030507" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <rect width="800" height="600" fill={`url(#${id}-bg)`} />
      <g filter={`url(#${id}-blur)`} opacity="0.5" style={{ mixBlendMode: "screen" }}>
        {paths.map((p, i) => (
          <path key={`g${i}`} d={p.d} fill="none" stroke={p.stroke} strokeWidth="3" strokeOpacity={p.opacity} />
        ))}
      </g>
      <g style={{ mixBlendMode: "screen" }}>
        {paths.map((p, i) => (
          <path key={`c${i}`} d={p.d} fill="none" stroke={p.stroke} strokeWidth={p.width} strokeOpacity={p.opacity} />
        ))}
      </g>
    </svg>
  );
}
