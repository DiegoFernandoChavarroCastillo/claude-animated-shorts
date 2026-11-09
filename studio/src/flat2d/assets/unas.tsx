// unas · comparación de cerca: a la izquierda una mano humana alzada, vista por el dorso, con sus uñas anchas y planas; a la derecha la pata del
// pollo con dedos escamosos y garras curvas. `compare` hace brillar las uñas de la mano con un contorno dorado y marca ✓ sobre la mano y ✗ sobre
// la pata (se queda): de uñas anchas, mírate las uñas.
import React from "react";
import { type AssetFC, clamp01 } from "./common";
import { lerpHex } from "../palette";

export const Unas: AssetFC = ({ pal, p, t }) => {
  const cp = p.compare ?? 0, glow = clamp01(cp * 2), mark = clamp01(cp * 2 - 1), sway = Math.sin(t * 0.05) * 0.8;
  const skin = pal.skin, skinD = lerpHex(skin, pal.ink, 0.25), nail = lerpHex(pal.wallLit, "#F0B8B0", 0.45), gold = lerpHex(pal.rim, pal.glow, 0.3);
  const leg = lerpHex(pal.rim, "#E8B04A", 0.5), legD = lerpHex(leg, pal.ink, 0.35), claw = lerpHex(pal.ink, pal.rock, 0.3);
  // dedos de la mano: [x de la base, largo, inclinación]
  const fingers: [number, number, number][] = [[14, 22, -10], [22, 27, -3], [30, 28, 2], [38, 24, 8]];
  return (
    <g>
      {/* mano */}
      <g transform={`rotate(${sway} 28 70)`}>
        <path d="M10 74 L12 50 Q14 40 26 40 Q40 40 44 50 L46 74Z" fill={skin} />
        <path d="M44 52 Q52 46 56 38 Q58 34 55 33 Q50 34 46 42" fill={skin} stroke={skinD} strokeWidth={0.5} />
        {fingers.map(([x, l, a], i) => (
          <g key={i} transform={`rotate(${a} ${x + 3.4} 44)`}>
            <rect x={x} y={44 - l} width={7} height={l + 2} rx={3.4} fill={skin} />
            <path d={`M${x + 1} ${44 - l * 0.45} q2.5 1 5 0`} stroke={skinD} strokeWidth={0.5} fill="none" />
            <rect x={x + 1.2} y={44 - l + 1} width={4.6} height={6.4} rx={2} fill={nail} stroke={glow > 0 ? gold : skinD} strokeWidth={0.4 + glow * 0.9} />
            {glow > 0 && <rect x={x - 0.4} y={44 - l - 0.6} width={7.8} height={9.6} rx={3} fill={gold} opacity={0.18 * glow + 0.06 * Math.sin(t * 0.3)} />}
          </g>
        ))}
        <path d="M18 60 Q26 63 36 60" stroke={skinD} strokeWidth={0.6} fill="none" />
      </g>
      {/* pata del pollo */}
      <g transform="translate(74 0)">
        <path d="M0 74 L0 40" stroke={leg} strokeWidth={5} strokeLinecap="round" />
        {[...Array(6)].map((_, i) => <path key={i} d={`M-2.4 ${44 + i * 5} q2.4 1.4 4.8 0`} stroke={legD} strokeWidth={0.6} fill="none" />)}
        {[[10, -40], [16, -10], [12, 25]].map(([l, a], i) => (
          <g key={i} transform={`translate(0 40) rotate(${a + 180})`}>
            <path d={`M0 0 L0 ${l}`} stroke={leg} strokeWidth={3.2} strokeLinecap="round" />
            {[0.3, 0.6].map((k) => <path key={k} d={`M-1.4 ${l * k} l2.8 0`} stroke={legD} strokeWidth={0.5} />)}
            <path d={`M-1.2 ${l + 0.6} Q0 ${l + 6} 2.6 ${l + 7}`} stroke={claw} strokeWidth={1.4} fill="none" strokeLinecap="round" />
          </g>
        ))}
      </g>
      {/* marcas */}
      {mark > 0 && <g opacity={mark}>
        <circle cx={28} cy={8} r={6} fill={lerpHex(pal.ink, pal.rock, 0.2)} /><path d="M25 8 L27.4 10.6 L31.6 5.2" stroke="#7FD47A" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={74} cy={8} r={6} fill={lerpHex(pal.ink, pal.rock, 0.2)} /><path d="M71.4 5.4 L76.6 10.6 M76.6 5.4 L71.4 10.6" stroke="#E05A4A" strokeWidth={1.6} strokeLinecap="round" />
      </g>}
    </g>
  );
};
