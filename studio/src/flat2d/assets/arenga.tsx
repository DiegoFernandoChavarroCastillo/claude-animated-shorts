// arenga · Marco Aurelio (barba, laurel, capa carmesí) sobre una tarima de madera habla a sus legionarios, que se ven de espaldas en tres filas con escudos, lanzas y un estandarte.
// `speak` le alza el brazo con la palma abierta y salen ondas de su voz; `murmur` hace que los soldados bajen las lanzas y giren la cabeza entre ellos: la sorpresa (se quedan así).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Coraza, Legionario } from "./romanos";

export const Arenga: AssetFC = ({ pal, p, t }) => {
  const sp = p.speak ?? 0, mu = p.murmur ?? 0, wood = lerpHex(pal.rock, pal.rim, 0.25);
  const hx = lerp(42, 36, sp), hy = lerp(58, 28, sp);
  return (
    <g>
      {/* tarima */}
      <path d="M26 64 L74 64 L74 78 L26 78Z" fill={wood} />{[30, 38, 46, 54, 62, 70].map((x) => <path key={x} d={`M${x} 64 L${x} 78`} stroke={lerpHex(wood, pal.ink, 0.4)} strokeWidth={0.4} />)}
      <path d="M24 62 L76 62 L74 64 L26 64Z" fill={lerpHex(wood, pal.wallLit, 0.3)} /><path d="M74 64 L74 78" stroke={pal.rim} strokeWidth={0.6} />
      <path d="M82 80 L82 26" stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={1.2} /><rect x={76} y={32} width={12} height={10} fill={pal.accent} />
      <path d="M76 26 Q79 22 82 25 Q85 22 88 26 L84 28 L80 28Z" fill={pal.rim} />
      {/* Marco */}
      <path d="M41 36 Q34 50 37 62 L63 62 Q66 50 59 36Z" fill={lerpHex(pal.accent, pal.ink, 0.35)} />
      <Coraza cx={50} top={36} feet={63} w={17} pal={pal} />
      <path d={`M43 37 Q${hx} ${lerp(48, 34, sp)} ${hx} ${hy}`} stroke={pal.accent} strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <path d={`M${lerp(42.5, 38, sp)} ${lerp(48, 36, sp)} L${hx} ${hy}`} stroke={pal.skin} strokeWidth={2.2} strokeLinecap="round" /><ellipse cx={hx} cy={hy} rx={1.7} ry={2.1} fill={pal.skin} />
      <path d="M58 37 Q60 46 59 54" stroke={pal.accent} strokeWidth={3.4} fill="none" strokeLinecap="round" /><circle cx={59} cy={55} r={1.6} fill={pal.skin} />
      <path d="M48 33 L52 33 L52 37 L48 37Z" fill={pal.skin} />
      <Cabeza cx={50} cy={27} r={5.6} pal={pal} beard laurel={1} turn={-0.1} />
      {[0, 1, 2].map((i) => { const u = ((t * 0.03 + i / 3) % 1) * clamp01(sp * 3); return sp > 0.2 ? <path key={i} d={`M${44 - u * 14} ${20 - u * 5} Q${40 - u * 20} 28 ${44 - u * 14} ${36 + u * 5}`} stroke={pal.glow} strokeWidth={0.7} fill="none" opacity={(1 - u) * 0.8} /> : null; })}
      {[0, 1, 2].map((i) => { const u = ((t * 0.03 + i / 3) % 1) * clamp01(sp * 3); return sp > 0.2 ? <path key={`r${i}`} d={`M${56 + u * 14} ${20 - u * 5} Q${60 + u * 20} 28 ${56 + u * 14} ${36 + u * 5}`} stroke={pal.glow} strokeWidth={0.7} fill="none" opacity={(1 - u) * 0.8} /> : null; })}
      {/* legionarios */}
      {[...Array(7)].map((_, i) => <Legionario key={`a${i}`} x={4 + i * 15.5} y={86} s={0.5} pal={pal} up={1 - mu} tilt={(hash(i) - 0.5) * 18 * mu} seed={i} />)}
      {[...Array(6)].map((_, i) => <Legionario key={`b${i}`} x={11 + i * 16} y={94} s={0.62} pal={pal} up={1 - mu * 0.8} tilt={(hash(i + 4) - 0.5) * 20 * mu} seed={i + 2} />)}
      {[...Array(5)].map((_, i) => <Legionario key={`c${i}`} x={6 + i * 22} y={102} s={0.8} pal={pal} up={1 - mu * 0.9} tilt={(hash(i + 9) - 0.5) * 16 * mu} seed={i + 1} />)}
    </g>
  );
};
