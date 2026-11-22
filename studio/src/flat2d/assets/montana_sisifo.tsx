// montana_sisifo · fondo: el monte del castigo de Sísifo al atardecer. Una ladera recta y larga sube desde el llano (pie en x 12, y 110 del lienzo
// 100×178) hasta la cima (x 92, y 70), con un sendero gastado por la roca; detrás, crestas lejanas con bruma y, abajo, el llano pedregoso del
// inframundo. Va sobre `cielo`. En el cuadro, la ladera es y = 0,618 − (x − 0,12)·0,281 (pendiente de 26,5° para `sisifo_roca`). opts.roca_pie
// true = una roca espera al pie. Acciones propias: `roll` una roca baja rodando desde la cima hasta el llano levantando polvo; `shine` la cima se
// enciende con la última luz.
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, dark, lite, url } from "./shade";

const FOOT = { x: 12, y: 110 }, TOP = { x: 92, y: 70 };
const slopeY = (x: number) => FOOT.y + ((x - FOOT.x) * (TOP.y - FOOT.y)) / (TOP.x - FOOT.x);

export const MontanaSisifo: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `ms${seed}`, rl = p.roll ?? 0, sh = p.shine ?? 0;
  const far = lerpHex(pal.bg, pal.ink, 0.38), mid = lerpHex(pal.rock, pal.ink, 0.45), near = lerpHex(pal.rock, pal.ink, 0.22);
  const ridge = (sd: number, base: number, amp: number, n: number) =>
    [...Array(n + 1)].map((_, i) => `${(-4 + (108 * i) / n).toFixed(1)} ${(base - amp * hash(sd + i * 1.3)).toFixed(1)}`).join(" L");
  // roca que baja rodando
  const k = rl > 0 && rl < 1 ? rl : -1, rx = lerp(TOP.x - 4, FOOT.x - 2, k * k), rr = 3.2, ry = slopeY(rx) - rr - Math.abs(Math.sin(k * 14)) * 2.2 * (1 - k);
  return (
    <g>
      <Grad id={`${id}f`} a={lerpHex(far, pal.glow, 0.15)} b={far} />
      <Grad id={`${id}m`} a={lite(mid, pal, 0.1)} b={dark(mid, pal, 0.3)} />
      <Grad id={`${id}n`} a={lite(near, pal, 0.25)} b={dark(near, pal, 0.5)} />
      <Grad id={`${id}g`} a={dark(near, pal, 0.25)} b={dark(near, pal, 0.7)} />
      {/* crestas lejanas con bruma */}
      <path d={`M-4 98 L${ridge(seed + 2, 92, 26, 9)} L104 98 Z`} fill={url(`${id}f`)} opacity={0.75} />
      <path d={`M-4 106 L${ridge(seed + 9, 102, 18, 12)} L104 106 Z`} fill={url(`${id}m`)} opacity={0.85} />
      <rect x={-4} y={88} width={108} height={22} fill={pal.glow} opacity={0.12} />
      {/* el monte: ladera recta hacia la cima y caída al otro lado */}
      <path d={`M-4 ${FOOT.y} L${FOOT.x} ${FOOT.y} L${TOP.x} ${TOP.y} L${TOP.x + 3} ${TOP.y - 1.2} L${TOP.x + 6} ${TOP.y + 3} L104 ${TOP.y + 18} L104 180 L-4 180 Z`} fill={url(`${id}n`)} />
      {/* estratos y grietas de la ladera */}
      {/* franja iluminada bajo el filo de la ladera y estratos paralelos */}
      <path d={`M${FOOT.x} ${FOOT.y} L${TOP.x} ${TOP.y} L104 ${TOP.y + 5} L104 ${TOP.y + 12} L${FOOT.x + 6} ${FOOT.y + 7} Z`} fill={lite(near, pal, 0.35)} opacity={0.55} />
      {[...Array(5)].map((_, i) => { const x0 = FOOT.x + 12 + i * 14 + hash(i) * 5, w = 8 + hash(i + 1) * 10; return (
        <path key={`s${i}`} d={`M${x0} ${slopeY(x0) + 9 + i * 2} l${w} ${(-w * 40) / 80 + 1}`} stroke={dark(near, pal, 0.35)} strokeWidth={0.7} opacity={0.6} />
      ); })}
      {[...Array(6)].map((_, i) => { const x = FOOT.x + 14 + i * 13 + hash(i + 30) * 6, y = slopeY(x) + 14 + hash(i + 31) * 20; return (
        <path key={`r${i}`} d={`M${x - 3} ${y} q1 -3 3 -3 q2.4 0 3 3 Z`} fill={dark(near, pal, 0.25)} />
      ); })}
      {/* el sendero gastado por la roca y su luz de borde */}
      <path d={`M${FOOT.x - 4} ${FOOT.y + 0.6} L${TOP.x} ${TOP.y + 0.6}`} stroke={lite(near, pal, 0.45)} strokeWidth={1.8} opacity={0.55} />
      <path d={`M-4 ${FOOT.y} L${FOOT.x} ${FOOT.y} L${TOP.x} ${TOP.y} L${TOP.x + 3} ${TOP.y - 1.2}`} stroke={pal.rim} strokeWidth={0.7} fill="none" opacity={0.85} />
      {/* piedras sueltas y arbustos secos junto al sendero */}
      {[...Array(12)].map((_, i) => { const x = FOOT.x + 3 + hash(i + 20) * 76, y = slopeY(x) + 1.5 + hash(i + 21) * 3; return <ellipse key={i} cx={x} cy={y} rx={0.6 + hash(i + 22) * 1.2} ry={0.4 + hash(i + 23) * 0.6} fill={dark(near, pal, 0.5)} />; })}
      {[...Array(5)].map((_, i) => { const x = FOOT.x + 8 + i * 15 + hash(i + 40) * 5, y = slopeY(x) + 0.5; return (
        <path key={`b${i}`} d={`M${x} ${y} l-1.5 -3 M${x} ${y} l0.4 -3.6 M${x} ${y} l1.8 -2.6`} stroke={dark(near, pal, 0.6)} strokeWidth={0.4} />
      ); })}
      {/* la cima se enciende con la última luz */}
      {sh > 0 ? <Halo id={`${id}h`} cx={TOP.x} cy={TOP.y - 2} r={14} color={pal.glow} a={0.6 * Math.sin(Math.min(1, sh) * Math.PI * 0.5 + 0.0001)} /> : null}
      {/* el llano pedregoso al pie (franja de subtítulos: oscuro y liso para que se lean) */}
      <path d={`M-4 ${FOOT.y} L${FOOT.x} ${FOOT.y} L${FOOT.x + 30} ${FOOT.y + 70} L-4 180 Z`} fill={url(`${id}g`)} opacity={0.6} />
      {[...Array(30)].map((_, i) => <circle key={`g${i}`} cx={-2 + hash(i + 60) * 104} cy={FOOT.y + 6 + hash(i + 61) * 60} r={0.3 + hash(i + 62) * 0.7} fill={i % 2 ? pal.wallLit : pal.ink} opacity={0.12} />)}
      {opt(opts, "roca_pie", false) ? <g>
        <ellipse cx={FOOT.x - 3} cy={FOOT.y + 0.6} rx={5} ry={1} fill="#000" opacity={0.3} />
        <circle cx={FOOT.x - 3} cy={FOOT.y - 3.6} r={4} fill={lerpHex(pal.rock, "#8A8478", 0.35)} />
        <path d={`M${FOOT.x - 6} ${FOOT.y - 5.5} q3 -2.2 6 -0.5`} stroke={pal.rim} strokeWidth={0.5} fill="none" />
      </g> : null}
      {k >= 0 ? <g>
        {[...Array(5)].map((_, i) => { const d = i * 0.05, kk = clamp01(k - d), px = lerp(TOP.x - 4, FOOT.x - 2, kk * kk); return <circle key={i} cx={px + 2} cy={slopeY(px) - 1} r={1 + i * 0.6} fill={lite(near, pal, 0.4)} opacity={0.35 - i * 0.06} />; })}
        <g transform={`translate(${rx} ${ry}) rotate(${-k * 1400})`}>
          <circle r={rr} fill={lerpHex(pal.rock, "#8A8478", 0.35)} /><path d={`M${-rr * 0.6} ${-rr * 0.2} l2 1 l1 2`} stroke={pal.ink} strokeWidth={0.4} fill="none" />
          <path d={`M${-rr * 0.7} ${-rr * 0.5} q${rr * 0.7} ${-rr * 0.6} ${rr * 1.3} 0`} stroke={pal.rim} strokeWidth={0.5} fill="none" />
        </g>
      </g> : null}
    </g>
  );
};
