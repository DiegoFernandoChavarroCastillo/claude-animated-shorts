// Temas visuales (D123): la dirección de arte de un video (paletas, cielo, acabado) sale de templates/themes2d.json, un solo sitio
// que también leen el validador y la skill. Sin `meta.theme` el motor pinta como antes (los videos ya hechos no cambian).
import themes from "../../../templates/themes2d.json";
import { type Pal, lerpHex } from "./palette";

export type Theme = { sat: number; contrast: number; vignette: number; veil: number; palettes: string[]; lights: string[]; ambient: string[] };
export const THEMES = themes.themes as unknown as Record<string, Theme>;
const SKIES = themes.skies as Record<string, string[]>;

export const themeOf = (name?: string): Theme | null => (name ? THEMES[name] ?? null : null);
/** degradado del cielo [arriba, medio, horizonte] de una paleta; las antiguas (sin cielo propio) lo derivan de sus colores */
export const skyOf = (name: string, pal: Pal): string[] => SKIES[name] ?? [pal.ink, pal.bg, lerpHex(pal.bg, pal.wall, 0.45)];
export const lerpSky = (a: string[], b: string[], t: number) => a.map((c, i) => lerpHex(c, b[i], t));

/** resplandor de escena por luz: opacidad base, parpadeo y dónde nace */
export const SCENE_GLOW: Record<string, { a: number; flick: number; at: string; r: string }> = {
  fuego: { a: 0.18, flick: 0.14, at: "50% 105%", r: "62%" }, sol: { a: 0.2, flick: 0, at: "50% -5%", r: "62%" }, luna: { a: 0.1, flick: 0, at: "50% 0%", r: "62%" },
  dia: { a: 0.22, flick: 0, at: "82% -4%", r: "70%" }, atardecer: { a: 0.3, flick: 0, at: "50% 58%", r: "75%" }, velas: { a: 0.26, flick: 0.1, at: "50% 100%", r: "70%" },
  submarino: { a: 0.28, flick: 0.05, at: "50% -10%", r: "80%" }, foco: { a: 0.34, flick: 0.04, at: "50% 42%", r: "48%" },
};
