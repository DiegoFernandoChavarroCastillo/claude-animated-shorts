// excavacion · Corte del terreno: hierba arriba, estratos de tierra y una capa de ceniza con vigas quemadas donde descansa una tablilla; una mano con pincel: la arqueología, bajo la ceniza, el hallazgo, siglos después.
// `dig` el pincel retira la ceniza y la tablilla brilla (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const Excavacion: AssetFC = ({ pal, p, t, seed }) => {
  const dg = p.dig ?? 0, s1 = lerpHex(pal.rock, pal.wallLit, 0.2), s2 = lerpHex(pal.rock, pal.wall, 0.4), ash = lerpHex(pal.ink, pal.rock, 0.3), clay = lerpHex(pal.rock, pal.rim, 0.4);
  return (
    <g>
      <rect x={-2} y={-2} width={104} height={30} fill={pal.bg} />
      {[...Array(10)].map((_, i) => <circle key={i} cx={hash(i * 5) * 100} cy={hash(i) * 20} r={0.3} fill={pal.wallLit} opacity={0.6} />)}
      <path d="M-2 28 Q30 22 60 26 Q84 29 102 24 L102 34 L-2 34Z" fill={lerpHex(pal.accent, pal.ink, 0.5)} />
      {[...Array(30)].map((_, i) => <path key={`g${i}`} d={`M${i * 3.5} 28 l${Math.sin(t * 0.05 + i) * 0.6} -2.4`} stroke={lerpHex(pal.accent, pal.ink, 0.3)} strokeWidth={0.5} />)}
      <rect x={-2} y={30} width={104} height={22} fill={s1} />
      <rect x={-2} y={52} width={104} height={18} fill={s2} />
      <path d="M-2 70 Q40 66 102 71 L102 92 Q50 96 -2 92Z" fill={ash} />
      <rect x={-2} y={92} width={104} height={88} fill={lerpHex(pal.rock, pal.ink, 0.55)} />
      <Grain n={260} w={100} h={150} seed={seed * 3 + 2} a={lerpHex(s1, pal.wallLit, 0.2)} b={pal.ink} rMax={0.7} />
      {[[10, 76, 22, -6], [70, 84, 26, 8]].map(([x, y, w, r], i) => <rect key={`v${i}`} x={x} y={y} width={w} height={2.6} fill={lerpHex(pal.ink, pal.accent, 0.2)} transform={`rotate(${r} ${x} ${y})`} />)}
      {[...Array(8)].map((_, i) => <rect key={`r${i}`} x={hash(i * 9) * 96} y={34 + hash(i * 4) * 54} width={2 + hash(i) * 3} height={1.2 + hash(i * 2)} rx={0.5} fill={lerpHex(s2, pal.ink, 0.3)} />)}
      {/* la tablilla */}
      <g transform="translate(50 81) rotate(-6)">
        <ellipse cx={0} cy={0} rx={16} ry={9} fill={pal.glow} opacity={0.4 * dg * (0.8 + 0.2 * Math.sin(t * 0.15))} />
        <rect x={-10} y={-6} width={20} height={12} rx={2.4} fill={clay} />
        {[0, 1, 2, 3].map((r) => <path key={r} d={`M-8 ${-3.4 + r * 2.6} l16 0`} stroke={lerpHex(clay, pal.ink, 0.5)} strokeWidth={0.6} strokeDasharray="0.8 0.6" />)}
        <rect x={-11} y={-7} width={22} height={14} rx={2.4} fill={ash} opacity={1 - dg} />
      </g>
      {/* mano con pincel */}
      <g transform={`translate(${lerp(70, 54 + Math.sin(t * 0.4) * 6 * (dg > 0 && dg < 1 ? 1 : 0), clamp01(dg * 3))} ${lerp(56, 72, clamp01(dg * 3))})`}>
        <path d="M0 0 L-6 8" stroke={lerpHex(pal.rock, pal.rim, 0.3)} strokeWidth={1.2} /><path d="M-6 8 L-8 11 L-5 10Z" fill={lerpHex(pal.wallLit, pal.rim, 0.3)} />
        <path d="M0 0 Q6 -7 16 -10" stroke={pal.skin} strokeWidth={2.8} fill="none" strokeLinecap="round" />
      </g>
      {dg > 0 && dg < 1 && [...Array(6)].map((_, i) => { const u = ((t * 0.04 + i / 6) % 1); return <circle key={`d${i}`} cx={50 + (hash(i) - 0.5) * 20 + u * 6} cy={78 - u * 10} r={0.4} fill={pal.wallLit} opacity={1 - u} />; })}
    </g>
  );
};
