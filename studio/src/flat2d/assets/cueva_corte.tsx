// cueva_corte · el interior de la cueva: techo con estalactitas, paredes y suelo de roca, y un resplandor lejano arriba que insinúa la salida.
import React from "react";
import { type AssetFC, hash } from "./common";

const jag = (seed: number, n: number, x0: number, x1: number, base: number, amp: number) =>
  [...Array(n + 1)].map((_, i) => `${(x0 + ((x1 - x0) * i) / n).toFixed(1)} ${(base + amp * hash(seed + i * 1.7)).toFixed(1)}`);

export const CuevaCorte: AssetFC = ({ pal, seed, flick }) => {
  const id = `cc${seed}`, ceil = jag(3, 12, 0, 100, 16, 14), floor = jag(9, 12, 0, 100, 150, 9);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}x`} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor={pal.glow} stopOpacity={0.42} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.rock} /><stop offset="1" stopColor={pal.ink} /></linearGradient>
      </defs>
      <rect x={-2} y={0} width={104} height={178} fill={pal.bg} />
      <ellipse cx={50} cy={30} rx={34} ry={20} fill={`url(#${id}x)`} />
      <path d={`M-2 -2 L102 -2 L102 ${ceil[12].split(" ")[1]} L${[...ceil].reverse().join(" L")} L-2 ${ceil[0].split(" ")[1]} Z`} fill={pal.ink} />
      {[...Array(9)].map((_, i) => { const x = 6 + i * 11 + hash(i + 40) * 4, h = 5 + hash(i + 50) * 13, y = 16 + 12 * hash(i + 3.4); return <path key={i} d={`M${x - 3} ${y} L${x} ${y + h} L${x + 3} ${y}Z`} fill={pal.ink} />; })}
      <path d="M-2 14 L10 20 L7 70 L12 120 L-2 150 Z" fill={pal.rock} /><path d="M102 14 L90 20 L94 78 L88 122 L102 150 Z" fill={pal.rock} />
      <path d="M-2 14 L6 18 L3 60 L-2 70Z M102 14 L95 18 L98 66 L102 74Z" fill={pal.ink} opacity={0.7} />
      <path d={`M-2 178 L-2 ${floor[0].split(" ")[1]} L${floor.join(" L")} L102 178 Z`} fill={`url(#${id}f)`} />
      {[...Array(7)].map((_, i) => <ellipse key={i} cx={8 + hash(i + 70) * 84} cy={158 + hash(i + 71) * 16} rx={2 + hash(i + 72) * 3} ry={1 + hash(i + 73)} fill={pal.ink} opacity={0.55} />)}
      {[...Array(10)].map((_, i) => { const l = i % 2 === 0, y = 24 + i * 12 + hash(i + 80) * 6, w = 4 + hash(i + 81) * 6; return <path key={i} d={l ? `M-2 ${y} L${w} ${y + 3} L${w * 0.6} ${y + 14} L-2 ${y + 12}Z` : `M102 ${y} L${100 - w} ${y + 3} L${100 - w * 0.6} ${y + 14} L102 ${y + 12}Z`} fill={pal.wallLit} opacity={0.16} />; })}
      {[...Array(8)].map((_, i) => <path key={i} d={`M${hash(i + 90) * 100} ${156 + hash(i + 91) * 20} l${4 + hash(i + 92) * 8} ${-2 + hash(i) * 3}`} stroke={pal.wallLit} strokeWidth={0.6} opacity={0.25} />)}
      <ellipse cx={50} cy={176} rx={60} ry={14} fill={pal.glow} opacity={0.05 + 0.05 * flick} />
    </g>
  );
};
