// fuego · hoguera con troncos cruzados, círculo de piedras, llama en tres capas que oscila y brasas que suben; `flare` la aviva.
import React from "react";
import { type AssetFC, hash } from "./common";

export const Fuego: AssetFC = ({ pal, p, t, flick, seed }) => {
  const id = `fu${seed}`, k = 1 + 0.38 * (p.flare ?? 0), sway = Math.sin(t * 0.21) * 2.2, h = (0.82 + 0.3 * flick) * k;
  const flame = (w: number, hh: number, col: string, dx: number) => (
    <path d={`M${50 - w + dx * 0.5} 74 C${50 - w * 1.1} 56 ${50 - w * 0.3 + sway * 0.4} ${74 - 36 * hh * 0.55} ${50 + sway * dx} ${74 - 52 * hh} C${50 + w * 0.5 + sway * 0.5} ${74 - 36 * hh * 0.55} ${50 + w * 1.1} 56 ${50 + w + dx * 0.5} 74 Z`} fill={col} />
  );
  return (
    <g>
      <defs><radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.55 * k * (0.75 + 0.25 * flick)} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <circle cx={50} cy={58} r={48 * k} fill={`url(#${id}g)`} />
      {[...Array(9)].map((_, i) => { const a = (i / 9) * Math.PI * 2; return <ellipse key={i} cx={50 + Math.cos(a) * 24} cy={79 + Math.sin(a) * 4.8} rx={5.2} ry={3.2} fill={pal.rock} stroke={pal.ink} strokeWidth={0.7} />; })}
      <rect x={28} y={72} width={44} height={6} rx={3} fill="#5A3A22" transform="rotate(-8 50 75)" /><rect x={28} y={72} width={44} height={6} rx={3} fill="#4A2F1B" transform="rotate(10 50 75)" />
      {flame(17, h, "#E8501F", 0)}{flame(12, h * 0.82, pal.rim, 1)}{flame(6.5, h * 0.55, "#FFF1B0", -1)}
      {[...Array(8)].map((_, i) => { const ph = (t * 0.012 * k + hash(i + seed) * 3) % 1; return <circle key={i} cx={50 + Math.sin(ph * 6 + i) * 9 + (hash(i + 8) - 0.5) * 16} cy={62 - ph * 52 * k} r={0.7 + hash(i + 4)} fill={pal.glow} opacity={1 - ph} />; })}
    </g>
  );
};
