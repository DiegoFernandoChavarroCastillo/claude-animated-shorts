// estacion_cooper · fondo apaisado (100 × 60, anclaje en el centro): el interior de la Estación Cooper, un cilindro gigante que gira
// junto a Saturno: el suelo verde con casas, árboles y campos sube por los dos lados y se curva hasta hacerse techo; en el centro, la
// franja de luz y, a lo lejos, el otro extremo con su ventanal al espacio. Gente pequeña juega abajo. Es el futuro donde la humanidad
// sobrevivió.
import React from "react";
import { type AssetFC, hash } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, url } from "./shade";

export const EstacionCooper: AssetFC = ({ pal, t, seed }) => {
  const id = `ec${seed}`, green = "#6EA058";
  const house = (x: number, y: number, s: number, rot: number, k: number) => (
    <g key={k} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-2} y={-2.4} width={4} height={2.4} fill={["#F2E8D8", "#E8D0B0", "#D8E0E8"][k % 3]} /><path d="M-2.4 -2.4 L0 -4.2 L2.4 -2.4 Z" fill={["#B85A3A", "#5A6A8A", "#8A5A3A"][k % 3]} />
      <rect x={0.6} y={-1.8} width={0.9} height={0.8} fill="#FFE8A8" />
    </g>
  );
  return (
    <g>
      <Grad id={`${id}g`} a={lerpHex(green, "#FFF6D8", 0.35)} b={lerpHex(green, pal.ink, 0.2)} />
      <rect x={-20} y={-20} width={140} height={100} fill="#E8EEE0" />
      {/* el otro extremo del cilindro: ventanal al espacio con Saturno */}
      <circle cx={50} cy={30} r={9} fill="#0A1030" /><circle cx={50} cy={30} r={9} fill="none" stroke="#C8D0D8" strokeWidth={0.8} />
      <g transform="translate(52 29) rotate(-12)"><circle r={2} fill="#E4C690" /><ellipse rx={4} ry={0.8} fill="none" stroke="#E6D0A6" strokeWidth={0.4} /></g>
      {/* suelo que se curva hacia arriba por los lados (anillos del cilindro en perspectiva) */}
      {[...Array(7)].map((_, k) => {
        const r = 12 + k * 9, ry = r * 0.72;
        return <ellipse key={k} cx={50} cy={30} rx={r} ry={ry} fill="none" stroke={lerpHex(green, "#E8EEE0", 0.6 - k * 0.07)} strokeWidth={9} opacity={0.9} />;
      })}
      <path d="M-20 60 Q50 28 120 60 L120 80 L-20 80 Z" fill={url(`${id}g`)} />
      {[...Array(14)].map((_, i) => { const a = hash(seed + i * 3.1) * 6.283, r = 18 + hash(i * 1.9) * 40; return house(50 + Math.cos(a) * r, 30 + Math.sin(a) * r * 0.72, 0.5 + r / 60, (a * 180) / Math.PI - 90, i); })}
      {[...Array(22)].map((_, i) => { const a = hash(i * 4.3 + seed) * 6.283, r = 16 + hash(i * 2.2) * 44, x = 50 + Math.cos(a) * r, y = 30 + Math.sin(a) * r * 0.72, s = 0.4 + r / 70; return <circle key={`t${i}`} cx={x} cy={y} r={1.4 * s} fill={lerpHex("#3E7A3A", pal.ink, 0.1)} />; })}
      {/* franja de luz central */}
      <rect x={-20} y={28.6} width={140} height={2.8} fill="#FFFBEA" opacity={0.9} /><Halo id={`${id}l`} cx={50} cy={30} r={50} color="#FFF6D8" a={0.35} />
      {/* gente abajo */}
      {[...Array(6)].map((_, i) => { const x = 30 + i * 8 + Math.sin(t * 0.05 + i) * 1.5, y = 52 + hash(i) * 4; return <g key={`p${i}`}><circle cx={x} cy={y - 2.4} r={0.6} fill="#E6B08A" /><rect x={x - 0.5} y={y - 1.8} width={1} height={1.8} fill={["#E85A3A", "#3A6AA8", "#F2C84A"][i % 3]} /></g>; })}
    </g>
  );
};
