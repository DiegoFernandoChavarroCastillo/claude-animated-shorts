// siria · Oriente al atardecer: sol bajo y grande, una ciudad amurallada con torres y columnatas (Antioquía), palmeras y dunas de arena; el polvo brilla en el aire.
import React from "react";
import { type AssetFC, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const Siria: AssetFC = ({ pal, t, seed }) => {
  const id = `si${seed}`, city = lerpHex(pal.wall, pal.ink, 0.35), sand = lerpHex(pal.wallLit, pal.rock, 0.45);
  const palm = (x: number, y: number, s: number) => (
    <g key={`p${x}`} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 Q2 -14 -1 -28" stroke={pal.ink} strokeWidth={1.6} fill="none" />
      {[-60, -25, 10, 45, 80, 130].map((a) => <path key={a} d={`M-1 -28 q${Math.cos((a * Math.PI) / 180) * 7} ${-4 + Math.sin((a * Math.PI) / 180) * 3} ${Math.cos((a * Math.PI) / 180) * 12} ${4 + Math.sin((a * Math.PI) / 180) * 4}`} stroke={pal.ink} strokeWidth={1.4} fill="none" strokeLinecap="round" />)}
    </g>
  );
  return (
    <g>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.bg} /><stop offset="0.7" stopColor={pal.wall} /><stop offset="1" stopColor={pal.wallLit} /></linearGradient>
        <radialGradient id={`${id}h`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.9} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-2} y={-2} width={104} height={120} fill={`url(#${id}s)`} />
      <circle cx={50} cy={92} r={44} fill={`url(#${id}h)`} /><circle cx={50} cy={92} r={14} fill={pal.glow} opacity={0.95} />
      {/* ciudad */}
      <path d="M2 116 L2 100 L8 100 L8 94 L14 94 L14 100 L30 100 L30 90 L36 90 L36 100 L64 100 L64 92 L70 92 L70 100 L86 100 L86 95 L92 95 L92 100 L98 100 L98 116Z" fill={city} />
      {[...Array(9)].map((_, i) => <rect key={i} x={38 + i * 3} y={102} width={1.2} height={8} fill={lerpHex(city, pal.glow, 0.3)} />)}
      <path d="M37 102 L64 102" stroke={lerpHex(city, pal.glow, 0.3)} strokeWidth={0.8} />
      {[[12, 98, 5], [76, 99, 4]].map(([x, y, r], i) => <path key={i} d={`M${x - r} ${y} A${r} ${r} 0 0 1 ${x + r} ${y}Z`} fill={city} />)}
      <path d="M-2 112 Q20 106 46 114 T102 110 L102 178 L-2 178Z" fill={sand} />
      <path d="M-2 130 Q30 120 60 132 T102 128 L102 178 L-2 178Z" fill={lerpHex(sand, pal.rock, 0.35)} />
      <path d="M-2 152 Q26 142 54 154 T102 150 L102 178 L-2 178Z" fill={lerpHex(sand, pal.ink, 0.35)} />
      <g transform="translate(0 112)"><Grain n={200} w={100} h={66} seed={seed * 11 + 3} a={pal.wallLit} b={pal.ink} rMax={0.7} /></g>
      {palm(10, 120, 1.1)}{palm(18, 124, 0.8)}{palm(88, 122, 1.2)}
      {[...Array(30)].map((_, i) => { const x = (hash(i) * 110 + t * (0.05 + hash(i + 1) * 0.08)) % 110 - 5; return <circle key={`d${i}`} cx={x} cy={60 + hash(i + 3) * 70} r={0.3 + hash(i + 6) * 0.4} fill={pal.glow} opacity={0.35} />; })}
    </g>
  );
};
