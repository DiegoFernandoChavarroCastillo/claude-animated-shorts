// aldea_obreros · fondo: la aldea de los constructores al pie de la meseta de Guiza. Casas de adobe con techos planos, una panadería con hornos de
// barro encendidos, moldes de pan cónicos apilados y grandes jarras de cerveza tapadas con barro; a la izquierda, en la ladera, las tumbas pequeñas
// de los obreros con sus estelas; al fondo, la silueta de la Gran Pirámide. Suelo donde pisan los personajes: y ≈ 104–110. Va sobre `cielo`.
// Acción propia: `bake` los hornos se avivan y el humo sube más denso mientras dura. Siempre sale algo de humo.
import React from "react";
import { type AssetFC, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, dark, lite, url } from "./shade";

export const AldeaObreros: AssetFC = ({ pal, t, seed, p }) => {
  const id = `ao${seed}`, bk = p.bake ?? 0, baking = bk > 0 && bk < 1 ? 1 : 0;
  const adobe = lerpHex("#B88A5A", pal.wall, 0.25), sand = lerpHex("#E0B47A", pal.wallLit, 0.15), pyr = lerpHex("#EDE3CC", pal.bg, 0.3), clay = lerpHex("#A0603A", pal.rock, 0.3);
  const fire = lerpHex("#FF9A40", pal.glow, 0.2);
  const house = (x: number, y: number, w: number, h: number, k: number) => (
    <g key={k}>
      <rect x={x} y={y - h} width={w} height={h} fill={lerpHex(adobe, pal.wallLit, 0.12 + hash(k) * 0.15)} />
      <rect x={x + w * 0.72} y={y - h} width={w * 0.28} height={h} fill={dark(adobe, pal, 0.18)} />
      <rect x={x - 0.4} y={y - h - 0.8} width={w + 0.8} height={0.9} fill={dark(adobe, pal, 0.3)} />
      <rect x={x + w * 0.25} y={y - h * 0.62} width={w * 0.2} height={h * 0.62} fill={dark(adobe, pal, 0.55)} />
      {[...Array(3)].map((_, j) => <path key={j} d={`M${x} ${y - h + 1.6 + j * (h / 3)} L${x + w * 0.72} ${y - h + 1.6 + j * (h / 3)}`} stroke={dark(adobe, pal, 0.15)} strokeWidth={0.2} opacity={0.6} />)}
    </g>
  );
  return (
    <g>
      <Grad id={`${id}s`} a={lite(sand, pal, 0.1)} mid={dark(sand, pal, 0.55)} b={dark(sand, pal, 0.7)} at={0.2} />
      {/* la Gran Pirámide al fondo */}
      <path d="M58 92 L80 64 L104 92 Z" fill={pyr} /><path d="M80 64 L86 92 L104 92 Z" fill={dark(pyr, pal, 0.25)} />
      <path d="M80 64 L86 92" stroke={pal.rim} strokeWidth={0.4} opacity={0.6} />
      {/* la meseta y la ladera de las tumbas */}
      <path d="M-30 100 L-30 84 Q0 80 26 90 L130 92 L130 100 Z" fill={lerpHex(sand, pal.bg, 0.2)} />
      <rect x={-40} y={96} width={180} height={90} fill={url(`${id}s`)} />
      {/* tumbas de los obreros: pequeñas, de adobe, con estela */}
      {[[-8, 90], [2, 89], [12, 91], [-2, 95]].map(([x, y], i) => (
        <g key={`t${i}`}>
          <path d={`M${x - 3} ${y} L${x - 2} ${y - 3.5} L${x + 2} ${y - 3.5} L${x + 3} ${y} Z`} fill={lerpHex(adobe, pal.wallLit, 0.2)} />
          <path d={`M${x - 2} ${y - 3.5} Q${x} ${y - 6} ${x + 2} ${y - 3.5}`} fill={lerpHex(adobe, pal.wallLit, 0.1)} />
          <rect x={x - 0.7} y={y - 2.6} width={1.4} height={2.6} rx={0.6} fill={lite(pyr, pal, 0.2)} />
        </g>
      ))}
      {/* casas de adobe */}
      {house(20, 98, 11, 7, 1)}{house(33, 97, 9, 6, 2)}{house(96, 99, 12, 7.5, 3)}{house(110, 98, 10, 6.5, 4)}
      {/* la panadería: hornos de barro encendidos */}
      {[[50, 104], [62, 104], [74, 104]].map(([x, y], i) => {
        const fl = 0.6 + 0.4 * Math.sin(t * 0.5 + i * 2), glow = 0.5 + baking * 0.5;
        return (
          <g key={`o${i}`}>
            <Halo id={`${id}h${i}`} cx={x} cy={y - 2} r={6 + glow * 5} color={fire} a={0.35 * glow} />
            <path d={`M${x - 4.5} ${y} Q${x - 5} ${y - 8.5} ${x} ${y - 9} Q${x + 5} ${y - 8.5} ${x + 4.5} ${y} Z`} fill={clay} />
            <path d={`M${x + 1.5} ${y - 8.6} Q${x + 5} ${y - 7} ${x + 4.5} ${y}`} stroke={dark(clay, pal, 0.3)} strokeWidth={1.2} fill="none" />
            <path d={`M${x - 1.8} ${y} Q${x} ${y - 4} ${x + 1.8} ${y} Z`} fill={lerpHex(fire, "#FFE08A", fl * 0.5)} opacity={0.6 + 0.4 * glow} />
            {/* humo */}
            {[...Array(4 + baking * 3)].map((_, k) => { const ph = (t * (0.012 + baking * 0.01) + k / (4 + baking * 3) + hash(i)) % 1; return <circle key={k} cx={x + Math.sin(ph * 6 + i) * 2 + ph * 4} cy={y - 10 - ph * 34} r={1.4 + ph * 4} fill={lerpHex(pal.wallLit, pal.wall, 0.3)} opacity={(0.45 + baking * 0.2) * (1 - ph)} />; })}
          </g>
        );
      })}
      {/* moldes de pan cónicos apilados y jarras de cerveza */}
      {[...Array(7)].map((_, i) => { const x = 44 + (i % 4) * 2.8 + (i > 3 ? 1.4 : 0), y = 108 - (i > 3 ? 2.6 : 0); return <path key={`b${i}`} d={`M${x - 1.2} ${y} L${x} ${y - 4} L${x + 1.2} ${y} Z`} fill={lerpHex(clay, pal.wallLit, 0.2)} stroke={dark(clay, pal, 0.3)} strokeWidth={0.15} />; })}
      {[...Array(4)].map((_, i) => { const x = 82 + i * 4.2, y = 109; return (
        <g key={`j${i}`}>
          <path d={`M${x - 0.9} ${y - 8} L${x + 0.9} ${y - 8} Q${x + 2.4} ${y - 5} ${x + 1.3} ${y - 0.5} L${x - 1.3} ${y - 0.5} Q${x - 2.4} ${y - 5} ${x - 0.9} ${y - 8} Z`} fill={lerpHex(clay, pal.wall, 0.2)} />
          <ellipse cx={x} cy={y - 8.2} rx={1.3} ry={0.8} fill={lerpHex(adobe, pal.ink, 0.25)} />
          <path d={`M${x + 1.2} ${y - 6} Q${x + 2.2} ${y - 4} ${x + 1.3} ${y - 1}`} stroke={lite(clay, pal, 0.35)} strokeWidth={0.3} fill="none" />
        </g>
      ); })}
      {/* hogazas sobre una estera */}
      <rect x={60} y={108.6} width={14} height={1.4} rx={0.5} fill={lerpHex("#C8A060", pal.rock, 0.25)} />
      {[...Array(5)].map((_, i) => <ellipse key={`p${i}`} cx={lerp(61.5, 72.5, i / 4)} cy={108.3} rx={1.3} ry={0.9} fill={lerpHex("#D89A50", pal.glow, 0.2)} />)}
      {/* pisadas y polvo del suelo */}
      {[...Array(24)].map((_, i) => <ellipse key={`d${i}`} cx={hash(i * 1.3 + seed) * 150 - 25} cy={112 + hash(i * 3.1) * 60} rx={1 + hash(i) * 3} ry={0.35} fill={dark(sand, pal, 0.3)} opacity={0.45} />)}
    </g>
  );
};
