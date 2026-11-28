// cubo_agua · prop: un cubo de madera con dos aros de hierro y asa, lleno de agua azul con reflejo que brilla y ondula.
// Lienzo 100 × 90, anclaje en los pies. Acciones propias: `ondas` se abren anillos en el agua mientras dura (vuelve);
// `secar` el agua baja y se evapora (se queda): pasa el tiempo, nadie bebió.
import React from "react";
import { type AssetFC, clamp01 } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, Vol, dark, lite, url } from "./shade";

export const CuboAgua: AssetFC = ({ pal, t, seed, p }) => {
  const id = `cu${seed}`, on = p.ondas ?? 0, dry = clamp01(p.secar ?? 0);
  const wood = lerpHex("#8A5A34", pal.wall, 0.15), iron = dark("#5A5E66", pal, 0.2), water = "#3E9AD8";
  const lvl = 34 + dry * 22, rx = 30 - dry * 3;
  return (
    <g>
      <Grad id={`${id}w`} h a={dark(wood, pal, 0.4)} mid={lite(wood, pal, 0.2)} b={dark(wood, pal, 0.45)} />
      <Vol id={`${id}a`} c={water} pal={pal} k={0.8} lx={0.3} ly={0.3} />
      <ContactShadow id={`${id}s`} cx={50} cy={89} rx={36} a={0.4} />
      {/* asa */}
      <path d="M18 34 Q50 -6 82 34" stroke={iron} strokeWidth={2.2} fill="none" />
      {/* cuerpo */}
      <path d="M16 34 L24 86 Q50 92 76 86 L84 34 Z" fill={url(`${id}w`)} />
      {[28, 40, 52, 64].map((x) => <path key={x} d={`M${x - 2} 37 L${x + (x - 50) * 0.02} 88`} stroke={dark(wood, pal, 0.45)} strokeWidth={0.6} />)}
      {[46, 74].map((y) => <path key={y} d={`M${17 + (y - 34) * 0.15} ${y} Q50 ${y + 6} ${83 - (y - 34) * 0.15} ${y}`} stroke={iron} strokeWidth={3} fill="none" />)}
      {/* boca y agua */}
      <ellipse cx={50} cy={34} rx={34} ry={8} fill={dark(wood, pal, 0.55)} />
      <ellipse cx={50} cy={34 + (lvl - 34) * 0.35} rx={rx} ry={6.4} fill={url(`${id}a`)} opacity={1 - dry * 0.7} />
      <path d={`M${30 + Math.sin(t * 0.05) * 2} ${33 + (lvl - 34) * 0.35} q10 -2 20 0`} stroke="#DFF4FF" strokeWidth={1} fill="none" opacity={0.7 * (1 - dry)} />
      {on > 0 && on < 1 && [0, 0.33, 0.66].map((k) => { const r = ((on * 3 + k) % 1); return <ellipse key={k} cx={50} cy={34} rx={r * 28} ry={r * 5.5} fill="none" stroke="#E8F8FF" strokeWidth={0.8} opacity={1 - r} />; })}
      <ellipse cx={50} cy={34} rx={34} ry={8} fill="none" stroke={lite(wood, pal, 0.3)} strokeWidth={1.4} />
      <Halo id={`${id}h`} cx={50} cy={34} r={30} color="#9AD8FF" a={0.25 * (1 - dry)} />
    </g>
  );
};
