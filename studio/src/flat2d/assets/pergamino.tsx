// pergamino · prop: un rollo de papiro sostenido abierto entre dos varillas de madera, con columnas de letras griegas a tinta y el título
// ΠΟΛΙΤΕΙΑ (la República de Platón) arriba. Lienzo 100 × 70, anclaje en el centro. opts.titulo (texto de arriba, "ΠΟΛΙΤΕΙΑ").
// Acción propia: `unroll` el rollo se abre desde el centro hacia los lados y las letras aparecen (se queda abierto).
import React from "react";
import { type AssetFC, clamp01, hash, opt } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

export const Pergamino: AssetFC = ({ pal, seed, p, opts }) => {
  const id = `pg${seed}`, u = clamp01(p.unroll ?? 1), w = 6 + u * 38, pap = lerpHex("#E8D6A8", pal.wallLit, 0.2), wood = "#7A4A2A";
  const L = 50 - w, R = 50 + w;
  return (
    <g>
      <Grad id={`${id}p`} a={lite(pap, pal, 0.2)} mid={pap} b={dark(pap, pal, 0.18)} /><Grad id={`${id}r`} h a={dark(pap, pal, 0.3)} mid={lite(pap, pal, 0.2)} b={dark(pap, pal, 0.35)} />
      <Halo id={`${id}h`} cx={50} cy={35} r={50} color={pal.glow} a={0.25} />
      <ContactShadow id={`${id}s`} cx={50} cy={66} rx={44} a={0.25} />
      <path d={`M${L} 10 Q50 8 ${R} 10 L${R} 60 Q50 62 ${L} 60 Z`} fill={url(`${id}p`)} />
      <g opacity={u}>
        <text x={50} y={19} textAnchor="middle" fontSize={5} fontFamily="Georgia, serif" fill={dark(pal.ink, pal, 0)} opacity={u > 0.5 ? 1 : 0}>{String(opt(opts, "titulo", "ΠΟΛΙΤΕΙΑ"))}</text>
        {[...Array(18)].map((_, i) => { const col = i % 2, row = Math.floor(i / 2), x0 = 50 + (col ? 3 : -3 - 30 * u), ww = 30 * u * (0.75 + hash(i + seed) * 0.25);
          return <rect key={i} x={col ? x0 : 50 - 3 - ww} y={24 + row * 3.6} width={ww} height={1.1} rx={0.5} fill={pal.ink} opacity={0.55} />; })}
      </g>
      {[L, R].map((x, k) => (
        <g key={k}><rect x={x - 3.5} y={7} width={7} height={56} rx={3} fill={url(`${id}r`)} />
          <rect x={x - 1.2} y={2} width={2.4} height={66} rx={1.2} fill={wood} /><circle cx={x} cy={2} r={2} fill={dark(wood, pal, 0.1)} /><circle cx={x} cy={68} r={2} fill={dark(wood, pal, 0.1)} /></g>
      ))}
    </g>
  );
};
