// tormenta_polvo · fondo apaisado (100 × 60, anclaje en el centro): la Tierra moribunda de Interstellar: un maizal seco hasta el
// horizonte, una granja pequeña con su molino a la izquierda y, al fondo, un muro de polvo marrón que hierve y avanza tapando el cielo.
// opts.granja true; opts.cerca 0..1 (lo cerca que está el muro: 0.3). Acción propia: `avanza` el muro crece y se come el cielo y el
// campo (se queda): la tormenta llega, todo se cubre de polvo.
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, url } from "./shade";

export const TormentaPolvo: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `tp${seed}`, near = clamp01(opt(opts, "cerca", 0.3) + clamp01(p.avanza ?? 0) * 0.65), granja = opt(opts, "granja", true);
  const dust = "#8A5A34", dustL = "#C89664", hz = 38;
  const top = lerpHex(pal.bg, dust, 0.3), wallTop = 30 - near * 34;
  return (
    <g>
      <Grad id={`${id}s`} a={lerpHex("#D8B07A", pal.bg, 0.3)} b="#E8C48A" />
      <Grad id={`${id}g`} a="#B89A5A" b="#6A5230" />
      <rect x={-20} y={-20} width={140} height={60} fill={url(`${id}s`)} />
      <circle cx={70} cy={18} r={4} fill="#FFF0C8" opacity={0.7 * (1 - near)} />
      {/* muro de polvo: cúmulos que hierven */}
      <g>
        {[...Array(26)].map((_, i) => {
          const x = -14 + (i % 13) * 10 + hash(seed + i) * 5, row = Math.floor(i / 13), y = wallTop + row * 9 + Math.sin(t * 0.04 + i) * 1.4, r = 9 + hash(i * 2.3) * 6 + near * 4;
          return <circle key={i} cx={x} cy={y} r={r} fill={lerpHex(row ? dust : dustL, pal.ink, row * 0.15)} opacity={0.95} />;
        })}
        <rect x={-20} y={wallTop + 6} width={140} height={hz - wallTop + 4} fill={dust} />
        {[...Array(10)].map((_, i) => <ellipse key={i} cx={((i * 14 + t * 0.12) % 140) - 20} cy={wallTop + 8 + hash(i) * 10} rx={10} ry={2} fill={dustL} opacity={0.25} />)}
      </g>
      <rect x={-20} y={-20} width={140} height={60} fill={top} opacity={near * 0.35} />
      {/* campo */}
      <path d={`M-20 ${hz} L120 ${hz} L120 80 L-20 80 Z`} fill={url(`${id}g`)} />
      {[...Array(18)].map((_, i) => { const x = -20 + i * 8; return <path key={i} d={`M50 ${hz} L${x * 2.6 - 80} 80`} stroke={lerpHex("#5A4428", pal.ink, 0.2)} strokeWidth={0.4} opacity={0.6} />; })}
      {[...Array(70)].map((_, i) => {
        const d = hash(i * 1.9 + seed), y = hz + 1 + d * d * 20, x = -10 + hash(i * 3.7) * 120, s = 0.4 + d * 1.6, sw = Math.sin(t * 0.08 + i) * s * 0.5;
        return <path key={`m${i}`} d={`M${x} ${y} L${x + sw} ${y - 4 * s} M${x + sw * 0.6} ${y - 2.4 * s} l${1.4 * s} ${-1 * s} M${x + sw * 0.8} ${y - 3.2 * s} l${-1.2 * s} ${-0.9 * s}`} stroke={lerpHex("#A88A48", "#6A7A3A", hash(i) * 0.4)} strokeWidth={0.35 * s} fill="none" />;
      })}
      {granja ? (
        <g transform="translate(16 37)">
          <rect x={0} y={-5} width={9} height={5} fill="#E8DCC4" /><path d="M-1 -5 L4.5 -8.6 L10 -5 Z" fill="#7A5A44" /><rect x={6} y={-3.4} width={1.6} height={1.6} fill="#FFD890" />
          <line x1={14} y1={0} x2={14} y2={-10} stroke="#5A4A3A" strokeWidth={0.4} />
          <g transform={`translate(14 -10) rotate(${t * 2})`}>{[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1={0} y1={0} x2={Math.cos((a * Math.PI) / 180) * 2.2} y2={Math.sin((a * Math.PI) / 180) * 2.2} stroke="#5A4A3A" strokeWidth={0.4} />)}</g>
        </g>
      ) : null}
    </g>
  );
};
