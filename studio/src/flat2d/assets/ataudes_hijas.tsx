// ataudes_hijas · prop: los dos pequeños ataúdes de las hijas de Tutankamón, tumbados uno junto al otro sobre un paño: forma de momia,
// resina negra con bandas y cara de oro, el de delante más pequeño. Lienzo 100 × 60, anclaje abajo en el centro. Acción propia: `glow`
// una luz suave y cálida los envuelve (se queda).
import React from "react";
import { type AssetFC, clamp01 } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, lite, url } from "./shade";

export const AtaudesHijas: AssetFC = ({ pal, seed, p }) => {
  const id = `ah${seed}`, gl = clamp01(p.glow ?? 0);
  const black = lerpHex("#1A1410", pal.ink, 0.2), gold = lerpHex("#E8B640", pal.glow, 0.2), linen = lerpHex("#EDE4CC", pal.wallLit, 0.2);
  const coffin = (x: number, y: number, s: number, k: number) => (
    <g key={k} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-34 0 Q-38 -8 -30 -10 L18 -11 Q30 -12 34 -6 Q36 0 34 4 Q30 10 18 9 L-30 9 Q-38 8 -34 0 Z" fill={url(`${id}b`)} />
      {[-20, -8, 4].map((bx) => <rect key={bx} x={bx} y={-10.5} width={2.6} height={20} fill={gold} />)}
      <path d="M-30 -1 L16 -1" stroke={gold} strokeWidth={1.2} />
      {/* cara de oro y tocado */}
      <ellipse cx={26} cy={-1} rx={6.4} ry={7.4} fill={url(`${id}g`)} />
      <path d="M22 -2 h2.4 M28 -2 h2.4" stroke={black} strokeWidth={0.9} /><path d="M24.6 3 q1.6 1 3.2 0" stroke={dark(gold, pal, 0.4)} strokeWidth={0.6} fill="none" />
    </g>
  );
  return (
    <g>
      <Grad id={`${id}b`} a={lite(black, pal, 0.25)} b={dark(black, pal, 0.3)} /><Grad id={`${id}g`} a={lite(gold, pal, 0.35)} b={dark(gold, pal, 0.25)} />
      {gl > 0 && <Halo id={`${id}h`} cx={50} cy={36} r={60} color={pal.glow} a={0.5 * gl} />}
      <ContactShadow id={`${id}s`} cx={50} cy={57} rx={46} />
      <path d="M4 57 L96 57 L90 44 L10 44 Z" fill={linen} opacity={0.9} />
      {coffin(50, 36, 1.05, 0)}{coffin(48, 50, 0.8, 1)}
    </g>
  );
};
