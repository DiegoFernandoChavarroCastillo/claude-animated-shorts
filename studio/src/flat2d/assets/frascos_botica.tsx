// frascos_botica · prop (manuscrito-voynich): la repisa de un boticario medieval: estante de madera con frascos de cerámica y de vidrio
// etiquetados, un ramillete de hierbas colgado a secar, un mortero con su mano y un libro de recetas. Medicina antigua, remedios, herbolaria.
// Lienzo 100 × 80, anclaje abajo en el centro. Acción propia: `brew` los frascos de vidrio brillan uno tras otro y sale vapor del mortero (se queda).
import React from "react";
import { type AssetFC, clamp01, hash } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";

export const FrascosBotica: AssetFC = ({ pal, t, seed, p }) => {
  const id = `fb${seed}`, br = clamp01(p.brew ?? 0), wood = lerpHex("#6A4426", pal.rock, 0.3);
  const jars: [number, number, number, string, boolean][] = [[8, 12, 16, "#3A6A9A", false], [24, 10, 20, "#5A9A5A", true], [40, 12, 14, "#C8B090", false], [58, 9, 18, "#9A4A3A", true], [74, 12, 16, "#3A6A9A", false]];
  return (
    <g>
      <Vol id={`${id}w`} c={wood} pal={pal} k={0.9} />
      <ContactShadow id={`${id}s`} cx={50} cy={79} rx={46} a={0.4} />
      {/* estante alto */}
      <rect x={2} y={34} width={96} height={3} fill={url(`${id}w`)} /><rect x={6} y={37} width={3} height={6} fill={dark(wood, pal, 0.3)} /><rect x={91} y={37} width={3} height={6} fill={dark(wood, pal, 0.3)} />
      {jars.map(([x, w, h, c, glass], i) => { const on = glass && br > i / jars.length; const col = lerpHex(c, pal.wall, 0.15);
        return (
          <g key={i}>
            <Grad id={`${id}j${i}`} h a={dark(col, pal, 0.3)} mid={lite(col, pal, 0.3)} b={dark(col, pal, 0.4)} />
            {on ? <Halo id={`${id}h${i}`} cx={x + w / 2} cy={34 - h / 2} r={w} color={lite(col, pal, 0.5)} a={0.6} /> : null}
            <rect x={x} y={34 - h} width={w} height={h} rx={glass ? w * 0.4 : 1.6} fill={url(`${id}j${i}`)} opacity={glass ? 0.85 : 1} />
            <rect x={x + w * 0.25} y={34 - h - 2.4} width={w * 0.5} height={2.6} fill={dark(col, pal, 0.4)} />
            <rect x={x + w * 0.15} y={34 - h * 0.6} width={w * 0.7} height={h * 0.28} fill={lerpHex("#EDE2C2", pal.ink, 0.15)} />
            <path d={`M${x + w * 0.25} ${34 - h * 0.48} l${w * 0.5} 0`} stroke={pal.ink} strokeWidth={0.3} />
          </g>); })}
      {/* hierbas colgadas */}
      {[0, 1, 2].map((i) => { const sw = Math.sin(t * 0.03 + i) * 1.2; return (
        <g key={i} transform={`rotate(${sw} ${88 + i * 3} 2)`}><path d={`M${88 + i * 3} 2 l0 8`} stroke={dark(wood, pal, 0.2)} strokeWidth={0.4} />
          {[...Array(5)].map((_, k) => <ellipse key={k} cx={88 + i * 3 + (hash(k + i) - 0.5) * 3} cy={11 + k * 1.6} rx={1} ry={1.8} fill={lerpHex("#6A8A4A", pal.ink, 0.2 + k * 0.05)} />)}</g>); })}
      {/* mesa baja con mortero y libro */}
      <rect x={4} y={62} width={92} height={4} fill={url(`${id}w`)} /><rect x={8} y={66} width={4} height={13} fill={dark(wood, pal, 0.3)} /><rect x={88} y={66} width={4} height={13} fill={dark(wood, pal, 0.3)} />
      <path d="M22 50 L42 50 Q40 62 32 62 Q24 62 22 50 Z" fill={lerpHex("#9A9488", pal.ink, 0.2)} /><ellipse cx={32} cy={50} rx={10} ry={2} fill={dark("#9A9488", pal, 0.4)} />
      <path d="M36 50 L44 40" stroke={lerpHex("#B8B0A0", pal.ink, 0.15)} strokeWidth={2.4} strokeLinecap="round" />
      {br > 0 ? [0, 1, 2].map((k) => { const ph = ((t * 0.02 + k / 3) % 1); return <circle key={k} cx={32 + Math.sin(ph * 6 + k) * 2} cy={48 - ph * 18} r={2 + ph * 3} fill={pal.wallLit} opacity={0.25 * (1 - ph) * br} />; }) : null}
      <path d="M56 62 L58 54 L80 54 L82 62 Z" fill={lerpHex("#7A2E24", pal.ink, 0.25)} /><path d="M58 55 L80 55 L79 60 L59 60 Z" fill={lerpHex("#EDE2C2", pal.ink, 0.15)} /><path d="M69 55 L69 60" stroke={pal.ink} strokeWidth={0.3} />
    </g>
  );
};
