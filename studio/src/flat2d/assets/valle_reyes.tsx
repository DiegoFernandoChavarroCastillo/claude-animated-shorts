// valle_reyes · fondo: el Valle de los Reyes: riscos de caliza con el pico piramidal de El Qurn al fondo, las entradas de las tumbas de
// los grandes faraones talladas en la roca (una grande a la derecha, la de Ramsés VI) y, en el centro del suelo, la escalera de la tumba
// de Tutankamón que baja hacia una puerta sellada. El primer plano se oscurece con sombra de roca desde y ≈ 108 (franja de subtítulos).
// Va sobre `cielo`. Lienzo 100 × 178. opts: `tapada` 0..1 (barro y escombros llenan la escalera), `chozas` 0..1 (chozas de piedra de los
// obreros encima), `saqueo` 0..1 (las puertas de las otras tumbas abiertas a golpes, con objetos tirados delante). Acciones propias:
// `bury` el barro y las lascas cubren la escalera (se queda); `huts` aparecen las chozas encima (se queda); `loot` saquean las otras tumbas
// (se queda); `glow` brilla un resplandor de oro bajo tierra, donde está la tumba (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, dark, lite, url } from "./shade";

export const ValleReyes: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `vr${seed}`;
  const keep = (k: string, a: string) => (p[a] !== undefined ? Math.max(opt(opts, k, 0), clamp01(p[a])) : opt(opts, k, 0));
  const tap = keep("tapada", "bury"), hut = keep("chozas", "huts"), loot = keep("saqueo", "loot"), glow = clamp01(p.glow ?? 0);
  const cliff = lerpHex("#D8B07A", pal.wall, 0.35), cliffD = dark(cliff, pal, 0.3), sand = lerpHex("#E2C08A", pal.wallLit, 0.2);
  const shadow = lerpHex("#5A3E26", pal.ink, 0.3), stone = lerpHex("#BFA27A", pal.rock, 0.35), gold = lerpHex("#E8B640", pal.glow, 0.2);
  const door = (x: number, y: number, w: number, h: number, k: number) => (
    <g key={k}>
      <rect x={x - w / 2 - 1.2} y={y - h - 1.2} width={w + 2.4} height={h + 1.2} fill={lite(cliff, pal, 0.15)} />
      <rect x={x - w / 2} y={y - h} width={w} height={h} fill={dark(shadow, pal, 0.3)} />
      {/* puerta sellada que se rompe con el saqueo */}
      <rect x={x - w / 2} y={y - h} width={w} height={h} fill={lite(stone, pal, 0.1)} opacity={1 - loot} />
      {loot > 0 && [...Array(4)].map((_, j) => (
        <rect key={j} x={x - w / 2 + j * w * 0.22 + loot * (j - 1.5) * 2} y={y - 1.4} width={w * 0.2} height={1.4} fill={stone} opacity={loot} transform={`rotate(${(j - 1.5) * 18 * loot} ${x} ${y})`} />
      ))}
      {loot > 0.3 && <g opacity={(loot - 0.3) / 0.7}><path d={`M${x - w / 2 - 3} ${y + 1} l2 -1.4 l2 1.4 Z`} fill={gold} /><circle cx={x + w / 2 + 2} cy={y + 0.6} r={0.8} fill={gold} /></g>}
    </g>
  );
  // escalera de la tumba de Tutankamón: un foso rectangular en perspectiva con dieciséis escalones que bajan a una puerta
  const sx = 50, sy = 100, steps = [...Array(16)].map((_, i) => {
    const f = i / 15, w = lerp(14, 9, f), y = lerp(sy, sy - 10, f);
    return <rect key={i} x={sx - w / 2} y={y} width={w} height={0.7} fill={i % 2 ? dark(sand, pal, 0.18) : dark(sand, pal, 0.3)} />;
  });
  return (
    <g>
      <Grad id={`${id}c`} a={lite(cliff, pal, 0.2)} b={cliffD} /><Grad id={`${id}s`} a={sand} b={dark(sand, pal, 0.2)} />
      <Grad id={`${id}f`} a={dark(shadow, pal, 0.15)} b={dark(shadow, pal, 0.75)} at={0.3} mid={dark(shadow, pal, 0.5)} />
      {/* El Qurn y los riscos */}
      <path d="M-30 86 L-6 70 L10 74 L30 52 L44 38 L52 34 L60 40 L74 58 L92 64 L108 60 L130 72 L130 92 L-30 92 Z" fill={url(`${id}c`)} />
      <path d="M44 38 L52 34 L60 40 L54 46 Z" fill={lite(cliff, pal, 0.3)} opacity={0.7} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${-20 + i * 17} ${74 + hash(seed + i) * 6} l${4 + hash(i) * 4} ${10 + hash(i + 3) * 6}`} stroke={cliffD} strokeWidth={0.5} opacity={0.6} />)}
      {/* faldas de los riscos y entradas de las otras tumbas */}
      <path d="M-30 90 Q20 84 50 88 Q80 84 130 90 L130 98 L-30 98 Z" fill={dark(cliff, pal, 0.12)} />
      {door(14, 92, 6, 7, 0)}{door(84, 93, 9, 10, 1)}{door(-14, 94, 5, 6, 2)}{door(116, 94, 5, 6, 3)}
      {/* suelo del valle */}
      <path d="M-30 96 Q50 92 130 96 L130 112 L-30 112 Z" fill={url(`${id}s`)} />
      {/* la escalera hacia la tumba */}
      <path d={`M${sx - 8} 101 L${sx + 8} 101 L${sx + 5} 89.4 L${sx - 5} 89.4 Z`} fill={dark(shadow, pal, 0.2)} />
      {steps}
      <rect x={sx - 3.2} y={86} width={6.4} height={4.4} fill={lite(stone, pal, 0.2)} />
      {[0, 1, 2].map((j) => <ellipse key={j} cx={sx - 2 + j * 2} cy={88} rx={0.6} ry={0.5} fill={pal.accent} opacity={0.8} />)}
      {glow > 0 && <Halo id={`${id}h`} cx={sx} cy={95} r={lerp(4, 20, glow)} color={gold} a={0.8 * glow} />}
      {/* barro y lascas que la tapan */}
      {tap > 0 && (
        <g>
          <path d={`M${sx - 9} 101.4 L${sx + 9} 101.4 L${sx + 6} ${lerp(101.4, 88, tap)} Q${sx} ${lerp(101.4, 86, tap)} ${sx - 6} ${lerp(101.4, 88, tap)} Z`} fill={lerpHex(sand, shadow, 0.25)} />
          {[...Array(14)].map((_, i) => <ellipse key={i} cx={sx - 8 + hash(seed + i) * 16} cy={lerp(101, 88, tap * hash(i + 9))} rx={0.9} ry={0.5} fill={lite(stone, pal, 0.2)} opacity={tap} />)}
        </g>
      )}
      {/* chozas de piedra de los obreros */}
      {hut > 0 && [[sx - 9, 0], [sx + 3, 1], [sx + 14, 2]].map(([x, k]) => {
        const h = 5 * clamp01(hut * 3 - k);
        return (
          <g key={k}>
            <rect x={x - 4} y={93 - h} width={9} height={h} fill={url(`${id}c`)} stroke={cliffD} strokeWidth={0.3} />
            {h > 2 && [...Array(3)].map((_, j) => <path key={j} d={`M${x - 4} ${93 - h + 1.6 * (j + 1)} h9`} stroke={cliffD} strokeWidth={0.25} />)}
            {h > 4 && <path d={`M${x - 4.6} ${93 - h} h10.2`} stroke={lerpHex("#7A5A36", pal.rock, 0.3)} strokeWidth={0.9} />}
          </g>
        );
      })}
      {/* primer plano de roca en sombra (franja de subtítulos oscura) */}
      <path d="M-30 108 Q20 104 50 107 Q80 104 130 108 L130 178 L-30 178 Z" fill={url(`${id}f`)} />
      {[...Array(10)].map((_, i) => <ellipse key={i} cx={-20 + i * 16 + hash(seed + i) * 6} cy={108 + hash(i) * 3} rx={3 + hash(i + 1) * 4} ry={1.4} fill={dark(shadow, pal, 0.3)} opacity={0.7} />)}
      <rect x={-30} y={107} width={160} height={71} fill={pal.ink} opacity={0.45} />
    </g>
  );
};
