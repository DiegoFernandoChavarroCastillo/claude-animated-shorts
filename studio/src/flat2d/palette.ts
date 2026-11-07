// Paletas planas del motor 2D: salen de templates/catalog2d.json (un solo sitio); `lerpPal` hace los cambios de paleta (cueva → exterior).
import catalog from "../../../templates/catalog2d.json";

export type Pal = (typeof catalog.palettes)["cueva"];
export const PAL = catalog.palettes as Record<string, Pal>;
export const CATALOG2D = catalog;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const lerpHex = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
};
export const lerpPal = (a: Pal, b: Pal, t: number): Pal =>
  Object.fromEntries(Object.keys(a).map((k) => [k, lerpHex((a as Record<string, string>)[k], (b as Record<string, string>)[k], t)])) as Pal;
export const palette = (name: string): Pal => {
  const p = PAL[name];
  if (!p) throw new Error(`paleta desconocida: ${name}`);
  return p;
};
