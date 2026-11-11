// esclavitud · piezas comunes del video de Epicteto: el amo romano gordo (cabeza con papada y túnica de color) y el esclavo con túnica corta de tela basta.
import React from "react";
import type { Pal } from "../palette";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";

export const cloth = (pal: Pal) => lerpHex(pal.rock, pal.wallLit, 0.32);

/** cabeza del amo: calvo, papada y anillo de grasa; `grin` 0..1 sonrisa cruel; `look` 0..1 entorna los ojos */
export const CabezaAmo: React.FC<{ cx: number; cy: number; r: number; pal: Pal; turn?: number; grin?: number; look?: number; mouth?: number }> = ({ cx, cy, r, pal, turn = 0, grin = 0, look = 0, mouth = 0 }) => (
  <g>
    <ellipse cx={cx + turn * r * 0.2} cy={cy + r * 0.85} rx={r * 0.8} ry={r * 0.42} fill={lerpHex(pal.skin, pal.ink, 0.12)} />
    <Cabeza cx={cx} cy={cy} r={r} pal={pal} turn={turn} bald curls={false} eyesClosed={look * 0.55} mouth={mouth} hair={lerpHex(pal.rock, pal.ink, 0.5)} />
    <ellipse cx={cx - r * 0.55 + turn * r * 0.3} cy={cy + r * 0.3} rx={r * 0.2} ry={r * 0.13} fill={pal.accent} opacity={0.35} />
    <ellipse cx={cx + r * 0.55 + turn * r * 0.3} cy={cy + r * 0.3} rx={r * 0.2} ry={r * 0.13} fill={pal.accent} opacity={0.35} />
    {grin > 0.05 && <path d={`M${cx + turn * r * 0.32 - r * 0.3} ${cy + r * 0.5} Q${cx + turn * r * 0.32} ${cy + r * (0.5 + 0.3 * grin)} ${cx + turn * r * 0.32 + r * 0.32} ${cy + r * 0.46}`} stroke={pal.ink} strokeWidth={r * 0.09} fill="none" strokeLinecap="round" />}
  </g>
);

/** túnica corta de esclavo con cinturón de cuerda; hombros en (cx, top), bajo en `hem` */
export const TunicaEsclavo: React.FC<{ cx: number; top: number; hem: number; w: number; pal: Pal; c?: string }> = ({ cx, top, hem, w, pal, c }) => {
  const col = c ?? cloth(pal), h = hem - top, sh = lerpHex(col, pal.ink, 0.3);
  return (
    <g>
      <path d={`M${cx - w * 0.48} ${top} Q${cx} ${top - h * 0.05} ${cx + w * 0.48} ${top} L${cx + w * 0.56} ${hem} L${cx + w * 0.2} ${hem - h * 0.04} L${cx - w * 0.15} ${hem} L${cx - w * 0.56} ${hem - h * 0.03}Z`} fill={col} />
      {[0.3, 0.55, 0.75].map((k, i) => <path key={i} d={`M${cx - w * 0.4 + k * w * 0.8} ${top + h * 0.5} L${cx - w * 0.42 + k * w * 0.85} ${hem - h * 0.05}`} stroke={sh} strokeWidth={w * 0.03} />)}
      <path d={`M${cx - w * 0.46} ${top + h * 0.45} Q${cx} ${top + h * 0.5} ${cx + w * 0.46} ${top + h * 0.45}`} stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={w * 0.06} fill="none" />
      <path d={`M${cx + w * 0.48} ${top} L${cx + w * 0.56} ${hem}`} stroke={pal.rim} strokeWidth={w * 0.03} opacity={0.5} />
      <rect x={cx - w * 0.12} y={top + h * 0.6} width={w * 0.1} height={w * 0.08} fill={sh} transform={`rotate(15 ${cx} ${top + h * 0.6})`} />
    </g>
  );
};
