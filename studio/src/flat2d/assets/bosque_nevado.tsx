// bosque_nevado · fondo: claro de un bosque de pinos nevados de noche, en invierno. Tres filas de abetos con nieve en las ramas que se aclaran
// con la distancia, montículos de nieve y el suelo blanco azulado que empieza en la franja de los pies (y ≈ 106), con huellas y brillo de luna.
// Va sobre `cielo` (luna) y con `particulas` nieve. opts.pinos (9). Acción propia: `viento` sacude las copas y levanta nieve de las ramas mientras dura.
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, url } from "./shade";

export const BosqueNevado: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `bn${seed}`, n = opt(opts, "pinos", 9), vi = p.viento ?? 0, wind = vi > 0 && vi < 1 ? Math.sin(vi * Math.PI) : 0;
  const snow = lerpHex("#EEF4FF", pal.wallLit, 0.15), snowSh = lerpHex("#9DB0D0", pal.bg, 0.3), pine = lerpHex("#1F3A3A", pal.ink, 0.25);
  const tree = (x: number, base: number, h: number, c: string, sc: string, k: number) => {
    const sw = Math.sin(t * 0.04 + k) * 0.4 + wind * Math.sin(t * 0.5 + k) * 2;
    return <g key={k}>
      <rect x={x - h * 0.03} y={base - h * 0.12} width={h * 0.06} height={h * 0.12} fill={lerpHex("#3A2A22", pal.ink, 0.4)} />
      {[0, 1, 2, 3].map((j) => {
        const y = base - h * 0.1 - j * h * 0.22, w = h * (0.34 - j * 0.07), tip = y - h * 0.3;
        return <g key={j}><path d={`M${x - w} ${y} L${x + sw * (j + 1) * 0.3} ${tip} L${x + w} ${y} Z`} fill={c} />
          <path d={`M${x - w * 0.9} ${y - 0.4} Q${x - w * 0.4} ${y - h * 0.05} ${x} ${y - 0.6} Q${x + w * 0.5} ${y - h * 0.06} ${x + w * 0.9} ${y - 0.4} L${x + w * 0.6} ${y - h * 0.08} L${x + sw * 0.3} ${tip + h * 0.12} L${x - w * 0.6} ${y - h * 0.08} Z`} fill={sc} opacity={0.85} /></g>;
      })}
    </g>;
  };
  const row = (y: number, h: number, cnt: number, fade: number, off: number) => [...Array(cnt)].map((_, i) => {
    const x = -10 + ((i + hash(i * 3.1 + seed + off) * 0.7) / cnt) * 120, hh = h * (0.75 + hash(i + seed + off) * 0.5);
    return tree(x, y + hash(i * 1.7 + off) * 3, hh, lerpHex(pine, pal.bg, fade), lerpHex(snow, pal.bg, fade * 0.8), i + off * 10);
  });
  return (
    <g>
      <Grad id={`${id}g`} a={lerpHex(snow, snowSh, 0.35)} b={lerpHex(snowSh, pal.bg, 0.55)} />
      <path d={`M-40 200 L-40 96 Q20 90 60 95 Q100 99 140 93 L140 200 Z`} fill={lerpHex(snowSh, pal.bg, 0.45)} />
      {row(97, 24, 12, 0.6, 1)}
      <path d={`M-40 200 L-40 101 Q10 98 50 101 Q90 104 140 99 L140 200 Z`} fill={lerpHex(snowSh, pal.bg, 0.25)} />
      {row(103, 36, Math.round(n * 0.8), 0.32, 2)}
      <path d={`M-40 200 L-40 106 Q20 103 55 106.5 Q95 109 140 105 L140 200 Z`} fill={url(`${id}g`)} />
      {row(108, 58, Math.max(2, Math.round(n * 0.35)), 0.05, 3).filter((_, i) => i % 2 === 0)}
      {[...Array(7)].map((_, i) => <ellipse key={i} cx={-5 + hash(i * 5.3 + seed) * 110} cy={112 + hash(i * 2.2) * 40} rx={8 + hash(i) * 10} ry={2 + hash(i + 1) * 1.5} fill={lerpHex(snow, pal.glow, 0.25)} opacity={0.22} />)}
      {[...Array(10)].map((_, i) => <ellipse key={i} cx={30 + i * 4 + (i % 2) * 2} cy={130 + i * 3} rx={0.9} ry={0.5} fill={snowSh} opacity={0.6} />)}
      {wind > 0 ? [...Array(16)].map((_, i) => <circle key={i} cx={(hash(i + seed) * 120 + t * 2) % 120 - 10} cy={60 + hash(i * 7) * 50} r={0.6} fill={snow} opacity={wind * 0.8} />) : null}
    </g>
  );
};
