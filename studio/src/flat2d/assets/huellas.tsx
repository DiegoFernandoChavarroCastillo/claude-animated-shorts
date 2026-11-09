// huellas · un rastro de pisadas de pies descalzos llenas de barro que cruza el suelo de izquierda a derecha, con salpicaduras y terrones.
// `trail` las va dejando una a una, como si alguien caminara (se quedan). Sobre mármol o sobre una alfombra.
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";

export const Huella: React.FC<{ x: number; y: number; s: number; flip: boolean; mud: string; o: number }> = ({ x, y, s, flip, mud, o }) => (
  <g transform={`translate(${x} ${y}) scale(${s} ${s * 0.5}) ${flip ? "scale(1 -1)" : ""}`} opacity={o}>
    <path d="M-4 1 Q-5 -2 -2 -3 Q2 -3.6 4 -1.6 Q4.6 1.4 1 2.4 Q-3 3 -4 1Z" fill={mud} />
    {[[5.4, -2.6, 1.1], [6.2, -0.6, 0.9], [6.4, 1.2, 0.8], [5.8, 2.8, 0.7], [4.8, 4, 0.6]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy - 1} r={r} fill={mud} />)}
  </g>
);

export const Huellas: AssetFC = ({ pal, p, seed }) => {
  const tr = p.trail ?? 0, mud = lerpHex(pal.rock, pal.ink, 0.35), n = 9;
  return (
    <g>
      {[...Array(n)].map((_, i) => {
        const o = clamp01(tr * n - i), x = 6 + i * 10.6, y = 18 + (i % 2 ? 4 : -2) + (hash(i + seed) - 0.5) * 1.5;
        return <g key={i}>
          <Huella x={x} y={y} s={1.15} flip={i % 2 === 1} mud={mud} o={o * 0.95} />
          {o > 0 && [...Array(3)].map((_, j) => <circle key={j} cx={x + (hash(i * 5 + j) - 0.5) * 12} cy={y + (hash(i * 7 + j) - 0.5) * 6} r={0.3 + hash(i + j) * 0.5} fill={mud} opacity={o * 0.8} />)}
        </g>;
      })}
    </g>
  );
};
