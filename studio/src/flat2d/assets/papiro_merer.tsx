// papiro_merer · escenario: el diario de Merer, un rollo de papiro abierto entre sus dos rollos, con la trama de fibras, una fila de cabecera con
// los días en tinta roja y columnas de escritura hierática en tinta negra debajo (se lee de derecha a izquierda); rotos y manchas de 4.500 años.
// opts: `manos` (false) dos manos lo sostienen por los rollos (tú lo tienes); `abierto` 0..1 (1); `escrito` 0..1 (1).
// Acciones propias: `unroll` el rollo derecho corre y abre la hoja (se queda); `write` las columnas aparecen de derecha a izquierda, como si
// se escribieran (se queda); `glow` la hoja se ilumina (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, idle, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, Vol, dark, lite, url } from "./shade";

export const PapiroMerer: AssetFC = ({ pal, t, seed, p, opts }) => {
  const id = `pm${seed}`, I = idle(t, seed);
  const u = p.unroll !== undefined ? clamp01(p.unroll) : opt(opts, "abierto", 1), w = p.write !== undefined ? clamp01(p.write) : opt(opts, "escrito", 1), gl = clamp01(p.glow ?? 0);
  const papy = lerpHex("#E9D49C", pal.wallLit, 0.2), ink = lerpHex("#1E140C", pal.ink, 0.3), red = lerpHex("#B0402A", pal.accent, 0.25);
  const L0 = 10, R = lerp(18, 90, u), top = 14, bot = 58, ncol = 13;
  const hands = opt(opts, "manos", false), dy = I.bob * 0.5;
  const roll = (x: number) => (
    <g>
      <rect x={x - 3.2} y={top - 3} width={6.4} height={bot - top + 6} rx={3} fill={url(`${id}r`)} />
      <ellipse cx={x} cy={top - 3} rx={3.2} ry={1.2} fill={lite(papy, pal, 0.25)} />
      <ellipse cx={x} cy={top - 3} rx={1.4} ry={0.5} fill={dark(papy, pal, 0.35)} />
    </g>
  );
  return (
    <g transform={`translate(0 ${dy})`}>
      <Grad id={`${id}p`} a={lite(papy, pal, 0.2)} b={dark(papy, pal, 0.12)} /><Grad id={`${id}r`} a={dark(papy, pal, 0.25)} mid={lite(papy, pal, 0.2)} b={dark(papy, pal, 0.35)} h at={0.4} />
      <Vol id={`${id}k`} c={pal.skin} pal={pal} k={0.7} />
      {gl > 0 && <Halo id={`${id}g`} cx={50} cy={36} r={46 * gl} color={pal.glow} a={0.5} />}
      {/* sombra bajo la hoja */}
      <rect x={L0 + 1} y={bot + 1.5} width={R - L0} height={2} rx={1} fill={pal.ink} opacity={0.18} />
      {/* la hoja, con bordes comidos */}
      <path d={`M${L0} ${top} L${R} ${top} L${R} ${bot} L${L0 + (R - L0) * 0.7} ${bot} l-1.5 -1.6 l-2 1.2 L${L0} ${bot} Z`} fill={url(`${id}p`)} />
      {/* fibras del papiro: trama horizontal y vertical */}
      {[...Array(18)].map((_, i) => <path key={`h${i}`} d={`M${L0} ${top + 1 + i * 2.5} L${R} ${top + 1.3 + i * 2.5}`} stroke={dark(papy, pal, 0.18)} strokeWidth={0.15} opacity={0.5} />)}
      {[...Array(Math.floor((R - L0) / 3))].map((_, i) => <path key={`v${i}`} d={`M${L0 + 1.5 + i * 3} ${top} L${L0 + 1.7 + i * 3} ${bot}`} stroke={dark(papy, pal, 0.12)} strokeWidth={0.12} opacity={0.4} />)}
      {/* cabecera de los días (rojo) y columnas de hierático (negro), de derecha a izquierda */}
      <path d={`M${L0 + 2} ${top + 5.5} L${R - 2} ${top + 5.5}`} stroke={ink} strokeWidth={0.3} opacity={u > 0.1 ? 0.7 : 0} />
      {[...Array(ncol)].map((_, c) => {
        const x = 86 - c * 5.8, vis = clamp01(w * ncol - c);
        if (x > R - 3 || x < L0 + 2 || vis <= 0) return null;
        return (
          <g key={c} opacity={vis}>
            <path d={`M${x - 1.4} ${top + 2.2} l1.2 -0.6 l1.4 1 M${x - 1} ${top + 3.8} l2.2 0`} stroke={red} strokeWidth={0.55} strokeLinecap="round" fill="none" />
            {[...Array(9)].map((_, r) => {
              const y = top + 8 + r * 4.6, s = hash(c * 13.1 + r * 3.7 + seed), s2 = hash(c * 5.3 + r * 9.1);
              if (y + 3 > bot - 1 || (r === 8 && s > 0.5)) return null;
              return (
                <path key={r} d={`M${x - 1.6} ${y + s * 0.8} q${0.8 + s} ${-1.2} ${1.6} ${0.2} M${x - 0.6} ${y + 1.6} l${s2 * 1.8 - 0.9} ${1.6} M${x + 0.4 * s} ${y + 2.2 + s2} q0.9 0.5 1.4 -0.3`}
                  stroke={r === 0 && c % 4 === 0 ? red : ink} strokeWidth={0.5} strokeLinecap="round" fill="none" opacity={0.85} />
              );
            })}
          </g>
        );
      })}
      {/* manchas de 4.500 años */}
      <ellipse cx={lerp(L0, R, 0.35)} cy={44} rx={5} ry={3} fill={dark(papy, pal, 0.3)} opacity={0.18} />
      <ellipse cx={lerp(L0, R, 0.8)} cy={22} rx={3} ry={2} fill={dark(papy, pal, 0.3)} opacity={0.14} />
      {roll(L0)}{roll(R)}
      {/* las manos que lo sostienen */}
      {hands && [L0, R].map((x, i) => (
        <g key={i}>
          <path d={`M${x + (i ? 4 : -4)} 75 Q${x + (i ? 2 : -2)} 64 ${x} ${bot - 6}`} stroke={dark(pal.skin, pal, 0.1)} strokeWidth={8} strokeLinecap="round" fill="none" />
          <ellipse cx={x} cy={bot - 4} rx={4.4} ry={5.2} fill={url(`${id}k`)} />
          <path d={`M${x + (i ? -3.6 : 3.6)} ${bot - 6} q${i ? -2.6 : 2.6} -1 ${i ? -3.2 : 3.2} 1.4`} stroke={pal.skin} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </g>
      ))}
    </g>
  );
};
