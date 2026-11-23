// hielo_mann · fondo apaisado (100 × 60, anclaje en el centro): el planeta de Mann: crestas de hielo blanco azulado hasta el horizonte,
// cielo pálido y frío y, flotando en el aire, nubes congeladas (losas de hielo con forma de nube y sombra debajo) que no se mueven.
// Un viento de cristales de hielo cruza el cuadro. opts.base true = el módulo de Mann semienterrado a la derecha con su luz.
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, url } from "./shade";

export const HieloMann: AssetFC = ({ pal, t, seed, opts }) => {
  const id = `hm${seed}`, hz = 34, ice = "#DCEAF4";
  const ridge = (y: number, amp: number, k: number) => `M-20 70 L-20 ${y} ` + [...Array(29)].map((_, i) => `L${-20 + i * 5} ${y - amp * Math.abs(Math.sin(i * k + seed))}`).join(" ") + " L120 70 Z";
  const cloud = (x: number, y: number, s: number, k: number) => (
    <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={4.6} rx={11} ry={1.6} fill={lerpHex(ice, pal.ink, 0.35)} opacity={0.35} />
      <path d="M-10 2 Q-11 -2 -6 -2.6 Q-5 -6.6 0 -6 Q4 -8.6 7 -4.6 Q11.4 -4.6 10.6 0 Q11 2.6 7 3 L-7 3.4 Q-11 3.4 -10 2 Z" fill={url(`${id}c`)} />
      <path d="M-10 2 Q-11 -2 -6 -2.6 Q-5 -6.6 0 -6 Q4 -8.6 7 -4.6" stroke="#fff" strokeWidth={0.4} fill="none" opacity={0.8} />
      <path d="M-7 3.4 L7 3 L5 4.6 L-5 4.8 Z" fill={lerpHex(ice, "#6A8AA8", 0.5)} />
    </g>
  );
  return (
    <g>
      <Grad id={`${id}s`} a="#8EA8BE" b="#E4EEF6" />
      <Grad id={`${id}c`} a="#FFFFFF" b="#A8C0D4" />
      <Grad id={`${id}i`} a="#F2F8FC" b="#8AA6BE" />
      <rect x={-20} y={-20} width={140} height={hz + 22} fill={url(`${id}s`)} />
      <circle cx={78} cy={9} r={3.2} fill="#FFFFFF" opacity={0.7} /><Halo id={`${id}su`} cx={78} cy={9} r={10} color="#FFFFFF" a={0.4} />
      {cloud(18, 10, 1.1, 0)}{cloud(52, 6, 0.8, 1)}{cloud(84, 20, 1.3, 2)}{cloud(36, 22, 0.7, 3)}
      <path d={ridge(hz, 3, 0.9)} fill={lerpHex("#B8CCDC", pal.bg, 0.2)} />
      <path d={ridge(hz + 6, 4, 0.6)} fill={url(`${id}i`)} />
      <path d={ridge(hz + 14, 5, 0.45)} fill={lerpHex("#F4FAFF", "#B0C6D8", 0.2)} />
      {opt(opts, "base", true) ? <g transform="translate(80 40)"><path d="M-6 0 Q0 -5 6 0 Z" fill="#C8CCD0" /><rect x={-1} y={-2.4} width={2} height={1} fill="#FFD27A" /><Halo id={`${id}b`} cx={0} cy={-2} r={4} color="#FFD27A" a={0.5} /></g> : null}
      {[...Array(40)].map((_, i) => { const x = ((hash(i * 2.7 + seed) * 140 + t * (0.4 + hash(i) * 0.4)) % 140) - 20, y = hash(i * 5.3) * 60; return <line key={i} x1={x} y1={y} x2={x + 1.6} y2={y + 0.3} stroke="#FFFFFF" strokeWidth={0.18} opacity={0.6} />; })}
    </g>
  );
};
