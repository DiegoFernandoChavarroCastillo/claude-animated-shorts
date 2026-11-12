// ballena · ballena jorobada de perfil (cabeza a la izquierda): lomo oscuro y vientre claro con surcos, aleta pectoral larga, tubérculos en la cabeza, ojo y
// cola en media luna. Siempre nada: la cola y la aleta ondulan y el cuerpo sube y baja. `breach` (acción propia): se arquea hacia arriba como al saltar
// (acompáñala con `slide`); `call` : abre la boca y canta (ondas de sonido).
import React from "react";
import { type AssetFC, idle } from "./common";
import { lerpHex } from "../palette";
import { Grad, dark, url } from "./shade";

export const Ballena: AssetFC = ({ pal, t, seed, p }) => {
  const id = `bl${seed}`, I = idle(t, seed), tail = Math.sin(t * 0.09 + seed) * 5, fin = Math.sin(t * 0.07 + seed + 1) * 6, br = Math.sin((p.breach ?? 0) * Math.PI), call = p.call ?? 0;
  const back = lerpHex(pal.ink, pal.skin, 0.4), belly = lerpHex(pal.wallLit, pal.skin, 0.25);
  return (
    <g transform={`translate(0 ${I.bob * 0.8}) rotate(${-br * 28 + I.sway * 1.2} 45 26)`}>
      <Grad id={`${id}b`} a={dark(back, pal, 0.1)} mid={back} b={belly} at={0.52} /><Grad id={`${id}f`} a={back} b={lerpHex(back, belly, 0.6)} />
      <g transform={`rotate(${tail} 78 24)`}><path d="M76 21.5 Q86 21.5 90 23 Q95 12 100 9 Q99 20 96 24 Q99 29 100 40 Q94 36 90 26 Q86 27 76 28 Z" fill={dark(back, pal, 0.12)} /></g>
      <path d="M3 25 Q3 19 14 15.5 Q32 9.5 54 12 Q70 14.5 80 21.5 L80 27 Q66 34 44 36.5 Q22 38 10 33.5 Q3 30 3 25 Z" fill={url(`${id}b`)} />
      {[...Array(7)].map((_, i) => <path key={i} d={`M${8 + i * 1.5} ${28 + i * 0.75} Q${26 + i * 2} ${35.4 - i * 0.2} ${44 - i * 1.2} ${35.6 - i * 0.5}`} stroke={lerpHex(belly, back, 0.45)} strokeWidth={0.35} fill="none" />)}
      {[...Array(6)].map((_, i) => <circle key={i} cx={7 + i * 2.6} cy={20.5 - i * 0.8 + (i % 2) * 1.1} r={0.7} fill={lerpHex(back, belly, 0.3)} />)}
      <path d={`M4 26.5 Q13 ${28.4 + call * 3} 23 27`} stroke={dark(back, pal, 0.5)} strokeWidth={0.5} fill="none" />
      <circle cx={22} cy={23.4} r={1.1} fill={pal.ink} /><circle cx={22.3} cy={23.1} r={0.35} fill="#fff" />
      <path d="M54 12 Q59 7.5 64 10.5 Q62 12 63 14 Z" fill={dark(back, pal, 0.15)} />
      <g transform={`rotate(${fin} 33 31)`}><path d="M33 30 Q36 44 27 56 Q24 58 23 54 Q27 43 27 31 Z" fill={url(`${id}f`)} stroke={dark(back, pal, 0.2)} strokeWidth={0.3} /></g>
      <path d="M14 15.5 Q32 9.5 54 12 Q70 14.5 80 21.5" stroke={pal.rim} strokeWidth={0.7} fill="none" opacity={0.55} />
      {call > 0 && call < 1 ? [0, 1, 2].map((i) => <path key={i} d={`M${0 - i * 4 - call * 6} 20 Q${-4 - i * 4 - call * 6} 27 ${0 - i * 4 - call * 6} 34`} stroke={pal.rim} strokeWidth={0.7} fill="none" opacity={(1 - call) * (1 - i * 0.25)} />) : null}
    </g>
  );
};
