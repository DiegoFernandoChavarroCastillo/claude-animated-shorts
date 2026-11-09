// proclamacion · el general sobre una tribuna de piedra ante sus legiones (de espaldas, con escudos y lanzas) y dos estandartes con águila.
// `proclaim` le alza el brazo, le tiñe la capa de púrpura, le pone la corona de laurel y las lanzas suben en aclamación (se queda proclamado).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Coraza, Legionario } from "./romanos";

export const Proclamacion: AssetFC = ({ pal, p, t, seed }) => {
  const pr = p.proclaim ?? 0, purple = lerpHex(pal.accent, pal.bg, 0.45), cape = lerpHex(pal.accent, purple, pr);
  const stone = lerpHex(pal.wallLit, pal.rock, 0.45), up = clamp01(pr * 1.4 - 0.2);
  const hx = lerp(42, 38, pr), hy = lerp(60, 20, pr);
  const standard = (x: number) => (
    <g>
      <path d={`M${x} 92 L${x} 28`} stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={1.2} />
      <rect x={x - 6} y={36} width={12} height={10} fill={pal.accent} /><path d={`M${x - 6} 46 L${x - 6} 48 M${x - 2} 46 L${x - 2} 48 M${x + 2} 46 L${x + 2} 48 M${x + 6} 46 L${x + 6} 48`} stroke={pal.rim} strokeWidth={0.7} />
      <path d={`M${x - 6} 28 Q${x - 3} 24 ${x} 27 Q${x + 3} 24 ${x + 6} 28 L${x + 2} 30 L${x - 2} 30Z`} fill={pal.rim} /><circle cx={x} cy={26} r={1.4} fill={pal.rim} />
      <text x={x} y={43} textAnchor="middle" fontSize={3} fontFamily="Georgia, serif" fill={pal.rim}>SPQR</text>
    </g>
  );
  return (
    <g transform="translate(0 -6)">
      {standard(14)}{standard(86)}
      {/* tribuna */}
      <path d="M24 72 L76 72 L80 92 L20 92Z" fill={stone} /><path d="M28 66 L72 66 L76 72 L24 72Z" fill={lerpHex(stone, pal.wallLit, 0.35)} />
      {[30, 44, 58, 70].map((x) => <path key={x} d={`M${x} 74 L${x} 90`} stroke={lerpHex(stone, pal.ink, 0.25)} strokeWidth={0.4} />)}
      <path d="M76 72 L80 92" stroke={pal.rim} strokeWidth={0.6} />
      {/* el general */}
      <path d="M41 39 Q34 54 37 66 L63 66 Q66 54 59 39Z" fill={lerpHex(cape, pal.ink, 0.25)} />
      <Coraza cx={50} top={39} feet={67} w={17} pal={pal} cape={cape} />
      <path d={`M43 40 Q${hx - 1} ${lerp(50, 30, pr)} ${hx} ${hy}`} stroke={cape} strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <path d={`M${lerp(42.5, 40, pr)} ${lerp(50, 30, pr)} L${hx} ${hy}`} stroke={pal.skin} strokeWidth={2.2} strokeLinecap="round" /><circle cx={hx} cy={hy} r={1.8} fill={pal.skin} />
      <path d="M58 40 Q60 50 59 58" stroke={cape} strokeWidth={3.4} fill="none" strokeLinecap="round" /><circle cx={59} cy={59} r={1.6} fill={pal.skin} />
      <path d="M48 36 L52 36 L52 40 L48 40Z" fill={pal.skin} />
      <Cabeza cx={50} cy={31} r={5.4} pal={pal} turn={0} curls={false} laurel={clamp01(pr * 2 - 0.8)} />
      <path d="M45.2 29.5 Q45.5 24.8 50 25 Q54.5 24.8 54.8 29.5 Q52 27 50 27.4 Q47.5 27 45.2 29.5Z" fill={lerpHex(pal.rock, pal.ink, 0.45)} />
      {pr > 0.5 && [0, 1, 2].map((i) => { const u = ((t * 0.03 + i / 3) % 1); return <circle key={i} cx={50} cy={31} r={8 + u * 22} fill="none" stroke={pal.glow} strokeWidth={0.6} opacity={(1 - u) * 0.5 * clamp01((pr - 0.5) * 3)} />; })}
      {/* legiones de espaldas */}
      {[...Array(6)].map((_, i) => <Legionario key={`a${i}`} x={8 + i * 17} y={96} s={0.62} pal={pal} up={clamp01(up - hash(i) * 0.2) + (pr > 0.9 ? Math.sin(t * 0.25 + i) * 0.06 : 0)} seed={i} />)}
      {[...Array(5)].map((_, i) => <Legionario key={`b${i}`} x={16 + i * 17} y={105} s={0.78} pal={pal} up={clamp01(up - hash(i + 5) * 0.2)} tilt={(hash(i + 2) - 0.5) * 4} seed={i + 1} />)}
    </g>
  );
};
