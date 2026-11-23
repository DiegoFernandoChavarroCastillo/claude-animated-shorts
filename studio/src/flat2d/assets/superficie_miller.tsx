// superficie_miller · fondo apaisado (100 × 60, anclaje en el centro): el planeta de Miller: un mar poco profundo y quieto hasta el
// horizonte bajo un cielo gris azulado, con Gargantúa enorme y tenue en el cielo, y en el fondo unas «montañas» oscuras que son una ola
// gigante. opts.ola 0..1 (altura inicial de la ola: 0.25). Acción propia: `ola` la ola se levanta, crece hasta tapar el cielo y avanza
// hacia la cámara con espuma en la cresta (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, url } from "./shade";

export const SuperficieMiller: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `sm${seed}`, ol = clamp01(opt(opts, "ola", 0.25) + clamp01(p.ola ?? 0) * 0.75), hz = 33;
  const crestY = hz - 4 - ol * 15, waveCol = "#1E3644";   // la cresta nunca sale del cuadro (y ≥ 14 del lienzo)
  // la ola: una pared oscura con la cresta curvada y espuma; de lejos (ola baja) parece una cordillera
  const crest = (dy: number) => [...Array(15)].map((_, i) => `L${-20 + i * 10} ${crestY + dy - (3 + ol * 3) * (0.6 + 0.4 * Math.sin(i * 1.3 + seed))}`).join(" ");
  return (
    <g>
      <Grad id={`${id}s`} a="#6A8496" b="#BCD0DA" />
      <Grad id={`${id}w`} a={lerpHex(waveCol, "#8AB0C4", 0.35)} b={waveCol} />
      <Grad id={`${id}m`} a="#8AAABA" b="#4E6E80" />
      <rect x={-20} y={-20} width={140} height={hz + 21} fill={url(`${id}s`)} />
      {/* Gargantúa en el cielo */}
      <g opacity={0.55 * (1 - ol * 0.8)} transform="translate(30 13)"><circle r={4} fill="#3A4A58" /><ellipse rx={18} ry={0.7} fill="#FFE8C8" opacity={0.7} /><path d="M-6.5 0 A6.5 5 0 0 1 6.5 0" stroke="#FFE8C8" strokeWidth={0.5} fill="none" opacity={0.6} /></g>
      <path d={`M-20 ${hz + 1} ${crest(0)} L120 ${hz + 1} Z`} fill={url(`${id}w`)} />
      {/* vetas verticales en la cara de la ola */}
      {ol > 0.35 ? [...Array(26)].map((_, i) => { const x = -18 + i * 5.4; return <line key={i} x1={x} y1={crestY + 4} x2={x + 1.5} y2={hz} stroke="#9AC0D0" strokeWidth={0.35} opacity={0.18 + 0.1 * Math.sin(t * 0.1 + i)} />; }) : null}
      <path d={crest(0).replace(/^L/, "M")} stroke="#F4FAFC" strokeWidth={0.6 + ol * 1.6} fill="none" opacity={0.45 + ol * 0.5} />
      {ol > 0.35 ? [...Array(40)].map((_, i) => { const x = -20 + i * 3.6, y = crestY - (3 + ol * 3) * (0.6 + 0.4 * Math.sin(((x + 20) / 10) * 1.3 + seed)); return <circle key={i} cx={x + Math.sin(t * 0.2 + i) * 0.6} cy={y - hash(i) * 2.4 - Math.abs(Math.sin(t * 0.15 + i)) * 1.2} r={0.5 + hash(i * 2) * 1.2} fill="#F4FAFC" opacity={(ol - 0.35) * 1.5} />; }) : null}
      {/* el mar poco profundo */}
      <rect x={-20} y={hz} width={140} height={50} fill={url(`${id}m`)} />
      {[...Array(14)].map((_, i) => { const y = hz + 1 + i * i * 0.14; return <path key={i} d={`M${-20 + ((t * 0.05 + i * 7) % 12)} ${y}` + " q 3 -0.3 6 0 t 6 0".repeat(1) + " t 6 0".repeat(22)} stroke="#E8F4F8" strokeWidth={0.12 + i * 0.02} fill="none" opacity={0.35} />; })}
      <rect x={-20} y={hz} width={140} height={3} fill="#E8F4F8" opacity={0.18} />
    </g>
  );
};
