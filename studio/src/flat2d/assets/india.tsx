// india · la India al atardecer: cielo cálido, sol bajo, colinas, un río ancho, palmeras y una gran higuera de Bengala (banyan) con raíces colgantes; tierra rojiza.
import React from "react";
import { type AssetFC, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const India: AssetFC = ({ pal, t, seed }) => {
  const id = `in${seed}`, leaf = lerpHex(pal.rock, pal.ink, 0.35), earth = lerpHex(pal.wall, pal.rock, 0.4), river = lerpHex(pal.wallLit, pal.wall, 0.35);
  const palm = (x: number, y: number, s: number) => (
    <g key={`p${x}`} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 Q3 -14 1 -28" stroke={leaf} strokeWidth={1.4} fill="none" />
      {[-60, -20, 20, 60, 110, 150].map((a) => <path key={a} d={`M1 -28 q${Math.cos((a * Math.PI) / 180) * 6} ${-3 + Math.sin((a * Math.PI) / 180) * 3} ${Math.cos((a * Math.PI) / 180) * 11} ${4 + Math.sin((a * Math.PI) / 180) * 4}`} stroke={leaf} strokeWidth={1.4} fill="none" strokeLinecap="round" />)}
    </g>
  );
  return (
    <g>
      <defs><linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.bg} /><stop offset="0.8" stopColor={pal.wall} /><stop offset="1" stopColor={pal.wallLit} /></linearGradient>
        <radialGradient id={`${id}h`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.9} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <rect x={-2} y={-2} width={104} height={120} fill={`url(#${id}s)`} />
      <circle cx={30} cy={88} r={34} fill={`url(#${id}h)`} /><circle cx={30} cy={88} r={10} fill={pal.glow} />
      <path d="M-2 100 Q24 88 50 96 T102 92 L102 118 L-2 118Z" fill={lerpHex(pal.wall, pal.ink, 0.35)} />
      <rect x={-2} y={106} width={104} height={12} fill={river} />
      {[...Array(6)].map((_, i) => <path key={i} d={`M${((hash(i) * 120 + t * 0.05) % 120) - 10} ${108 + hash(i + 2) * 8} l6 0`} stroke={pal.glow} strokeWidth={0.6} opacity={0.7} />)}
      <path d="M-2 116 L102 116 L102 180 L-2 180Z" fill={earth} />
      <g transform="translate(0 116)"><Grain n={200} w={100} h={64} seed={seed * 5 + 4} a={pal.wallLit} b={pal.ink} rMax={0.8} /></g>
      {/* higuera de Bengala */}
      <g transform="translate(80 118)">
        <path d="M-3 0 L-2 -30 L2 -30 L3 0Z" fill={lerpHex(pal.rock, pal.ink, 0.3)} />
        <ellipse cx={0} cy={-38} rx={24} ry={14} fill={leaf} /><ellipse cx={-12} cy={-32} rx={12} ry={8} fill={lerpHex(leaf, pal.rim, 0.1)} /><ellipse cx={12} cy={-34} rx={13} ry={8} fill={lerpHex(leaf, pal.ink, 0.2)} />
        {[-18, -12, -6, 7, 13, 19].map((x) => <path key={x} d={`M${x} -28 L${x + 0.5} 0`} stroke={lerpHex(pal.rock, pal.ink, 0.3)} strokeWidth={0.6} />)}
      </g>
      {palm(8, 118, 1.1)}{palm(16, 120, 0.8)}
    </g>
  );
};
