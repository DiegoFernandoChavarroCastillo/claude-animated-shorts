// alfombra · una alfombra lujosa de banquete en perspectiva (tonos rojo y azul, cenefa de meandros, medallón central y flecos) con una mesa baja
// de copas y fruta: las alfombras de Platón ante sus invitados. `stomp` la llena de pisadas de barro que avanzan y la arruga a su paso (se queda sucia).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { Huella } from "./huellas";

export const Alfombra: AssetFC = ({ pal, p, seed }) => {
  const st = p.stomp ?? 0, red = lerpHex("#8E2A2A", pal.accent, 0.15), blue = lerpHex(pal.accent, pal.ink, 0.25), gold = lerpHex(pal.rim, pal.rock, 0.3);
  const mud = lerpHex(pal.rock, pal.ink, 0.45), wood = lerpHex(pal.rock, pal.ink, 0.2), n = 7;
  return (
    <g>
      <ellipse cx={50} cy={36} rx={52} ry={3} fill={pal.ink} opacity={0.35} />
      {/* alfombra en perspectiva */}
      <path d="M14 6 L86 6 L100 36 L0 36Z" fill={red} />
      <path d="M18 8.4 L82 8.4 L94 33.4 L6 33.4Z" fill="none" stroke={gold} strokeWidth={1.2} />
      <path d="M21 10.4 L79 10.4 L89.6 31.4 L10.4 31.4Z" fill={blue} />
      {[...Array(12)].map((_, i) => <path key={i} d={`M${10 + i * 7} 32.6 l0 -1.6 l3 0 l0 1`} stroke={gold} strokeWidth={0.5} fill="none" />)}
      <ellipse cx={50} cy={21} rx={18} ry={6.4} fill={red} /><ellipse cx={50} cy={21} rx={12} ry={4.2} fill="none" stroke={gold} strokeWidth={0.8} />
      {[0, 1, 2, 3].map((i) => <path key={`r${i}`} d={`M50 21 L${50 + Math.cos(i * 1.57 + 0.78) * 11} ${21 + Math.sin(i * 1.57 + 0.78) * 3.8}`} stroke={gold} strokeWidth={0.6} />)}
      {[...Array(26)].map((_, i) => <path key={`f${i}`} d={`M${0.6 + i * 3.8} 36 l0 2.2`} stroke={lerpHex(pal.wallLit, gold, 0.4)} strokeWidth={0.6} />)}
      {/* mesa baja con copas y fruta (el banquete) */}
      <g transform="translate(70 4)">
        <rect x={-12} y={-3} width={24} height={2.4} rx={0.8} fill={wood} /><rect x={-10} y={-0.6} width={1.6} height={5} fill={wood} /><rect x={8.4} y={-0.6} width={1.6} height={5} fill={wood} />
        <path d="M-7 -3 L-8 -7 L-4 -7 L-5 -3Z" fill={gold} /><path d="M3 -3 L2 -7 L6 -7 L5 -3Z" fill={gold} />
        {[[-1, -4.4, "#6B3A6E"], [0.8, -5, "#6B3A6E"], [-0.4, -6, "#7B4A7E"], [9, -4.4, "#C9862E"]].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r={1.3} fill={c as string} />)}
      </g>
      {/* pisadas de barro y arrugas */}
      {[...Array(n)].map((_, i) => {
        const o = clamp01(st * n - i), x = 10 + i * 13, y = 24 + (i % 2 ? 4 : -1);
        return <g key={`h${i}`}>
          {o > 0 && <path d={`M${x - 6} ${y + 3} q3 -2 6 0 q3 2 6 0`} stroke={lerpHex(red, pal.ink, 0.4)} strokeWidth={0.7} fill="none" opacity={o * 0.8} />}
          <Huella x={x} y={y} s={1.2} flip={i % 2 === 1} mud={mud} o={o} />
          {o > 0 && [0, 1, 2].map((j) => <circle key={j} cx={x + (hash(i * 3 + j + seed) - 0.5) * 9} cy={y + (hash(i + j * 4) - 0.5) * 4} r={0.5} fill={mud} opacity={o} />)}
        </g>;
      })}
    </g>
  );
};
