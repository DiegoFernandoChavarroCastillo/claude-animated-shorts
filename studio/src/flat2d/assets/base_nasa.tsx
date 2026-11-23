// base_nasa · fondo apaisado (100 × 60, anclaje en el centro): la NASA escondida bajo tierra: un silo de hormigón enorme con el cohete
// en el centro (la lanzadera blanca encima de un propulsor), pasarelas metálicas con barandillas, focos que cuelgan y pizarras con
// ecuaciones a los lados. opts.pizarras true. Acción propia: `luces` se encienden los focos uno a uno (se quedan): la base despierta,
// el secreto se revela.
import React from "react";
import { type AssetFC, clamp01, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, url } from "./shade";

export const BaseNasa: AssetFC = ({ pal, t, seed, opts, p }) => {
  const id = `bn${seed}`, lu = p.luces === undefined ? 1 : clamp01(p.luces), conc = "#5A5E66";
  return (
    <g>
      <Grad id={`${id}c`} a={lerpHex(conc, "#C8D0DA", 0.2)} b={lerpHex(conc, pal.ink, 0.55)} />
      <Grad id={`${id}r`} a="#F4F4F0" b="#A8ACB2" h />
      <rect x={-20} y={-20} width={140} height={100} fill={url(`${id}c`)} />
      {/* silo: anillos curvos */}
      {[...Array(8)].map((_, i) => <path key={i} d={`M18 ${-6 + i * 8} Q50 ${-2 + i * 8} 82 ${-6 + i * 8}`} stroke={lerpHex(conc, pal.ink, 0.5)} strokeWidth={0.5} fill="none" />)}
      <rect x={18} y={-20} width={1.2} height={80} fill={lerpHex(conc, pal.ink, 0.6)} /><rect x={80.8} y={-20} width={1.2} height={80} fill={lerpHex(conc, pal.ink, 0.6)} />
      {/* cohete */}
      <g transform="translate(50 0)">
        <rect x={-4.2} y={12} width={8.4} height={46} fill={url(`${id}r`)} />
        {[0, 1].map((k) => <rect key={k} x={k ? 4.2 : -7.4} y={20} width={3.2} height={38} rx={1.4} fill={url(`${id}r`)} />)}
        <path d="M-4.2 12 L0 0 L4.2 12 Z" fill="#E8E8E4" /><path d="M-1.6 4 L0 -1 L1.6 4 Z" fill="#2A2E36" />
        {[18, 30, 42].map((y) => <rect key={y} x={-4.2} y={y} width={8.4} height={0.8} fill="#2A2E36" />)}
        <text x={0} y={36} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={2.2} fill="#1A3A8A" transform="rotate(-90 0 36)">NASA</text>
      </g>
      {/* pasarelas */}
      {[24, 40].map((y, k) => (
        <g key={y}>
          <rect x={18} y={y} width={26 - k * 4} height={1.2} fill="#3A3E46" /><rect x={56 + k * 4} y={y} width={26 - k * 4} height={1.2} fill="#3A3E46" />
          {[...Array(12)].map((_, i) => <line key={i} x1={19 + i * 5.5} y1={y} x2={19 + i * 5.5} y2={y - 2.6} stroke="#3A3E46" strokeWidth={0.25} opacity={i > 4 && i < 7 ? 0 : 1} />)}
          <line x1={18} y1={y - 2.6} x2={82} y2={y - 2.6} stroke="#3A3E46" strokeWidth={0.3} />
        </g>
      ))}
      {opt(opts, "pizarras", true) ? [6, 86].map((x, k) => (
        <g key={x}><rect x={x - 6} y={30} width={14} height={9} fill="#1E2A26" stroke="#8A7A5A" strokeWidth={0.5} />
          {[0, 1, 2].map((r) => <path key={r} d={`M${x - 5} ${32.4 + r * 2.4} q 2 -1 4 0 t 4 0 l 2 -0.6`} stroke="#E8ECE8" strokeWidth={0.3} fill="none" opacity={0.8} />)}
          <text x={x + 1} y={38.2} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={1.6} fill="#E8ECE8">{k ? "Gμν = 8πTμν" : "∇·g = −4πGρ"}</text></g>
      )) : null}
      {/* focos */}
      {[26, 38, 62, 74].map((x, i) => {
        const on = clamp01(lu * 4 - i);
        return <g key={x}><line x1={x} y1={-20} x2={x} y2={4} stroke="#2A2E36" strokeWidth={0.3} /><rect x={x - 1.2} y={4} width={2.4} height={1.4} fill="#2A2E36" />
          {on > 0 ? <g style={{ mixBlendMode: "screen" }}><path d={`M${x - 1} 5.4 L${x + 1} 5.4 L${x + 9} 58 L${x - 9} 58 Z`} fill="#FFF2D0" opacity={0.09 * on} /><Halo id={`${id}h${i}`} cx={x} cy={5.6} r={4} color="#FFF2D0" a={0.8 * on} /></g> : null}</g>;
      })}
      <rect x={-20} y={56} width={140} height={20} fill={lerpHex(conc, pal.ink, 0.7)} />
      <circle cx={50 + Math.sin(t * 0.02) * 0.1} cy={-200} r={0} />
    </g>
  );
};
