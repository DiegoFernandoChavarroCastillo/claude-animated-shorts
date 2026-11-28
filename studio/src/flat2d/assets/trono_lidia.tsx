// trono_lidia · prop: el trono del rey de Lidia: sillón alto de madera dorada con respaldo redondeado y una roseta, brazos con cabezas de león,
// patas de garra, cojín rojo y un escabel delante. Lienzo 100 × 130, anclaje abajo en el centro; el asiento queda en y ≈ 78.
// Acción propia: `shine` un destello recorre el oro (se queda más brillante).
import React from "react";
import { type AssetFC, clamp01 } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";

export const TronoLidia: AssetFC = ({ pal, t, seed, p }) => {
  const id = `tl${seed}`, sh = clamp01(p.shine ?? 0), gold = lerpHex("#D9A637", pal.glow, 0.1 + 0.2 * sh), red = lerpHex("#A3202A", pal.accent, 0.3);
  const sweep = sh > 0 && sh < 1 ? sh : -1;
  return (
    <g>
      <Vol id={`${id}g`} c={gold} pal={pal} k={1.1} /><Grad id={`${id}r`} a={lite(red, pal, 0.2)} b={dark(red, pal, 0.4)} />
      <Grad id={`${id}k`} h a={dark(gold, pal, 0.4)} mid={lite(gold, pal, 0.3)} b={dark(gold, pal, 0.3)} />
      <Halo id={`${id}h`} cx={50} cy={50} r={60} color={pal.glow} a={0.2 + 0.3 * sh} />
      <ContactShadow id={`${id}s`} cx={50} cy={129} rx={46} a={0.45} />
      {/* respaldo */}
      <path d="M20 80 L20 26 Q20 4 50 4 Q80 4 80 26 L80 80 Z" fill={url(`${id}g`)} stroke={dark(gold, pal, 0.45)} strokeWidth={1} />
      <path d="M27 78 L27 28 Q27 12 50 12 Q73 12 73 28 L73 78 Z" fill={url(`${id}r`)} />
      <circle cx={50} cy={30} r={9} fill={url(`${id}g`)} />
      {[...Array(8)].map((_, i) => <ellipse key={i} cx={50} cy={24.5} rx={1.8} ry={4.5} fill={lite(gold, pal, 0.35)} transform={`rotate(${i * 45} 50 30)`} />)}
      <circle cx={50} cy={30} r={2.4} fill={red} />
      {/* asiento y cojín */}
      <rect x={14} y={76} width={72} height={10} rx={2} fill={url(`${id}k`)} /><path d="M18 76 Q50 68 82 76 L82 80 L18 80 Z" fill={url(`${id}r`)} />
      {/* brazos con cabeza de león */}
      {[-1, 1].map((sd) => (
        <g key={sd}><rect x={sd < 0 ? 8 : 80} y={56} width={12} height={22} rx={2} fill={url(`${id}g`)} />
          <circle cx={sd < 0 ? 12 : 88} cy={56} r={7} fill={url(`${id}g`)} />
          {[...Array(7)].map((_, i) => <circle key={i} cx={(sd < 0 ? 12 : 88) + Math.cos(i) * 7} cy={56 + Math.sin(i) * 7} r={2.2} fill={dark(gold, pal, 0.2)} />)}
          <circle cx={sd < 0 ? 12 : 88} cy={56} r={4.8} fill={lite(gold, pal, 0.15)} />
          <circle cx={(sd < 0 ? 10.4 : 86.4)} cy={55} r={0.7} fill={pal.ink} /><circle cx={(sd < 0 ? 13.6 : 89.6)} cy={55} r={0.7} fill={pal.ink} />
          <path d={`M${(sd < 0 ? 10.5 : 86.5)} 58.6 q1.5 1 3 0`} stroke={pal.ink} strokeWidth={0.5} fill="none" /></g>
      ))}
      {/* patas de garra */}
      {[18, 30, 70, 82].map((x) => <g key={x}><rect x={x - 3} y={86} width={6} height={32} fill={url(`${id}k`)} /><path d={`M${x - 5} 122 Q${x} 114 ${x + 5} 122 L${x + 5} 124 L${x - 5} 124 Z`} fill={dark(gold, pal, 0.2)} /></g>)}
      <rect x={28} y={118} width={44} height={10} rx={1.5} fill={url(`${id}k`)} /><rect x={30} y={118} width={40} height={2.4} fill={url(`${id}r`)} />
      {sweep >= 0 && <rect x={-20 + sweep * 140} y={0} width={10} height={130} fill="#FFF6D8" opacity={0.45 * Math.sin(sweep * Math.PI)} transform={`skewX(-18)`} style={{ mixBlendMode: "screen" }} />}
      <path d={`M24 ${22 + Math.sin(t * 0.04) * 0.3} Q28 10 40 8`} stroke="#fff" strokeWidth={1} opacity={0.5} fill="none" />
    </g>
  );
};
