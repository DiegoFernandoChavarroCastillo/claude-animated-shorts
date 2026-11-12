// Cámara 2D: [cx, cy, zoom] normalizados; cada beat va de `from` a `to` y los sub-planos (shots) barren a otro preset sin corte duro.
import type { BeatT2 } from "./timeline";
import type { Camera2 } from "./schema";

export type Cam = [number, number, number];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ease = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
const mix = (a: Cam, b: Cam, t: number): Cam => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export const preset = (c: Camera2): { from: Cam; to: Cam; smooth: boolean } => {
  const C: Cam = [0.5, 0.5, 1];
  switch (c.preset) {
    case "pull_out": return { from: c.from ?? [0.5, 0.5, 1.25], to: c.to ?? C, smooth: false };
    case "pan_slow": return { from: c.from ?? [0.5, 0.5, 1.1], to: c.to ?? [0.5, 0.5, 1.1], smooth: true };
    case "reveal": return { from: c.from ?? [0.5, 0.5, 1.9], to: c.to ?? C, smooth: true };
    case "hold": return { from: c.from ?? [0.5, 0.5, 1.04], to: c.to ?? [0.51, 0.5, 1.045], smooth: false };
    default: return { from: c.from ?? C, to: c.to ?? [0.5, 0.5, 1.16], smooth: false };   // push_in
  }
};

const BLEND_F = 9;
const outCubic = (u: number) => 1 - (1 - u) ** 3;
/** `soft` (videos con tema, D123): los acercamientos arrancan y frenan suaves en vez de ir a velocidad constante */
const evalSeg = (c: Camera2, a: number, b: number, f: number, soft = false): Cam => {
  const p = preset(c), u = clamp01((f - a) / Math.max(1, b - a));
  if (c.preset === "reveal") return mix(p.from, p.to, outCubic(clamp01(u * 1.6)));   // se abre deprisa y se queda casi quieta
  return mix(p.from, p.to, p.smooth ? ease(u) : soft ? u * 0.55 + ease(u) * 0.45 : u);
};

/** cámara del beat en el frame f (con sub-planos) */
export const camAt = (bt: BeatT2, f: number, soft = false): Cam => {
  const segs = [{ start: bt.a, camera: bt.beat.scene.camera }, ...bt.shots];
  let k = 0;
  segs.forEach((s, i) => { if (f >= s.start) k = i; });
  const end = (i: number) => (i + 1 < segs.length ? segs[i + 1].start : bt.b);
  // micro-deriva continua: la cámara nunca está del todo quieta
  const drift = (c: Cam): Cam => (soft ? [c[0] + 0.0035 * Math.sin(f * 0.021), c[1] + 0.0025 * Math.sin(f * 0.017 + 1), c[2]] : c);
  const cur = evalSeg(segs[k].camera, segs[k].start, end(k), f, soft);
  if (k === 0) return drift(cur);
  const t = clamp01((f - segs[k].start) / BLEND_F);
  return drift(t >= 1 ? cur : mix(evalSeg(segs[k - 1].camera, segs[k - 1].start, end(k - 1), segs[k].start, soft), cur, ease(t)));
};
