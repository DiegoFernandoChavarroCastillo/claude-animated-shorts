// cabina_nave · fondo apaisado (100 × 60, anclaje en el centro): el interior de una nave espacial: paneles blancos y grises con
// juntas y remaches, un gran ventanal ovalado en el centro con el espacio fuera, consolas con luces que parpadean abajo y el suelo
// metálico. opts.vista estrellas | gargantua | hielo | saturno | tierra (lo que se ve por el ventanal). Para la tripulación dentro de
// la nave: hablar, votar, ver mensajes, pilotar.
import React from "react";
import { type AssetFC, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { Grad, Halo, url } from "./shade";

export const CabinaNave: AssetFC = ({ pal, t, seed, opts }) => {
  const id = `cn${seed}`, vista = opt(opts, "vista", "estrellas"), panel = "#D8DCE0", dark = "#3A3E46";
  return (
    <g>
      <Grad id={`${id}w`} a={lerpHex(panel, "#ffffff", 0.3)} b={lerpHex(panel, pal.ink, 0.35)} />
      <Grad id={`${id}f`} a="#5A5E66" b="#22252A" />
      <rect x={-20} y={-20} width={140} height={100} fill={url(`${id}w`)} />
      {/* paneles */}
      {[...Array(9)].map((_, i) => <line key={i} x1={-20 + i * 17} y1={-20} x2={-20 + i * 17} y2={44} stroke={lerpHex(panel, pal.ink, 0.45)} strokeWidth={0.35} />)}
      {[6, 40].map((y) => <line key={y} x1={-20} y1={y} x2={120} y2={y} stroke={lerpHex(panel, pal.ink, 0.45)} strokeWidth={0.35} />)}
      {[...Array(16)].map((_, i) => <circle key={i} cx={-18 + (i % 8) * 17 + 2} cy={i < 8 ? 8 : 38} r={0.3} fill={lerpHex(panel, pal.ink, 0.5)} />)}
      {/* ventanal */}
      <defs><clipPath id={`${id}c`}><ellipse cx={50} cy={22} rx={24} ry={14} /></clipPath></defs>
      <ellipse cx={50} cy={22} rx={26} ry={16} fill={dark} />
      <g clipPath={`url(#${id}c)`}>
        <rect x={20} y={4} width={60} height={36} fill="#05070F" />
        {[...Array(50)].map((_, i) => <circle key={i} cx={24 + hash(i * 2.3 + seed) * 52} cy={7 + hash(i * 5.1) * 30} r={0.15 + hash(i) * 0.2} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * 0.05 + i)} />)}
        {vista === "gargantua" ? <g transform="translate(50 22)"><ellipse rx={20} ry={0.9} fill="#FFD08A" opacity={0.9} /><circle r={4.5} fill="#000" /><circle r={5.6} fill="none" stroke="#FFE2B0" strokeWidth={0.6} opacity={0.8} /><Halo id={`${id}g`} cx={0} cy={0} r={14} color="#FFB060" a={0.4} /></g> : null}
        {vista === "hielo" || vista === "tierra" ? <circle cx={50} cy={46} r={18} fill={vista === "hielo" ? "#CFE0EE" : "#7A6A54"} /> : null}
        {vista === "saturno" ? <g transform="translate(58 24) rotate(-12)"><circle r={6} fill="#E4C690" /><ellipse rx={12} ry={2.4} fill="none" stroke="#E6D0A6" strokeWidth={1} /></g> : null}
        <path d="M30 10 Q42 6 54 8" stroke="#fff" strokeWidth={1.4} fill="none" opacity={0.1} />
      </g>
      <ellipse cx={50} cy={22} rx={24} ry={14} fill="none" stroke={lerpHex(panel, "#fff", 0.5)} strokeWidth={0.8} />
      {/* consolas */}
      <path d="M-20 44 L120 44 L120 80 L-20 80 Z" fill={url(`${id}f`)} />
      {[8, 34, 66, 92].map((x, k) => (
        <g key={x} transform={`translate(${x} 40)`}>
          <path d="M-9 4 L-7 -2 L7 -2 L9 4 Z" fill="#4A4E56" />
          <rect x={-6} y={-1.4} width={12} height={2.4} fill="#0C1418" />
          {[...Array(6)].map((_, i) => <rect key={i} x={-5.4 + i * 1.8} y={-0.8} width={1.1} height={1.1} fill={["#5AF09A", "#FFB84A", "#5AB8FF", "#FF5A4A"][(i + k) % 4]} opacity={hash(Math.floor(t / 12) + i + k * 7) > 0.35 ? 1 : 0.25} />)}
        </g>
      ))}
      {[...Array(8)].map((_, i) => <line key={`f${i}`} x1={50} y1={44} x2={-40 + i * 26} y2={80} stroke="#6A6E76" strokeWidth={0.25} />)}
      <rect x={-20} y={43.4} width={140} height={0.8} fill={pal.rim} opacity={0.4} />
    </g>
  );
};
