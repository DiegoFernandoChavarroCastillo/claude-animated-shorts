// Tipos y utilidades comunes de los assets 2D: cada asset dibuja en un lienzo de 100 de ancho x (100 · aspect) de alto.
import type React from "react";
import type { Pal } from "../palette";

export type AssetProps = {
  /** frame global del video y frame desde el inicio del beat */
  t: number; tb: number;
  /** progreso (0..1) de las acciones propias del asset y sus parámetros */
  p: Record<string, number>; params: Record<string, Record<string, unknown>>;
  pal: Pal; light: string;
  /** parpadeo del fuego 0..1 (determinista) y semilla de la capa */
  flick: number; seed: number;
};
export type AssetFC = React.FC<AssetProps>;

/** parpadeo determinista de una llama: suma de senos, entre 0 y 1 */
export const flicker = (f: number) => Math.min(1, Math.max(0, 0.5 + 0.28 * Math.sin(f * 0.31) + 0.17 * Math.sin(f * 0.77 + 1) + 0.1 * Math.sin(f * 1.31 + 2)));
export const hash = (x: number) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); };
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
