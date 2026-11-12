// Kit de sombreado (D123): lo que separa un vector plano de una ilustración con luz. Toda forma grande lleva degradado (luz arriba,
// sombra abajo), todo personaje sombra de contacto y luz de borde, toda fuente de luz su halo. Los ids de los degradados deben ser
// únicos por capa: pásales la `seed` del asset.
import React from "react";
import type { Pal } from "../palette";
import { lerpHex } from "../palette";

export const lite = (c: string, pal: Pal, k = 0.25) => lerpHex(c, pal.wallLit, k);
export const dark = (c: string, pal: Pal, k = 0.3) => lerpHex(c, pal.ink, k);
export const url = (id: string) => `url(#${id})`;

/** degradado vertical (por defecto) u horizontal entre dos o tres colores */
export const Grad: React.FC<{ id: string; a: string; b: string; mid?: string; h?: boolean; at?: number }> = ({ id, a, b, mid, h, at = 0.5 }) => (
  <defs><linearGradient id={id} x1="0" y1="0" x2={h ? 1 : 0} y2={h ? 0 : 1}><stop offset="0" stopColor={a} />{mid ? <stop offset={at} stopColor={mid} /> : null}<stop offset="1" stopColor={b} /></linearGradient></defs>
);
/** degradado de volumen: claro donde da la luz (arriba a la derecha por defecto) y oscuro en el lado contrario */
export const Vol: React.FC<{ id: string; c: string; pal: Pal; k?: number; lx?: number; ly?: number }> = ({ id, c, pal, k = 1, lx = 0.68, ly = 0.22 }) => (
  <defs><radialGradient id={id} cx={lx} cy={ly} r={0.95}><stop offset="0" stopColor={lite(c, pal, 0.3 * k)} /><stop offset="0.55" stopColor={c} /><stop offset="1" stopColor={dark(c, pal, 0.34 * k)} /></radialGradient></defs>
);
/** halo radial: velas, ventanas, luna, puntos de un mapa. Se pinta DEBAJO de la fuente (grande y tenue) y otra vez encima (pequeño e intenso) */
export const Halo: React.FC<{ id: string; cx: number; cy: number; r: number; color: string; a?: number }> = ({ id, cx, cy, r, color, a = 0.7 }) => (
  <g style={{ mixBlendMode: "screen" }}>
    <defs><radialGradient id={id}><stop offset="0" stopColor={color} stopOpacity={a} /><stop offset="0.35" stopColor={color} stopOpacity={a * 0.38} /><stop offset="1" stopColor={color} stopOpacity={0} /></radialGradient></defs>
    <circle cx={cx} cy={cy} r={r} fill={url(id)} />
  </g>
);
/** sombra de contacto bajo los pies o la base de un objeto */
export const ContactShadow: React.FC<{ id: string; cx: number; cy: number; rx: number; ry?: number; a?: number }> = ({ id, cx, cy, rx, ry, a = 0.38 }) => (
  <g>
    <defs><radialGradient id={id}><stop offset="0" stopColor="#000" stopOpacity={a} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient></defs>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry ?? rx * 0.22} fill={url(id)} />
  </g>
);
