// edmunds_campo · fondo apaisado (100 × 60, anclaje en el centro): el planeta de Edmunds al atardecer: desierto rocoso naranja con
// mesetas al fondo, un sol pequeño y, en primer plano, el campamento de Amelia: un módulo hinchable con luz, la bandera y una tumba
// de piedras con una cruz (Edmunds). opts.tumba true; opts.campamento true. Es el final esperanzador: aire respirable.
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, url } from "./shade";

export const EdmundsCampo: AssetFC = ({ pal, t, seed, opts }) => {
  const id = `ed${seed}`, hz = 34;
  return (
    <g>
      <Grad id={`${id}s`} a="#7A4A6A" mid="#E88A4A" b="#FFD08A" at={0.6} />
      <Grad id={`${id}g`} a="#C27A48" b="#6A3A22" />
      <rect x={-20} y={-20} width={140} height={hz + 22} fill={url(`${id}s`)} />
      <circle cx={66} cy={26} r={3} fill="#FFF2D0" /><Halo id={`${id}su`} cx={66} cy={26} r={14} color="#FFD8A0" a={0.55} />
      {/* mesetas */}
      <path d={`M-20 ${hz} L-20 24 L-4 24 L0 28 L14 28 L18 22 L34 22 L38 ${hz} Z`} fill={lerpHex("#8A4A3A", pal.bg, 0.35)} />
      <path d={`M70 ${hz} L74 26 L92 26 L96 20 L120 20 L120 ${hz} Z`} fill={lerpHex("#8A4A3A", pal.bg, 0.3)} />
      <rect x={-20} y={hz} width={140} height={40} fill={url(`${id}g`)} />
      {[...Array(30)].map((_, i) => { const d = hash(i * 1.7 + seed), y = hz + 2 + d * d * 22, x = -15 + hash(i * 3.1) * 130, s = 0.4 + d * 2; return <ellipse key={i} cx={x} cy={y} rx={1.4 * s} ry={0.6 * s} fill={lerpHex("#5A2E1A", pal.ink, 0.2)} opacity={0.7} />; })}
      {opt(opts, "campamento", true) ? (
        <g transform="translate(26 44)">
          <path d="M-10 0 Q-10 -9 0 -9 Q10 -9 10 0 Z" fill="#E8E4DA" /><path d="M-10 0 Q-10 -9 0 -9" stroke="#fff" strokeWidth={0.4} fill="none" />
          <rect x={-2.4} y={-5} width={4.8} height={5} fill="#3A3E46" /><rect x={-1.8} y={-4.4} width={3.6} height={3} fill="#FFE2A0" opacity={0.6 + 0.2 * Math.sin(t * 0.1)} />
          <line x1={14} y1={0} x2={14} y2={-12} stroke="#4A4A4A" strokeWidth={0.4} />
          <path d={`M14 -12 Q17 ${-11.4 + Math.sin(t * 0.15) * 0.5} 20 -11 L20 -8 Q17 ${-8.4 + Math.sin(t * 0.15 + 1) * 0.5} 14 -9 Z`} fill="#2A5AA8" />
        </g>
      ) : null}
      {opt(opts, "tumba", true) ? (
        <g transform="translate(62 48)">
          <ellipse cx={0} cy={0} rx={6} ry={1.6} fill="#5A3A2A" />
          {[...Array(9)].map((_, i) => <ellipse key={i} cx={-5 + i * 1.25} cy={-0.6 - Math.sin((i / 8) * Math.PI) * 1.2} rx={1} ry={0.7} fill={lerpHex("#9A8A7A", "#5A4A3A", hash(i))} />)}
          <rect x={-0.3} y={-6} width={0.6} height={5} fill="#D8D0C4" /><rect x={-1.6} y={-4.8} width={3.2} height={0.6} fill="#D8D0C4" />
        </g>
      ) : null}
      {[...Array(14)].map((_, i) => { const x = ((hash(i * 2.2) * 140 + t * 0.08) % 140) - 20; return <circle key={i} cx={x} cy={20 + hash(i * 4.4) * 30} r={0.2} fill="#FFE8C8" opacity={0.5} />; })}
    </g>
  );
};
