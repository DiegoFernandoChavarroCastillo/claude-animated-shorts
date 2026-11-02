// Personajes con el estilo nuevo (plan §4, toon.ts "rediseñar estilo"): sin contorno de tinta, rellenos con
// degradado suave hacia la sombra, trazos de pelo pintados (R2), proporciones realistas simplificadas y sin cara
// detallada (de perfil o de espaldas). La luz viene de arriba a la izquierda del canvas.
import { PALETTE } from "../style";
import { Pen, ellPts, curve, type P2 } from "./pen";

const LIGHT = (-125 * Math.PI) / 180;
const mix = (a: string, b: string, t: number) => {
  const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((A >> s) & 255) * (1 - t) + ((B >> s) & 255) * t).toString(16).padStart(2, "0");
  return `#${ch(16)}${ch(8)}${ch(0)}`;
};
const SHADOW = PALETTE.bg.plum;

/** perro de perfil mirando a la derecha; lienzo de diseño 1000 x 700, patas en y = 680 */
export const DOG = { w: 1000, h: 700, ground: 680 };
export const drawDog = (p: Pen, coat: string = PALETTE.warm.gold, seed = 3) => {
  const dark = mix(coat, SHADOW, 0.55), far = mix(coat, SHADOW, 0.68), cream = mix(coat, PALETTE.light.cream, 0.55);
  const furCols = [mix(coat, PALETTE.light.cream, 0.4), mix(coat, SHADOW, 0.35), mix(coat, PALETTE.warm.brown, 0.5)];
  const shape = (pts: P2[], base = coat, sh = dark, flat = 0.3, furN = 0, dir = 0) => {
    p.poly(pts, p.grad(pts, base, sh, LIGHT, flat));
    if (furN) p.fur(pts, furCols, furN, 26, dir, seed + pts.length);
  };
  const leg = (x0: number, y0: number, x1: number, col: string, knee = 0) => {
    p.taper(curve([x0, y0], [x0 + knee, (y0 + DOG.ground) / 2], [x1, DOG.ground - 22]), 78, 44, col);
    p.ell(x1 + 14, DOG.ground - 14, 34, 16, mix(col, SHADOW, 0.2));
  };
  // patas del lado lejano y cola (detrás del cuerpo)
  leg(330, 440, 318, far, -10); leg(660, 450, 682, far, 8);
  const tail = curve([250, 330], [160, 290], [120, 190]);
  p.taper(tail, 48, 16, p.grad(ellPts(180, 260, 80, 90), coat, dark, LIGHT));
  // cuerpo: tronco en judía, pecho y vientre claro
  const body = ellPts(470, 375, 255, 118, 0, 360, -3);
  shape(body, coat, dark, 0.3, 380, 0.15);
  const belly = ellPts(470, 440, 190, 45, 0, 180, -3);
  p.poly(belly, p.grad(belly, cream, mix(cream, SHADOW, 0.3), Math.PI / 2, 0.1));
  const chest = ellPts(655, 385, 118, 128, 0, 360, 0);
  shape(chest, coat, dark, 0.35, 120, 1.4);
  // cuello y cabeza con hocico
  const neck = ellPts(735, 300, 78, 112, 0, 360, 32);
  shape(neck, coat, dark, 0.35, 90, 1.2);
  const head = ellPts(800, 222, 96, 84, 0, 360, -6);
  shape(head, coat, dark, 0.35, 120, 0.3);
  const snout = ellPts(888, 258, 74, 44, 0, 360, 10);
  shape(snout, mix(coat, PALETTE.light.cream, 0.25), dark, 0.45);
  p.ell(955, 242, 18, 14, SHADOW);                           // trufa
  p.dot(820, 205, 9, SHADOW);                                 // ojo (un punto, sin detalle)
  p.stroke(curve([905, 285], [925, 292], [945, 286]), 5, mix(SHADOW, coat, 0.3)); // boca
  // oreja caída
  const ear = [...curve([742, 160], [705, 210], [722, 318]), ...curve([722, 318], [760, 300], [780, 168])];
  shape(ear, mix(coat, PALETTE.warm.brown, 0.45), mix(coat, SHADOW, 0.7), 0.2, 50, 1.7);
  // patas del lado cercano (delante del cuerpo)
  leg(300, 430, 284, coat, -14); leg(640, 455, 650, coat, 10);
  // collar
  p.stroke(curve([700, 268], [735, 330], [790, 318]), 18, PALETTE.ui.red);
};

/** persona de espaldas, de pie; lienzo 600 x 1000, pies en y = 975 */
export const PERSON = { w: 600, h: 1000, ground: 975 };
export const drawPerson = (p: Pen, jacket = "#4A5F8C", pants: string = PALETTE.bg.night1, hair = "#5A3B2A", skin = "#E8B996", seed = 5) => {
  const sh = (c: string, k = 0.55) => mix(c, SHADOW, k);
  // piernas y zapatos
  for (const [x0, x1] of [[262, 250], [338, 352]] as const) {
    const pts = curve([x0, 600], [x0 + (x1 - x0) * 0.4, 790], [x1, 950]);
    p.taper(pts, 86, 60, p.grad(ellPts(x0, 780, 60, 200), pants, sh(pants, 0.45), LIGHT));
    p.ell(x1, 960, 46, 20, sh(PALETTE.warm.brown, 0.3));
  }
  // brazos (detrás del torso en los hombros)
  for (const [x0, xm, x1] of [[178, 150, 160], [422, 450, 440]] as const) {
    p.taper(curve([x0, 350], [xm, 500], [x1, 640]), 70, 52, p.grad(ellPts(xm, 500, 50, 160), jacket, sh(jacket), LIGHT));
    p.ell(x1, 668, 26, 34, p.grad(ellPts(x1, 668, 26, 34), skin, sh(skin, 0.35), LIGHT));
  }
  // torso: chaqueta con hombros redondeados, pliegues pintados y costura central
  const torso: P2[] = [...curve([170, 360], [205, 318], [300, 312]), ...curve([300, 312], [395, 318], [430, 360]), [405, 625], [195, 625]];
  p.poly(torso, p.grad(torso, jacket, sh(jacket), LIGHT, 0.2));
  p.fur(torso, [mix(jacket, PALETTE.light.cream, 0.2), sh(jacket, 0.3)], 160, 40, Math.PI / 2, seed, 4, 0.18);
  p.stroke([[300, 330], [302, 620]], 4, sh(jacket, 0.4));
  // cuello y cabeza de espaldas: pelo con trazos, orejas a los lados
  p.poly([[276, 250], [324, 250], [328, 330], [272, 330]], p.grad([[276, 250], [324, 330]], skin, sh(skin, 0.35), LIGHT));
  p.ell(229, 222, 14, 24, sh(skin, 0.15)); p.ell(371, 222, 14, 24, sh(skin, 0.3));
  const headPts = ellPts(300, 205, 74, 88);
  p.poly(headPts, p.grad(headPts, hair, sh(hair, 0.5), LIGHT, 0.2));
  p.fur(headPts, [mix(hair, PALETTE.light.cream, 0.3), sh(hair, 0.3), hair], 260, 30, Math.PI / 2 + 0.2, seed + 1, 4, 0.3);
};
