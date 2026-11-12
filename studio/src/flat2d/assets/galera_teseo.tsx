// galera_teseo · escenario: la galera griega de treinta remos de Teseo de perfil, sobre el agua: casco de tablas en cinco hiladas, ojo pintado en la
// proa, espolón, popa curvada, mástil con vela cuadrada a rayas y quince remos por banda que bogan siempre un poco. Cada tabla es vieja (gris,
// agrietada) o nueva (miel, con veta y brillo). opts: `nuevas` 0..1 (proporción de tablas nuevas al empezar), `vieja` true (todas viejas: el
// segundo barco de Hobbes), `vela` (true). Acciones propias: `swap` cambia tablas viejas por nuevas una a una (params `from`/`to`, por defecto de
// `nuevas` a 1; cada tabla que cambia destella), `build` el barco se arma tabla a tabla desde la quilla y al final el mástil, `row` boga fuerte
// mientras dura, `glow` se rodea de un halo dorado (sagrado) y se queda.
import React from "react";
import { type AssetFC, clamp01, hash, lerp, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, dark, lite, url } from "./shade";

const ROWS = 5, COLS = 9, N = ROWS * COLS, WL = 41;   // hiladas × tablas; línea de flotación en y = 41 (lienzo 100 × 55)
const rank = [...Array(N)].map((_, k) => k).sort((a, b) => hash(a * 7.13 + 3) - hash(b * 7.13 + 3));
const order = new Map(rank.map((k, i) => [k, i]));   // en qué turno se cambia cada tabla

export const GaleraTeseo: AssetFC = ({ pal, t, seed, p, params, opts }) => {
  const id = `gt${seed}`, vieja = opt(opts, "vieja", false), vela = opt(opts, "vela", true);
  const sw = (params.swap ?? {}) as Record<string, unknown>, n0 = vieja ? 0 : opt(opts, "nuevas", 0);
  const frac = p.swap !== undefined ? lerp(Number(sw.from ?? n0), Number(sw.to ?? 1), p.swap) : n0;
  const built = p.build ?? 1, rowK = p.row ?? 0, rowing = rowK > 0 && rowK < 1, gl = p.glow ?? 0;
  const oldW = lerpHex(lerpHex(pal.rock, "#6A6A58", 0.35), pal.ink, 0.4), newW = lerpHex("#E0A858", pal.wallLit, 0.12);
  const bob = Math.sin(t * 0.05 + seed) * 0.5, tilt = Math.sin(t * 0.037 + seed) * 0.6;
  const hull = "M10 27 Q30 29.5 50 29.5 Q72 29.5 88 27.5 L91 34 L97 39.5 L86 41.5 Q50 43.5 17 41.5 Q9 38 6 31 Z";
  const planks: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const k = r * COLS + c, ord = order.get(k)!, isNew = ord < frac * N, flip = frac * N - ord;
    const bk = (ROWS - 1 - r) * COLS + c;   // al armarlo, de la quilla hacia arriba
    if (bk >= built * N) continue;
    const y0 = 29.2 + r * 2.5, x0 = 4 + c * 10.4, w = 10.1, col = isNew ? newW : oldW;
    planks.push(
      <g key={k}>
        <rect x={x0} y={y0} width={w} height={2.35} fill={col} />
        <rect x={x0} y={y0} width={w} height={0.6} fill={isNew ? lite(col, pal, 0.4) : lite(col, pal, 0.12)} opacity={0.8} />
        {isNew ? <path d={`M${x0 + 1} ${y0 + 1.3} q${w * 0.3} -0.5 ${w * 0.8} 0.1`} stroke={dark(col, pal, 0.2)} strokeWidth={0.18} fill="none" />
          : <path d={`M${x0 + 1 + hash(k) * 4} ${y0 + 0.5} l1.4 0.8 l-0.6 0.7 l1.6 0.5`} stroke={dark(col, pal, 0.55)} strokeWidth={0.22} fill="none" />}
        {!isNew && hash(k * 3.1) > 0.6 ? <circle cx={x0 + 2 + hash(k * 5) * 6} cy={y0 + 1.4} r={0.45} fill={dark(col, pal, 0.5)} /> : null}
        <rect x={x0 + w - 0.15} y={y0} width={0.3} height={2.35} fill={dark(oldW, pal, 0.5)} />
        <circle cx={x0 + 0.8} cy={y0 + 1.2} r={0.22} fill={isNew ? pal.rim : dark(oldW, pal, 0.3)} />
        {flip > 0 && flip < 1.6 && p.swap !== undefined ? <rect x={x0 - 0.5} y={y0 - 0.5} width={w + 1} height={3.35} rx={0.6} fill={pal.glow} opacity={0.85 * (1 - flip / 1.6)} /> : null}
      </g>,
    );
  }
  const mastK = clamp01((built - 0.85) / 0.15), sp = rowing ? 0.42 : 0.07, amp = rowing ? 16 : 4;
  const oars = [...Array(15)].map((_, i) => {
    const x = 20 + i * 4.3, a = (40 + amp * Math.sin(t * sp - i * 0.35)) * (Math.PI / 180), L = 9;
    const ex = x - Math.sin(a) * L, ey = 38 + Math.cos(a) * L, dip = ey > WL + 1;
    return (
      <g key={i} opacity={built >= 0.98 ? 1 : 0}>
        <path d={`M${x} 38 L${ex} ${ey}`} stroke={dark(newW, pal, 0.5)} strokeWidth={0.7} strokeLinecap="round" />
        <path d={`M${ex} ${ey} l${-Math.sin(a) * 2.4} ${Math.cos(a) * 2.4}`} stroke={dark(newW, pal, 0.3)} strokeWidth={1.3} strokeLinecap="round" />
        {dip ? <ellipse cx={ex} cy={WL + 0.4} rx={1.6} ry={0.35} fill={pal.wallLit} opacity={0.55} /> : null}
      </g>
    );
  });
  return (
    <g transform={`translate(0 ${bob}) rotate(${tilt} 50 ${WL})`}>
      <Grad id={`${id}h`} a={dark(oldW, pal, 0.1)} b={dark(oldW, pal, 0.45)} /><Grad id={`${id}s`} a={lite(pal.wallLit, pal, 0.3)} b={lerpHex(pal.wallLit, pal.rock, 0.3)} />
      <defs><clipPath id={`${id}c`}><path d={hull} /></clipPath></defs>
      {gl > 0 ? <Halo id={`${id}g`} cx={50} cy={24} r={52 * gl} color={pal.glow} a={0.55 * gl} /> : null}
      {/* reflejo en el agua */}
      <path d={hull} transform={`translate(0 ${2 * WL + 1}) scale(1 -1)`} fill={dark(pal.wall, pal, 0.3)} opacity={0.18 * built} />
      {mastK > 0 ? (
        <g opacity={mastK}>
          <rect x={49.2} y={3} width={1.6} height={26} fill={dark(newW, pal, 0.35)} />
          <rect x={29} y={5.2} width={42} height={1.1} rx={0.5} fill={dark(newW, pal, 0.4)} />
          {vela ? <g>
            <path d={`M30 6.3 L70 6.3 Q${71 + Math.sin(t * 0.04) * 1.2} 16 69 24 L31 24 Q${29 + Math.sin(t * 0.04) * 1.2} 16 30 6.3 Z`} fill={url(`${id}s`)} opacity={vieja ? 0.82 : 1} />
            {[0, 1, 2, 3].map((i) => <rect key={i} x={30.6 + i * 10.2} y={6.3} width={4.6} height={17.7} fill={pal.accent} opacity={vieja ? 0.45 : 0.75} />)}
            <path d="M30 24 L69 24" stroke={dark(pal.wallLit, pal, 0.3)} strokeWidth={0.4} />
          </g> : null}
          {[30, 70].map((x) => <path key={x} d={`M${x} 6 L${x < 50 ? 12 : 88} 27`} stroke={dark(pal.ink, pal, 0)} strokeWidth={0.25} opacity={0.6} />)}
        </g>
      ) : null}
      {/* casco: forma de fondo y tablas recortadas a su silueta */}
      <path d={hull} fill={built > 0 ? url(`${id}h`) : "none"} opacity={built > 0 ? Math.min(1, built * 3) * 0.35 : 0} />
      <g clipPath={`url(#${id}c)`}>{planks}</g>
      {built >= 0.98 ? <g>
        <path d="M10 27 Q30 29.5 50 29.5 Q72 29.5 88 27.5" stroke={dark(oldW, pal, 0.55)} strokeWidth={1.6} fill="none" />
        <path d="M10 26.4 Q30 28.9 50 28.9 Q72 28.9 88 26.9" stroke={lite(newW, pal, 0.2)} strokeWidth={0.4} fill="none" opacity={0.7} />
        <path d="M10 27 Q4 22 6 15 Q8 11 11 13 Q9 16 11.5 19" stroke={dark(oldW, pal, 0.35)} strokeWidth={2} fill="none" strokeLinecap="round" />
        <path d="M88 27.5 Q92 22 90 18" stroke={dark(oldW, pal, 0.35)} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <path d="M91 37.5 L98.5 39.6 L91 41" fill={lerpHex(pal.rim, "#8A6A3A", 0.5)} />
        <ellipse cx={84.5} cy={33.5} rx={2.6} ry={1.4} fill="#F4EEE0" /><circle cx={85} cy={33.5} r={0.95} fill={pal.ink} /><circle cx={85.3} cy={33.2} r={0.3} fill="#fff" />
        {[...Array(15)].map((_, i) => <circle key={i} cx={20 + i * 4.3} cy={38} r={0.5} fill={dark(oldW, pal, 0.7)} />)}
      </g> : null}
      {oars}
      {/* espuma en la línea de flotación */}
      {[...Array(10)].map((_, i) => <ellipse key={i} cx={14 + i * 8 + Math.sin(t * 0.07 + i) * 1.5} cy={WL + 0.8} rx={3 + hash(i + seed) * 2} ry={0.4} fill={pal.wallLit} opacity={0.35 * built} />)}
    </g>
  );
};
