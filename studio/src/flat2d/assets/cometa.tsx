// cometa · prop (senal-wow): un cometa que cruza el cielo: núcleo brillante con su coma (halo de gas), una cola de polvo curva y dorada
// y una cola de iones recta y azul, que ondulan. Va hacia la izquierda (la cola a la derecha). Lienzo 100 × 60, anclaje en el núcleo
// (0,2, 0,5). Brilla y la cola se mueve siempre. Una explicación natural: cometas, nubes de gas, algo del cielo que no es una nave.
import React from "react";
import { type AssetFC, hash } from "./common";
import { lerpHex } from "../palette";
import { Halo } from "./shade";

export const Cometa: AssetFC = ({ pal, t, seed }) => {
  const id = `co${seed}`, dust = lerpHex("#FFE0A0", pal.glow, 0.2), ion = lerpHex("#9AD8FF", pal.glow, 0.2), w = Math.sin(t * 0.07);
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <linearGradient id={`${id}d`} x1="0" x2="1"><stop offset="0" stopColor={dust} stopOpacity={0.85} /><stop offset="1" stopColor={dust} stopOpacity={0} /></linearGradient>
        <linearGradient id={`${id}i`} x1="0" x2="1"><stop offset="0" stopColor={ion} stopOpacity={0.8} /><stop offset="1" stopColor={ion} stopOpacity={0} /></linearGradient>
      </defs>
      <path d={`M20 30 Q55 ${36 + w * 2} 98 ${50 + w * 3} L98 ${58 + w * 3} Q55 ${44 + w * 2} 20 31.5 Z`} fill={`url(#${id}d)`} />
      <path d={`M20 29 L100 ${22 + w} L100 ${27 + w} Z`} fill={`url(#${id}i)`} />
      {[...Array(14)].map((_, i) => { const k = ((t * 0.01 + hash(i + seed)) % 1); return <circle key={i} cx={22 + k * 70} cy={31 + k * (16 + hash(i) * 10) + w * k * 2} r={0.4} fill={dust} opacity={(1 - k) * 0.8} />; })}
      <Halo id={`${id}c`} cx={20} cy={30} r={12} color={ion} a={0.7} />
      <circle cx={20} cy={30} r={2} fill="#FFFFFF" />
    </g>
  );
};
