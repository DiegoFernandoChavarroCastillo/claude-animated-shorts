// prisioneros · tres siluetas sentadas, de espaldas, con cadenas a los pies y luz de fuego en el borde: gente que solo conoce la pared.
import React from "react";
import { type AssetFC, hash } from "./common";
import { type Pal, lerpHex } from "../palette";

const Back: React.FC<{ x: number; s: number; lean: number; pal: Pal; ph: number; t: number }> = ({ x, s, lean, pal, ph, t }) => (
  <g transform={`translate(${x} 41) scale(${s})`}>
    {(() => null)()}
    <ellipse cx={0} cy={0.5} rx={13} ry={2.4} fill={pal.ink} opacity={0.55} />
    <g transform={`scale(1 ${1 + 0.012 * Math.sin(t * 0.05 + ph)})`}>
      <path d="M-8.5 0 C-9.5 -9 -8.8 -16 -5 -19.5 L5 -19.5 C8.8 -16 9.5 -9 8.5 0 Z" fill={lerpHex(pal.ink, pal.rock, 0.75)} />
      <circle cx={lean} cy={-24.4} r={4.7} fill={lerpHex(pal.ink, pal.rock, 0.75)} />
      <path d="M-5 -19.5 C-8.8 -16 -9.5 -9 -8.5 0" stroke={pal.rim} strokeWidth={1.5} fill="none" opacity={0.95} strokeLinecap="round" />
      <path d={`M${lean - 4.4} -25.6 A4.7 4.7 0 0 1 ${lean + 0.6} -29`} stroke={pal.rim} strokeWidth={1.4} fill="none" opacity={0.95} strokeLinecap="round" />
      <path d="M-7.4 -15 Q-13 -8 -9 -1.5 M7.4 -15 Q13 -8 9 -1.5" stroke={lerpHex(pal.ink, pal.rock, 0.75)} strokeWidth={2.8} fill="none" strokeLinecap="round" />
    </g>
    <path d="M-9 -1.5 L-15 0.4 M9 -1.5 L15 0.4" stroke={pal.skin} strokeWidth={1.1} strokeDasharray="1.2 0.8" fill="none" />
    <circle cx={-15.6} cy={0.5} r={1.5} fill="none" stroke={pal.skin} strokeWidth={0.7} /><circle cx={15.6} cy={0.5} r={1.5} fill="none" stroke={pal.skin} strokeWidth={0.7} />
  </g>
);

export const Prisioneros: AssetFC = ({ pal, t }) => (
  <g>
    {[[18, 1.02, -1.2], [50, 1.12, 0.4], [82, 0.96, 1.4]].map(([x, s, lean], i) => <Back key={i} x={x} s={s} lean={lean} pal={pal} ph={hash(i + 5) * 6} t={t} />)}
  </g>
);
