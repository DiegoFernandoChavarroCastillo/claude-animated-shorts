// senado · la curia: dos gradas de senadores con toga y franja carmesí entre columnas, y delante un rollo con el sello del emperador.
// `unroll` despliega el rollo y aparecen las líneas de la carta; `relief` hace que los senadores alcen la cabeza y se enciende una luz cálida sobre ellos (se quedan así).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Toga } from "./romanos";
import { Grain } from "./grain";

export const Senado: AssetFC = ({ pal, p, t, seed }) => {
  const id = `se${seed}`, un = p.unroll ?? 0, rl = p.relief ?? 0, marble = lerpHex(pal.wallLit, pal.wall, 0.3), paper = lerpHex(pal.wallLit, pal.rim, 0.15);
  const senator = (x: number, y: number, s: number, i: number) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
      <Toga cx={0} top={-14} feet={6} w={12} pal={pal} />
      <g transform={`rotate(${lerp(10, -4, rl) * (hash(i) > 0.5 ? 1 : -1)} 0 -15)`}>
        <Cabeza cx={0} cy={-20} r={4.6} pal={pal} beard={hash(i + 3) > 0.5} turn={(hash(i + 1) - 0.5) * 0.6} eyesClosed={(1 - rl) * 0.6} />
      </g>
    </g>
  );
  const rw = lerp(6, 64, un);
  return (
    <g>
      <defs><radialGradient id={`${id}l`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.6} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      {[8, 30, 70, 92].map((x) => <g key={x}><rect x={x - 4} y={4} width={8} height={62} fill={marble} />{[0, 1, 2].map((f) => <path key={f} d={`M${x - 2 + f * 2} 8 L${x - 2 + f * 2} 62`} stroke={lerpHex(marble, pal.ink, 0.25)} strokeWidth={0.4} />)}<rect x={x - 5.5} y={2} width={11} height={3} fill={lerpHex(marble, pal.wallLit, 0.4)} /><path d={`M${x + 4} 4 L${x + 4} 66`} stroke={pal.rim} strokeWidth={0.5} opacity={0.6} /></g>)}
      <path d="M-2 46 L102 46 L102 50 L-2 50Z" fill={lerpHex(marble, pal.ink, 0.35)} /><path d="M-2 60 L102 60 L102 64 L-2 64Z" fill={lerpHex(marble, pal.ink, 0.25)} />
      <g transform="translate(0 46)"><Grain n={60} w={100} h={18} seed={seed * 3 + 7} a={marble} b={pal.ink} rMax={0.5} /></g>
      <ellipse cx={50} cy={38} rx={60} ry={30} fill={`url(#${id}l)`} opacity={rl} />
      {[...Array(7)].map((_, i) => senator(8 + i * 14, 46, 0.85, i))}
      {[...Array(6)].map((_, i) => senator(15 + i * 14, 60, 1, i + 10))}
      {/* rollo */}
      <g transform={`translate(50 ${80 + Math.sin(t * 0.05) * 0.4})`}>
        <rect x={-rw / 2} y={-11} width={rw} height={22} fill={paper} />
        <g transform={`translate(${-rw / 2} -11)`}><Grain n={24} w={rw} h={22} seed={seed + 3} a={pal.rim} b={pal.rock} rMax={0.4} /></g>
        {[...Array(5)].map((_, l) => { const k = clamp01(un * 1.6 - 0.4 - l * 0.12); return <path key={l} d={`M${-26} ${-6 + l * 3.4} L${-26 + (l === 4 ? 30 : 50) * k} ${-6 + l * 3.4}`} stroke={lerpHex(pal.rock, pal.ink, 0.4)} strokeWidth={0.7} />; })}
        {[-1, 1].map((s) => <g key={s}><rect x={s * rw / 2 - 2.6} y={-13} width={5.2} height={26} rx={2.6} fill={lerpHex(paper, pal.rock, 0.35)} /><circle cx={s * rw / 2} cy={-13} r={1.6} fill={pal.rock} /><circle cx={s * rw / 2} cy={13} r={1.6} fill={pal.rock} /></g>)}
        <circle cx={lerp(0, 22, un)} cy={7} r={3.2} fill={pal.accent} opacity={clamp01(un * 2)} /><path d={`M${lerp(0, 22, un) - 1.6} 7 L${lerp(0, 22, un) + 1.6} 7 M${lerp(0, 22, un)} 5.4 L${lerp(0, 22, un)} 8.6`} stroke={lerpHex(pal.accent, pal.ink, 0.4)} strokeWidth={0.5} opacity={clamp01(un * 2)} />
      </g>
    </g>
  );
};
