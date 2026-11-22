// baston · prop: uno de los bastones de Tutankamón, de pie: vara de ébano o de madera dorada con anillos de oro, mango curvo y, según la
// semilla, regatón de oro, corteza o bandas de colores (cada copia de un `repeat` sale distinta). Lienzo 100 × 400, anclaje abajo.
// Con `repeat` y `stagger` llena la pantalla de bastones (ciento treinta bastones). Se mece un poco.
import React from "react";
import { type AssetFC, hash } from "./common";
import { lerpHex } from "../palette";
import { Grad, dark, lite, url } from "./shade";

export const Baston: AssetFC = ({ pal, t, seed }) => {
  const id = `bs${seed}`, v = Math.floor(hash(seed + 1) * 3), sw = Math.sin(t * 0.06 + seed) * 1.2;
  const gold = lerpHex("#E8B640", pal.glow, 0.2), wood = [lerpHex("#2A1A10", pal.ink, 0.2), lerpHex("#C89A40", pal.glow, 0.1), lerpHex("#7A4A26", pal.rock, 0.2)][v];
  const red = lerpHex("#B8402E", pal.accent, 0.2), blue = lerpHex("#1E3C8C", pal.ink, 0.1);
  return (
    <g transform={`rotate(${sw} 50 392)`}>
      <Grad id={`${id}w`} a={lite(wood, pal, 0.25)} b={dark(wood, pal, 0.3)} h />
      <ellipse cx={50} cy={394} rx={10} ry={2.4} fill="#000" opacity={0.3} />
      <rect x={46} y={60} width={8} height={330} rx={3} fill={url(`${id}w`)} />
      {/* mango curvo */}
      <path d="M50 64 Q50 30 30 30 Q20 30 20 40" stroke={url(`${id}w`)} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d="M50 64 Q50 30 30 30" stroke={pal.rim} strokeWidth={1.2} fill="none" opacity={0.5} />
      {/* anillos y decoración según la variante */}
      {[90, 150, 240, 330].map((y, i) => <rect key={y} x={45} y={y} width={10} height={v === 1 ? 4 : 6} fill={i % 2 && v === 2 ? red : gold} />)}
      {v === 0 && [...Array(10)].map((_, i) => <path key={i} d={`M46 ${100 + i * 22} l8 6`} stroke={gold} strokeWidth={1} />)}
      {v === 2 && [...Array(6)].map((_, i) => <rect key={i} x={46} y={170 + i * 10} width={8} height={4} fill={i % 2 ? blue : gold} />)}
      <rect x={45} y={372} width={10} height={18} rx={2} fill={gold} />
    </g>
  );
};
