// vasija_minotauro · prop: ánfora griega de figuras negras sobre barro anaranjado: en el panel, Teseo (casco, escudo redondo y espada) clava la
// espada al Minotauro (cabeza de toro con cuernos, cuerpo de hombre); arriba una greca y lenguas en el cuello, dos asas. Es la imagen del mito:
// Teseo, el Minotauro, Creta, el laberinto. Acción propia: `gleam` un reflejo de luz recorre la vasija y la espada brilla (se queda).
import React from "react";
import { type AssetFC, idle } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

export const VasijaMinotauro: AssetFC = ({ pal, t, seed, p }) => {
  const id = `vm${seed}`, I = idle(t, seed), gl = p.gleam ?? 0, clay = lerpHex("#D2753A", pal.rock, 0.15), blk = lerpHex("#1A1210", pal.ink, 0.3);
  const body = "M36 30 Q34 22 38 18 L62 18 Q66 22 64 30 Q84 44 82 80 Q80 112 62 126 L60 134 L40 134 L38 126 Q20 112 18 80 Q16 44 36 30 Z";
  const sx = 20 + gl * 70, lunge = Math.sin(t * 0.06 + seed) * 0.6;
  return (
    <g>
      <Grad id={`${id}c`} a={lite(clay, pal, 0.15)} b={dark(clay, pal, 0.3)} h /><Grad id={`${id}v`} a={lite(clay, pal, 0.1)} b={dark(clay, pal, 0.35)} />
      <defs><clipPath id={`${id}k`}><path d={body} /></clipPath></defs>
      <ContactShadow id={`${id}s`} cx={50} cy={135} rx={20} />
      {/* asas */}
      <path d="M37 24 Q24 22 26 40" stroke={blk} strokeWidth={3.2} fill="none" strokeLinecap="round" />
      <path d="M63 24 Q76 22 74 40" stroke={blk} strokeWidth={3.2} fill="none" strokeLinecap="round" />
      <path d={body} fill={url(`${id}v`)} />
      <g clipPath={`url(#${id}k)`}>
        <rect x={0} y={0} width={100} height={140} fill={url(`${id}c`)} opacity={0.55} />
        {/* cuello: lenguas; hombro: greca; pie: rayos */}
        {[...Array(9)].map((_, i) => <path key={i} d={`M${36.5 + i * 3.2} 30 q1.4 -6 2.8 0 Z`} fill={blk} />)}
        <rect x={10} y={36} width={80} height={6} fill={blk} />
        {[...Array(12)].map((_, i) => <path key={i} d={`M${14 + i * 6.5} 41 l0 -3.5 l4 0 l0 2 l-2 0`} stroke={clay} strokeWidth={0.7} fill="none" />)}
        <rect x={10} y={106} width={80} height={30} fill={blk} />
        {[...Array(10)].map((_, i) => <path key={i} d={`M${24 + i * 5.6} 106 l2.8 10 l2.8 -10 Z`} fill={clay} />)}
        {/* Teseo */}
        <g transform={`translate(${lunge} 0)`}>
          <circle cx={36} cy={56} r={4.2} fill={blk} /><path d="M33 53.5 Q36 47 41 51" stroke={blk} strokeWidth={1.6} fill="none" />
          <path d="M33 60 L40 60 L42 78 L31 78 Z" fill={blk} />
          <circle cx={30.5} cy={68} r={6.5} fill={blk} /><circle cx={30.5} cy={68} r={4.2} fill="none" stroke={clay} strokeWidth={0.5} />
          <path d="M34 78 L28 98 M39 78 L46 97" stroke={blk} strokeWidth={3.4} strokeLinecap="round" />
          <path d="M40 63 L50 66" stroke={blk} strokeWidth={2.6} strokeLinecap="round" />
          <path d="M50 66 L62 71" stroke={gl > 0 ? lerpHex(blk, pal.glow, gl) : blk} strokeWidth={1.1} strokeLinecap="round" />
          <path d="M35.5 55.5 l1.4 0" stroke={clay} strokeWidth={0.6} />
        </g>
        {/* el Minotauro */}
        <g transform={`rotate(${4 + Math.sin(t * 0.06 + seed) * 1.2} 64 98)`}>
          <ellipse cx={66} cy={57} rx={5} ry={4.4} fill={blk} /><path d="M69 56 Q75 57 75 61 L70 61 Z" fill={blk} />
          <path d="M62 54 Q56 49 58 45 M70 54 Q74 47 72 44" stroke={blk} strokeWidth={1.4} fill="none" strokeLinecap="round" />
          <path d="M60 62 L71 62 L70 80 L59 80 Z" fill={blk} />
          <path d="M60 80 L56 98 M68 80 L72 98" stroke={blk} strokeWidth={3.4} strokeLinecap="round" />
          <path d="M60 64 L52 72 M70 64 L77 74" stroke={blk} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={67.5} cy={56} r={0.6} fill={clay} />
        </g>
        <path d="M18 100 L82 100" stroke={blk} strokeWidth={1.2} />
        {/* brillo que recorre la vasija */}
        <rect x={sx - 4} y={0} width={5} height={140} fill={pal.wallLit} opacity={gl > 0 && gl < 1 ? 0.35 : 0} transform={`skewX(-12)`} />
        <path d="M70 40 Q78 62 75 92" stroke={pal.wallLit} strokeWidth={2.4} fill="none" opacity={0.22 + 0.06 * I.breath} strokeLinecap="round" />
      </g>
      {gl > 0 ? <Halo id={`${id}g`} cx={61} cy={70} r={8 * gl} color={pal.glow} a={0.8 * gl} /> : null}
    </g>
  );
};
