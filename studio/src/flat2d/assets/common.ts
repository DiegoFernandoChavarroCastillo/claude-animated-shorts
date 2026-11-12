// Tipos y utilidades comunes de los assets 2D: cada asset dibuja en un lienzo de 100 de ancho x (100 · aspect) de alto.
import React from "react";
import type { Pal } from "../palette";

export type AssetProps = {
  /** frame global del video y frame desde el inicio del beat */
  t: number; tb: number;
  /** progreso (0..1) de las acciones propias del asset y sus parámetros */
  p: Record<string, number>; params: Record<string, Record<string, unknown>>;
  pal: Pal; light: string;
  /** parpadeo del fuego 0..1 (determinista) y semilla de la capa */
  flick: number; seed: number;
  /** opciones fijas de la capa (`opts` en el story): vestuario, tipo de partícula… */
  opts?: Record<string, unknown>;
};
/** ¿el video lleva tema visual (D123)? Con tema los assets pintan degradados y luz de borde, y el grano de motas se apaga */
export const LookCtx = React.createContext<{ themed: boolean }>({ themed: false });
export const useThemed = () => React.useContext(LookCtx).themed;
/** movimiento de reposo (D123): respiración, balanceo y parpadeo deterministas por semilla; todo personaje debe moverse algo siempre */
export const idle = (t: number, seed = 0) => {
  const ph = hash(seed + 7) * 6.283, blinkT = (t + Math.floor(hash(seed + 3) * 90)) % (96 + Math.floor(hash(seed + 11) * 50));
  return { breath: Math.sin(t * 0.085 + ph), sway: Math.sin(t * 0.047 + ph * 1.7), bob: Math.sin(t * 0.11 + ph * 0.6), blink: blinkT < 5 ? 1 - Math.abs(blinkT - 2) / 3 : 0 };
};
export type AssetFC = React.FC<AssetProps>;

/** parpadeo determinista de una llama: suma de senos, entre 0 y 1 */
export const flicker = (f: number) => Math.min(1, Math.max(0, 0.5 + 0.28 * Math.sin(f * 0.31) + 0.17 * Math.sin(f * 0.77 + 1) + 0.1 * Math.sin(f * 1.31 + 2)));
export const hash = (x: number) => { const s = Math.sin(x * 12.9898) * 43758.5453; return s - Math.floor(s); };
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
type Widen<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;
/** opción fija de la capa (`opts.k` del story) o su valor por defecto */
export const opt = <T,>(o: Record<string, unknown> | undefined, k: string, d: T): Widen<T> => (o && o[k] !== undefined ? o[k] : d) as Widen<T>;
