"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollVelocity } from "@/lib/scroll";
import { stage } from "@/lib/stage";
import { prefersReducedMotion, isFinePointer } from "@/lib/anim";

/**
 * A fixed, full-viewport WebGL layer behind the whole page.
 *
 * What it draws: three "silk" ribbons (a bundle of 14 hair-thin strands that pinch and fan as they
 * travel) plus a faint vertical curtain and a little dust. Every one of their paths is a function of
 * the page's scroll position, so the shape of the aurora is literally a function of where you are:
 *
 *   - scroll position  -> angle, offset and phase of each ribbon, and the palette (mint, ice, violet, back to mint)
 *   - scroll velocity  -> a brief brightening while you move, calm when you stop
 *   - hero progress    -> the aurora stays a whisper while the lamp does its sequence, then blooms
 *   - lamp state       -> with the light off the whole stage dims (hero only)
 *   - the last stretch -> the ribbons settle into low horizontal bands under the footer
 *
 * It renders at roughly half resolution (the glow is soft anyway) and is upscaled by CSS.
 */

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform float uEnergy;
uniform float uIntensity;
uniform vec2 uMouse;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// mint -> ice blue -> soft violet -> back to teal, indexed by page progress
vec3 pal(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 a = vec3(0.22, 0.95, 0.74);
  vec3 b = vec3(0.28, 0.58, 1.00);
  vec3 c = vec3(0.62, 0.44, 1.00);
  vec3 d = vec3(0.20, 0.88, 0.82);
  vec3 col = mix(a, b, smoothstep(0.0, 0.33, t));
  col = mix(col, c, smoothstep(0.33, 0.66, t));
  col = mix(col, d, smoothstep(0.66, 1.0, t));
  return col;
}

// One silk ribbon. s = scroll progress, conv = 0..1 how far it has settled into the footer bands.
vec3 ribbon(vec2 p, float seed, float s, float t, float conv) {
  float ang = 0.62 * sin(s * 4.0 + seed * 1.7) + (seed - 2.0) * 0.32;
  ang = mix(ang, 0.05 * (seed - 2.0), conv);
  float ca = cos(ang);
  float sa = sin(ang);

  vec2 off = vec2(0.20 * sin(s * 5.0 + seed * 3.1), 0.20 * cos(s * 4.0 + seed * 2.3) - 0.04 * seed);
  off = mix(off, vec2(0.0, -0.27 + 0.03 * seed), conv);
  vec2 q = mat2(ca, -sa, sa, ca) * (p - off);

  float ph = s * 9.0 + seed * 2.0 + t * 0.10;
  float cy = 0.15 * sin(q.x * 2.2 + ph) + 0.06 * sin(q.x * 4.7 - ph * 1.3 + seed);
  cy *= mix(1.0, 0.35, conv);

  // the bundle pinches and fans along its length
  float width = abs(0.09 + 0.09 * sin(q.x * 1.7 + ph * 0.7 + seed * 5.0)) + 0.012;

  vec3 col = vec3(0.0);
  for (int i = 0; i < 14; i++) {
    float fi = float(i) / 13.0;
    float o = (fi - 0.5) * 2.0 * width;
    float wob = 0.011 * sin(q.x * 9.0 + fi * 12.0 + ph * 1.5);
    float d = abs(q.y - cy - o - wob);

    float core = exp(-d * d * 90000.0);
    float halo = exp(-d * 16.0);

    float b = 0.5 + 0.5 * sin(q.x * 3.0 + fi * 7.0 + ph);
    float n = vnoise(vec2(q.x * 3.0 + t * 0.08, fi * 9.0 + seed * 4.0));
    b = b * (0.4 + 1.1 * n);

    vec3 sc = mix(pal(s), pal(s + 0.24), fi);
    col += sc * (core * b * 0.8 + halo * 0.012 * (0.5 + n));
  }

  // soft body of light around the bundle
  float diff = exp(-pow(abs(q.y - cy) / (width * 2.4 + 0.05), 1.5));
  col += pal(s + 0.1) * diff * 0.06;

  float fade = 1.0 - smoothstep(0.3, 1.5, abs(q.x));
  return col * fade;
}

// faint vertical rays, the classic aurora curtain
vec3 curtain(vec2 p, float s, float t) {
  float x = p.x * 1.2 + 0.3 * sin(s * 6.0);
  float band = 0.5 + 0.5 * sin(x * 1.5 + s * 7.0 + t * 0.04);
  float rays = vnoise(vec2(x * 20.0 + t * 0.15, s * 18.0));
  rays = pow(rays, 2.0);
  float lowE = smoothstep(-0.6, -0.1, p.y);
  float upE = 1.0 - smoothstep(-0.05, 0.6, p.y + 0.15 * sin(x * 3.0 + s * 4.0));
  return pal(s * 0.8 + 0.05 + 0.1 * p.x) * rays * band * lowE * upE * 0.06;
}

float dust(vec2 fc, float t) {
  vec2 g = floor(fc / 2.0);
  float h = hash21(g);
  float tw = 0.55 + 0.45 * sin(t * 1.4 + h * 80.0);
  return step(0.9965, h) * tw;
}

void main() {
  vec2 fc = gl_FragCoord.xy;
  vec2 p = (fc - 0.5 * uRes) / uRes.y;
  p += uMouse * 0.02;

  float s = uScroll;
  float conv = smoothstep(0.86, 1.0, s);

  vec3 c = vec3(0.0);
  c += ribbon(p, 1.0, s, uTime, conv);
  c += ribbon(vec2(p.x + 0.2, -p.y + 0.05), 2.0, s + 0.12, uTime, conv) * 0.7;
  c += ribbon(vec2(p.x * 1.2 - 0.1, p.y * 1.2 + 0.05), 3.0, s * 0.9 + 0.35, uTime, conv) * 0.4;
  c += curtain(p, s, uTime);

  float lum = dot(c, vec3(0.3, 0.55, 0.15));
  c += pal(s) * dust(fc, uTime) * lum * 2.5;

  c *= uIntensity * (0.9 + 0.5 * uEnergy);

  // soft tone-map so overlapping strands glow instead of clipping
  c = vec3(1.0) - exp(-c * 1.1);

  float v = 1.0 - smoothstep(0.15, 1.1, length(p * vec2(0.85, 1.0)));
  c *= mix(0.18, 1.0, v);

  c += vec3(0.008, 0.011, 0.016);
  c += (hash21(fc + fract(uTime) * 91.7) - 0.5) / 128.0;

  gl_FragColor = vec4(c, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[aurora] shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * The two brightness knobs of the dark edition (0..1, 1 = the original build's full strength).
 * BASE is the aurora during the lamp sequence, PEAK is its level for the rest of the page.
 */
const AURORA_BASE = 0.1;
const AURORA_PEAK = 0.4;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function Aurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const fallback = () => {
      canvas.style.display = "none";
    };

    const glMaybe = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!glMaybe) {
      fallback();
      return;
    }
    const gl: WebGLRenderingContext = glMaybe;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      fallback();
      return;
    }
    const prog = gl.createProgram();
    if (!prog) {
      fallback();
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[aurora] program link failed:", gl.getProgramInfoLog(prog));
      fallback();
      return;
    }
    gl.useProgram(prog);

    // one oversized triangle covers the screen
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uScroll = gl.getUniformLocation(prog, "uScroll");
    const uEnergy = gl.getUniformLocation(prog, "uEnergy");
    const uIntensity = gl.getUniformLocation(prog, "uIntensity");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    const reduce = prefersReducedMotion();
    const fine = isFinePointer();

    const sm = { s: 0, e: 0, mx: 0, my: 0, i: reduce ? AURORA_PEAK : AURORA_BASE, t: 12 };
    const mouse = { x: 0, y: 0 };
    let maxScroll = 1;
    let lastW = 0;
    let lastH = 0;

    const measure = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };

    const paint = () => {
      gl.uniform1f(uTime, sm.t);
      gl.uniform1f(uScroll, sm.s);
      gl.uniform1f(uEnergy, sm.e);
      gl.uniform1f(uIntensity, sm.i);
      gl.uniform2f(uMouse, sm.mx, sm.my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = (force = false) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // ignore the mobile URL bar nudging the height around
      if (!force && w === lastW && Math.abs(h - lastH) < 120) return;
      lastW = w;
      lastH = h;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const small = w < 760 || (navigator.hardwareConcurrency || 8) <= 4;
      const scale = dpr * (small ? 0.42 : 0.55);
      const cw = Math.max(2, Math.floor(w * scale));
      const ch = Math.max(2, Math.floor(h * scale));
      canvas.width = cw;
      canvas.height = ch;
      gl.viewport(0, 0, cw, ch);
      gl.uniform2f(uRes, cw, ch);
      measure();
      if (reduce) paint();
    };

    const onResize = () => resize();
    const onMove = (e: PointerEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onLost = (e: Event) => {
      e.preventDefault();
      fallback();
    };

    resize(true);
    window.addEventListener("resize", onResize);
    canvas.addEventListener("webglcontextlost", onLost);

    if (reduce) {
      // A still frame: no ticker, no mouse, no scroll coupling.
      sm.s = 0.3;
      sm.t = 14;
      paint();
      return () => {
        window.removeEventListener("resize", onResize);
        canvas.removeEventListener("webglcontextlost", onLost);
      };
    }

    if (fine) window.addEventListener("pointermove", onMove, { passive: true });
    ScrollTrigger.addEventListener("refresh", measure);

    const draw = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 64);
      const k = (tc: number) => 1 - Math.exp(-dt / tc);

      // 1) where we are on the page
      const target = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      sm.s += (target - sm.s) * k(380);

      // 2) how fast we are moving (quick attack, slow release)
      const v = Math.min(1, Math.abs(scrollVelocity()) / 45);
      sm.e += (v - sm.e) * k(v > sm.e ? 140 : 700);

      // 3) a touch of pointer parallax
      sm.mx += (mouse.x - sm.mx) * k(600);
      sm.my += (mouse.y - sm.my) * k(600);

      // 4) overall brightness: a whisper during the lamp sequence, then a bloom
      const h = stage.hero;
      let intensity = AURORA_BASE + (AURORA_PEAK - AURORA_BASE) * smooth(0.45, 1, h);
      const lampFactor = 0.3 + 0.7 * stage.lit;
      const inHero = 1 - smooth(0.92, 1, h);
      intensity *= 1 - inHero * (1 - lampFactor);
      sm.i += (intensity - sm.i) * k(300);

      sm.t = (sm.t + dt / 1000) % 6000;
      paint();
    };
    gsap.ticker.add(draw);

    return () => {
      gsap.ticker.remove(draw);
      ScrollTrigger.removeEventListener("refresh", measure);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("webglcontextlost", onLost);
    };
  }, []);

  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora__fallback" />
      <canvas ref={canvasRef} className="aurora__canvas" />
    </div>
  );
}
