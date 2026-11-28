// ojo · prop: un ojo humano abierto de frente, almendrado, con iris ámbar, pupila, brillo, pestañas y ceja; mira a los lados y parpadea
// (reposo). Lienzo 100 × 60, anclaje en el centro. Para «todos nos miran» repítelo en cuadrícula con `repeat`.
// Acción propia: `close` el párpado baja y el ojo se cierra (se queda cerrado): dejan de mirar, nadie te ve.
import React from "react";
import { type AssetFC, clamp01, idle } from "./common";
import { lerpHex } from "../palette";
import { Grad, Vol, dark, url } from "./shade";

export const Ojo: AssetFC = ({ pal, t, seed, p }) => {
  const id = `oj${seed}`, { blink, sway } = idle(t, seed), cl = Math.max(clamp01(p.close ?? 0), blink);
  const lid = 30 - 18 + cl * 18, iris = lerpHex("#B8782A", pal.glow, 0.15), skin = pal.skin;
  const lx = 50 + sway * 8, top = 30 - 18 * (1 - cl), bot = 30 + 16 * (1 - cl * 0.98);
  return (
    <g>
      <Vol id={`${id}i`} c={iris} pal={pal} k={1} lx={0.4} ly={0.3} /><Grad id={`${id}w`} a="#FFFFFF" b="#D8D4CC" />
      <clipPath id={`${id}c`}><path d={`M12 30 Q50 ${top} 88 30 Q50 ${bot} 12 30 Z`} /></clipPath>
      <path d="M4 30 Q50 -6 96 30 Q50 60 4 30 Z" fill={dark(skin, pal, 0.15)} />
      <path d="M12 30 Q50 12 88 30 Q50 46 12 30 Z" fill={url(`${id}w`)} clipPath={url(`${id}c`)} />
      <g clipPath={url(`${id}c`)}><circle cx={lx} cy={30} r={13} fill={url(`${id}i`)} /><circle cx={lx} cy={30} r={13} fill="none" stroke={dark(iris, pal, 0.5)} strokeWidth={1} />
        <circle cx={lx} cy={30} r={5.5} fill="#0A0806" /><circle cx={lx + 4} cy={25.5} r={2.4} fill="#fff" opacity={0.9} /></g>
      <path d={`M12 30 Q50 ${top} 88 30`} fill="none" stroke={dark(skin, pal, 0.55)} strokeWidth={2.2} />
      {[...Array(9)].map((_, i) => { const u = 0.1 + i * 0.1, x = 12 + u * 76, y = 30 + (top - 30) * 4 * u * (1 - u) * 0.5 * 2 * 0.5 * 2;
        return <path key={i} d={`M${x} ${y} l${(u - 0.5) * 6} -4`} stroke={dark(skin, pal, 0.6)} strokeWidth={0.9} strokeLinecap="round" />; })}
      <path d={`M14 ${6 - lid * 0} Q50 -4 86 8`} stroke={dark(skin, pal, 0.5)} strokeWidth={3.4} fill="none" strokeLinecap="round" />
    </g>
  );
};
