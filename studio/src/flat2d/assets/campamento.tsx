// campamento · campamento romano de invierno junto al Danubio, de noche: cielo con estrellas, colinas, el río ancho con placas de hielo, empalizada, filas de tiendas de cuero y hogueras; cae nieve.
import React from "react";
import { type AssetFC, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const Campamento: AssetFC = ({ pal, t, seed, flick }) => {
  const id = `ca${seed}`, tent = lerpHex(pal.rock, pal.rim, 0.2), tentD = lerpHex(pal.rock, pal.ink, 0.35), river = lerpHex(pal.wall, pal.wallLit, 0.25);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.ink} /><stop offset="1" stopColor={pal.wall} /></linearGradient>
        <radialGradient id={`${id}f`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.8} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-2} y={-2} width={104} height={100} fill={`url(#${id}s)`} />
      {[...Array(40)].map((_, i) => <circle key={i} cx={hash(i + seed) * 100} cy={hash(i * 3 + 1) * 80} r={0.2 + hash(i + 7) * 0.45} fill={pal.wallLit} opacity={0.4 + 0.4 * Math.sin(t * 0.05 + i)} />)}
      <circle cx={78} cy={22} r={6} fill={pal.wallLit} opacity={0.85} /><circle cx={80.5} cy={20.5} r={5.2} fill={lerpHex(pal.wall, pal.ink, 0.5)} opacity={0.9} />
      <path d="M-2 90 Q20 76 42 86 T84 80 T102 84 L102 100 L-2 100Z" fill={lerpHex(pal.wall, pal.ink, 0.35)} />
      <rect x={-2} y={96} width={104} height={20} fill={river} />
      {[...Array(10)].map((_, i) => { const x = ((hash(i) * 120 + t * 0.06 * (0.6 + hash(i + 3))) % 120) - 10; return <path key={i} d={`M${x} ${99 + hash(i + 5) * 14} l5 -0.6 l3 1.2 l-6 0.8Z`} fill={pal.wallLit} opacity={0.75} />; })}
      <path d="M-2 116 L102 116 L102 178 L-2 178Z" fill={lerpHex(pal.wallLit, pal.wall, 0.55)} />
      <g transform="translate(0 116)"><Grain n={160} w={100} h={62} seed={seed * 9 + 2} a={pal.wallLit} b={pal.ink} rMax={0.8} /></g>
      {[...Array(26)].map((_, i) => <path key={i} d={`M${i * 4 - 1} 124 L${i * 4 + 1} 116 L${i * 4 + 3} 124Z`} fill={tentD} />)}
      <rect x={-2} y={122} width={104} height={4} fill={tentD} />
      {[[10, 140, 1], [34, 138, 1.1], [60, 140, 1], [86, 138, 1.1], [20, 160, 1.4], [52, 162, 1.5], [84, 160, 1.4]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M-9 0 L0 -10 L9 0Z" fill={tent} /><path d="M0 -10 L9 0 L4 0Z" fill={tentD} /><path d="M-2 0 L0 -5 L2 0Z" fill={pal.ink} />
          <path d="M-9 0 L0 -10" stroke={pal.rim} strokeWidth={0.4} opacity={0.6} /><path d="M0 -10 L0 -12" stroke={tentD} strokeWidth={0.6} />
        </g>))}
      {[[22, 148], [72, 150]].map(([x, y], i) => <g key={`f${i}`}><circle cx={x} cy={y} r={14 + 3 * flick} fill={`url(#${id}f)`} /><path d={`M${x - 2} ${y} Q${x} ${y - 5 - 2 * flick} ${x + 2} ${y}Z`} fill={pal.rim} /></g>)}
      {[...Array(45)].map((_, i) => { const y = ((hash(i + 11) * 178 + t * (0.25 + hash(i) * 0.3)) % 178); return <circle key={`n${i}`} cx={(hash(i + 2) * 100 + Math.sin(t * 0.03 + i) * 3)} cy={y} r={0.35 + hash(i + 4) * 0.5} fill={pal.wallLit} opacity={0.75} />; })}
    </g>
  );
};
