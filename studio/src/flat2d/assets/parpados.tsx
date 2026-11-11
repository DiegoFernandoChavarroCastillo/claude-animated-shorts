// parpados · tus propios párpados vistos desde dentro, a pantalla completa: se cierran desde arriba y abajo hasta dejar todo en una penumbra rojiza
// (la luz que atraviesa la piel, con venitas) y se vuelven a abrir. `close` cierra (se queda cerrado); `open` abre (se queda abierto).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const Parpados: AssetFC = ({ pal, p, t, seed }) => {
  const k = clamp01(p.close ?? 0) * (1 - clamp01(p.open ?? 0)), id = `pp${seed}`, mid = 89, gap = (1 - k) * 110;
  if (k <= 0.001) return null;
  const lid = lerpHex(pal.skin, pal.ink, 0.78), edge = lerpHex(pal.skin, pal.ink, 0.6), pulse = 0.5 + 0.5 * Math.sin(t * 0.18);
  const lash = (y: number, dir: number) => [...Array(22)].map((_, i) => <path key={i} d={`M${-6 + i * 5.3} ${y} q${1.5} ${dir * (2.6 + (i % 3))} ${3} ${dir * (3.6 + (i % 2))}`} stroke={pal.ink} strokeWidth={0.7} fill="none" />);
  return (
    <g>
      <defs><radialGradient id={`${id}r`} cx="0.5" cy="0.5" r="0.6"><stop offset="0" stopColor={pal.accent} stopOpacity={0.45 + 0.1 * pulse} /><stop offset="1" stopColor={pal.accent} stopOpacity={0} /></radialGradient></defs>
      <path d={`M-20 -20 L120 -20 L120 ${mid - gap} Q50 ${mid - gap + 10 * (1 - k)} -20 ${mid - gap}Z`} fill={lid} />
      <path d={`M-20 200 L120 200 L120 ${mid + gap} Q50 ${mid + gap - 8 * (1 - k)} -20 ${mid + gap}Z`} fill={lid} />
      {k > 0.97 && <rect x={-20} y={-20} width={140} height={220} fill={lid} />}
      <rect x={-20} y={-20} width={140} height={220} fill={`url(#${id}r)`} opacity={k} />
      {k > 0.6 && [0, 1, 2, 3].map((i) => <path key={i} d={`M${10 + i * 24} ${40 + i * 30} q12 ${-10 + i * 4} 22 4 t18 -6`} stroke={lerpHex(pal.accent, pal.ink, 0.3)} strokeWidth={0.5} fill="none" opacity={(k - 0.6) * 1.2} />)}
      {k > 0.8 && [...Array(14)].map((_, i) => <circle key={`f${i}`} cx={(hash(i + seed) * 120 + t * (0.25 + 0.2 * hash(i * 3))) % 120 - 10} cy={(hash(i * 7 + 2) * 190 - t * (0.15 + 0.15 * hash(i * 5))) % 190} r={3 + 6 * hash(i * 11)} fill={i % 2 ? pal.glow : pal.accent} opacity={0.16 + 0.16 * hash(i * 13)} />)}
      <Grain n={200} w={100} h={178} seed={seed * 3 + 11} a={edge} b={pal.ink} rMax={0.7} />
      {k < 0.97 && <g><path d={`M-20 ${mid - gap} Q50 ${mid - gap + 10 * (1 - k)} 120 ${mid - gap}`} stroke={edge} strokeWidth={2} fill="none" />{lash(mid - gap, 1)}
        <path d={`M-20 ${mid + gap} Q50 ${mid + gap - 8 * (1 - k)} 120 ${mid + gap}`} stroke={edge} strokeWidth={2} fill="none" />{lash(mid + gap, -1)}</g>}
    </g>
  );
};
