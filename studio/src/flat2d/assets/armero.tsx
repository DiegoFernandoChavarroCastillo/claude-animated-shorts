// armero · La fragua casi apagada: el herrero con mandil junto al yunque, una estantería de astas de lanza sin punta y el crisol vacío: sin estaño no hay bronce, sin armas.
// `ask` te tiende el crisol vacío y ladea la cabeza (se queda).
import React from "react";
import { type AssetFC, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";

export const Armero: AssetFC = ({ pal, p, t, flick }) => {
  const ak = p.ask ?? 0, iron = lerpHex(pal.rock, pal.ink, 0.5), apron = lerpHex(pal.rock, pal.wallLit, 0.2), shaft = lerpHex(pal.rock, pal.rim, 0.25);
  return (
    <g>
      {/* fragua de adobe con brasas casi muertas */}
      <path d="M2 75 L4 40 Q14 32 24 40 L26 75Z" fill={lerpHex(pal.wall, pal.rock, 0.5)} />
      <path d="M8 62 Q14 56 20 62 L20 70 L8 70Z" fill={pal.ink} />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={10 + i * 2.8} cy={68.5} r={0.9} fill={pal.accent} opacity={0.35 + 0.25 * flick * hash(i)} />)}
      {/* estantería de lanzas sin punta */}
      <path d="M78 75 L78 30 M98 75 L98 30 M76 40 L100 40 M76 64 L100 64" stroke={lerpHex(shaft, pal.ink, 0.3)} strokeWidth={1.2} />
      {[0, 1, 2, 3, 4].map((i) => <g key={i}><path d={`M${80.5 + i * 4} 74 L${80.5 + i * 4} 26`} stroke={shaft} strokeWidth={0.9} /><circle cx={80.5 + i * 4} cy={26} r={0.6} fill={lerpHex(shaft, pal.ink, 0.4)} /></g>)}
      {/* yunque */}
      <path d="M30 75 L33 66 L45 66 L48 75Z" fill={iron} /><path d="M27 62 L52 62 Q55 64 51 66 L29 66Z" fill={lerpHex(iron, pal.rim, 0.25)} />
      <path d="M38 61 L48 58 L47 60 Z" fill={lerpHex(iron, pal.rim, 0.3)} />
      {/* herrero */}
      <g transform="translate(62 75)">
        <path d="M-4 0 L-4 -14 M4 0 L4 -14" stroke={lerpHex(pal.skin, pal.ink, 0.35)} strokeWidth={3.4} strokeLinecap="round" />
        <path d="M-9 -12 L-8 -40 Q0 -44 8 -40 L9 -12Z" fill={pal.skin} />
        <path d="M-6 -36 L6 -36 L8 -10 L-8 -10Z" fill={apron} /><path d="M-6 -36 L-8 -42 M6 -36 L8 -42" stroke={apron} strokeWidth={0.8} />
        <path d="M-8 -39 Q-12 -28 -9 -20" stroke={pal.skin} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <path d={`M8 -39 Q${lerp(12, 4, ak)} ${lerp(-28, -34, ak)} ${lerp(10, -12, ak)} ${lerp(-22, -32, ak)}`} stroke={pal.skin} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <g transform={`translate(${lerp(10, -14, ak)} ${lerp(-21, -33, ak)}) rotate(${lerp(0, -25, ak)})`}>
          <path d="M-4 -2 L4 -2 L3 3 L-3 3Z" fill={lerpHex(pal.rock, pal.rim, 0.2)} /><ellipse cx={0} cy={-2} rx={4} ry={1.2} fill={pal.ink} />
          <path d="M4 -1 L8 -1" stroke={lerpHex(pal.rock, pal.rim, 0.2)} strokeWidth={0.9} />
        </g>
        <rect x={-1.8} y={-46} width={3.6} height={4} fill={pal.skin} />
        <Cabeza cx={0} cy={-50} r={5.4} pal={pal} turn={lerp(-0.4, -0.8, ak)} beard curls={false} bald mouth={ak > 0.5 ? 0.3 + 0.2 * Math.sin(t * 0.3) : 0} />
      </g>
      <ellipse cx={50} cy={75.5} rx={48} ry={1.6} fill={pal.ink} opacity={0.4} />
    </g>
  );
};
