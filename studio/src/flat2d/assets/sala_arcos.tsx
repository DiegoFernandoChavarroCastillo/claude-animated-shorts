// sala_arcos · fondo del kit (D123): interior noble de la antigüedad visto de frente: pared del fondo con tres arcos abiertos al cielo, columnas con volumen
// a los lados y suelo de losas en perspectiva que empieza en la franja de los pies (y ≈ 106). `opts.estilo`: marmol (claro, vetas) | piedra (sillares oscuros).
// `opts.cortinas` true = cortinajes del color de acento. Sirve de academia, palacio, senado, templo o salón.
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, dark, lite, url } from "./shade";

export const SalaArcos: AssetFC = ({ pal, t, seed, opts }) => {
  const piedra = opt(opts, "estilo", "marmol") === "piedra", id = `sa${seed}`, G = 106;
  const wall = piedra ? lerpHex(pal.wall, pal.rock, 0.4) : lerpHex(pal.wallLit, pal.rock, 0.42), stone = piedra ? lerpHex(pal.wall, pal.wallLit, 0.25) : pal.wallLit;
  const arch = (cx: number, w: number, top: number) => `M${cx - w} ${G} L${cx - w} ${top + w} A${w} ${w} 0 0 1 ${cx + w} ${top + w} L${cx + w} ${G} Z`;
  const col = (x: number, w: number, k: number) => (
    <g key={k}>
      <Grad id={`${id}c${k}`} h a={dark(stone, pal, 0.3)} mid={lite(stone, pal, 0.25)} b={dark(stone, pal, 0.18)} at={0.62} />
      <rect x={x - w / 2} y={-10} width={w} height={G + 12} fill={url(`${id}c${k}`)} />
      {[-0.3, 0, 0.3].map((d) => <path key={d} d={`M${x + d * w} -10 L${x + d * w} ${G - 2}`} stroke={dark(stone, pal, 0.3)} strokeWidth={0.35} opacity={0.6} />)}
      <rect x={x - w * 0.7} y={G - 3} width={w * 1.4} height={5} rx={0.6} fill={lite(stone, pal, 0.1)} /><rect x={x - w * 0.62} y={18} width={w * 1.24} height={3.4} rx={0.6} fill={lite(stone, pal, 0.15)} />
    </g>
  );
  return (
    <g>
      <Grad id={`${id}w`} a={dark(wall, pal, 0.28)} mid={wall} b={lite(wall, pal, 0.1)} at={0.45} /><Grad id={`${id}f`} a={piedra ? lite(stone, pal, 0.1) : lerpHex(stone, pal.rock, 0.25)} b={piedra ? dark(stone, pal, 0.45) : lerpHex(pal.rock, pal.ink, 0.25)} />
      <path d={`M-40 -20 L140 -20 L140 ${G} L-40 ${G} Z ${arch(50, 13, 46)} ${arch(16, 9, 58)} ${arch(84, 9, 58)}`} fill={url(`${id}w`)} fillRule="evenodd" />
      {[[50, 13, 46], [16, 9, 58], [84, 9, 58]].map(([cx, w, top], i) => <path key={i} d={arch(cx, w, top)} fill="none" stroke={lite(stone, pal, 0.2)} strokeWidth={1.6} />)}
      {!piedra ? <g><rect x={-40} y={24} width={180} height={5} fill={pal.accent} opacity={0.85} /><rect x={-40} y={22.6} width={180} height={1.2} fill={pal.rim} /><rect x={-40} y={29.2} width={180} height={1.2} fill={pal.rim} /></g> : null}
      {piedra ? [...Array(7)].map((_, r) => <path key={r} d={`M-40 ${10 + r * 14} L140 ${10 + r * 14}`} stroke={dark(wall, pal, 0.3)} strokeWidth={0.3} opacity={0.5} />) : null}
      {opt(opts, "cortinas", false) ? [-1, 1].map((sd) => <path key={sd} d={`M${50 + sd * 52} -10 Q${50 + sd * 30} 30 ${50 + sd * 44 + Math.sin(t * 0.03) * 0.6} ${G - 22} L${50 + sd * 52} ${G - 18} Z`} fill={dark(pal.accent, pal, 0.15)} opacity={0.95} />) : null}
      <rect x={-40} y={G} width={180} height={100} fill={url(`${id}f`)} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${50 + (i - 4) * 9} ${G} L${50 + (i - 4) * 46} 200`} stroke={dark(stone, pal, 0.4)} strokeWidth={0.35} opacity={0.55} />)}
      {[...Array(6)].map((_, i) => { const y = G + (i + 1) ** 1.9 * 2.2; return <path key={i} d={`M-40 ${y} L140 ${y}`} stroke={dark(stone, pal, 0.4)} strokeWidth={0.35} opacity={0.5} />; })}
      {[...Array(14)].map((_, i) => <path key={i} d={`M${hash(i + seed) * 100} ${G + 6 + hash(i * 2 + seed) * 60} l${3 + hash(i * 3) * 6} ${1 + hash(i * 5) * 2}`} stroke={lite(stone, pal, 0.4)} strokeWidth={0.25} opacity={piedra ? 0 : 0.5} />)}
      {col(4, 9, 0)}{col(96, 9, 1)}
    </g>
  );
};
