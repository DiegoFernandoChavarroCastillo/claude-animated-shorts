// Acciones 2D sincronizadas con la voz: las genéricas mueven o deforman una capa; las propias de un asset llegan como progreso `p[nombre]` (0..1).
import type { ActionT2 } from "./timeline";
import { ease } from "./camera";

export type LayerFx = { opacity: number; dx: number; dy: number; scale: number; p: Record<string, number>; params: Record<string, Record<string, unknown>> };
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const GENERIC = ["appear", "vanish", "tremble", "pop", "slide", "scale"];

/** efecto acumulado sobre la capa `key` (su `id` o, si no tiene, el id del asset) en el frame f; W y H en px del cuadro */
export const layerFx = (key: string, acts: ActionT2[], f: number, W: number, H: number): LayerFx => {
  const fx: LayerFx = { opacity: 1, dx: 0, dy: 0, scale: 1, p: {}, params: {} };
  for (const a of acts) {
    if (a.spec.target !== key) continue;
    const s = a.spec as Record<string, unknown>, u = clamp01((f - a.start) / a.dur), t = a.spec.type;
    if (t === "appear") { if (f < a.start) fx.opacity = 0; else fx.scale *= 1 + 0.12 * Math.sin(Math.PI * Math.min(1, u * 1.6)) * (u < 0.62 ? 1 : 0); }
    else if (t === "vanish") fx.opacity *= 1 - ease(u);
    else if (t === "tremble") { if (f >= a.start && u < 1) { const k = (1 - u) * Number(s.amp ?? 6); fx.dx += k * Math.sin(f * 1.9); fx.dy += k * 0.6 * Math.cos(f * 2.3); } }
    else if (t === "pop") fx.scale *= 1 + (Number(s.scale ?? 1.15) - 1) * Math.sin(Math.PI * u);
    else if (t === "slide") { fx.dx += Number(s.dx ?? 0) * W * ease(u); fx.dy += Number(s.dy ?? 0) * H * ease(u); }
    else if (t === "scale") fx.scale *= 1 + (Number(s.to ?? 1) - 1) * ease(u);
    else { fx.p[t] = ease(u); fx.params[t] = s; }   // acción propia del asset
  }
  return fx;
};

export type SceneFx = { flash: number; shakeX: number; shakeY: number; shift: { to: string; u: number } | null };
export const sceneFx = (acts: ActionT2[], f: number): SceneFx => {
  const out: SceneFx = { flash: 0, shakeX: 0, shakeY: 0, shift: null };
  for (const a of acts) {
    const s = a.spec as Record<string, unknown>, u = clamp01((f - a.start) / a.dur), t = a.spec.type;
    if (t === "flash" && f >= a.start) out.flash = Math.max(out.flash, (1 - u) ** 2 * (f < a.start + 3 ? (f - a.start + 1) / 3 : 1));
    if (t === "camshake" && f >= a.start && u < 1) { const k = (1 - u) * Number(s.amp ?? 10); out.shakeX += k * Math.sin(f * 2.1); out.shakeY += k * Math.cos(f * 1.7); }
    if (t === "palette_shift" && f >= a.start) out.shift = { to: String(s.to), u: ease(u) };
  }
  return out;
};
