// exterior_sol · el mundo de fuera: cielo, sol con halo, colinas en capas, un árbol, un río y hierba; `sunrise` sube el sol y aclara el cielo.
import React from "react";
import { type AssetFC, lerp } from "./common";
import { lerpHex } from "../palette";

export const ExteriorSol: AssetFC = ({ pal, p, seed, t }) => {
  const id = `es${seed}`, s = p.sunrise ?? 1, sunY = lerp(150, 84, s), top = lerpHex(pal.ink, pal.bg, 0.4 + 0.6 * s), low = lerpHex(pal.wall, pal.wallLit, s);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="0.75" stopColor={low} /></linearGradient>
        <radialGradient id={`${id}h`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.9} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-2} y={0} width={104} height={178} fill={`url(#${id}s)`} />
      <circle cx={50} cy={sunY} r={46} fill={`url(#${id}h)`} opacity={0.5 + 0.5 * s} /><circle cx={50} cy={sunY} r={10.5} fill={pal.accent} /><circle cx={50} cy={sunY} r={7.6} fill="#FFF6D0" />
      <path d="M-2 112 Q18 96 40 108 T78 100 T102 108 L102 178 L-2 178Z" fill={lerpHex(pal.rock, pal.wall, 0.45)} />
      <path d="M-2 126 Q25 108 55 122 T102 116 L102 178 L-2 178Z" fill={pal.rock} />
      <path d="M44 134 Q62 138 54 150 Q40 162 60 178 L82 178 Q56 160 70 148 Q82 138 60 132Z" fill={pal.rim} opacity={0.55} />
      <path d="M-2 150 Q30 142 60 156 T102 150 L102 178 L-2 178Z" fill={lerpHex(pal.rock, pal.ink, 0.15)} />
      <rect x={14.5} y={112} width={3.6} height={26} fill={lerpHex(pal.ink, pal.accent, 0.2)} /><circle cx={16.3} cy={104} r={12} fill={lerpHex(pal.rock, pal.accent, 0.18)} /><circle cx={9.5} cy={110} r={8} fill={lerpHex(pal.rock, pal.ink, 0.25)} /><circle cx={23} cy={110} r={8.5} fill={lerpHex(pal.rock, pal.ink, 0.25)} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${60 + i * 9 + ((t * 0.08 + i * 20) % 30)} ${60 + i * 7} q3 -3 6 0 q3 -3 6 0`} stroke={pal.ink} strokeWidth={0.7} fill="none" opacity={0.7} />)}
    </g>
  );
};
