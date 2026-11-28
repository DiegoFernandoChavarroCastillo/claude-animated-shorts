// oveja · prop: una oveja de lana blanca y esponjosa vista de lado mirando a la izquierda, cara y patas oscuras, orejas caídas; pasta y mueve
// la cabeza (reposo). Lienzo 100 × 70, anclaje en los pies. Para rebaños usa `repeat`. Acción propia: `look` levanta la cabeza (se queda).
import React from "react";
import { type AssetFC, clamp01, idle } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Vol, dark, url } from "./shade";

export const Oveja: AssetFC = ({ pal, t, seed, p }) => {
  const id = `ov${seed}`, { breath, sway } = idle(t, seed), lk = clamp01(p.look ?? 0);
  const wool = lerpHex("#F4EFE4", pal.wallLit, 0.2), face = lerpHex("#2E2622", pal.ink, 0.2);
  const graze = (1 - lk) * (0.5 + 0.5 * Math.sin(t * 0.06 + seed)), hy = 30 + graze * 16;
  return (
    <g>
      <Vol id={`${id}w`} c={wool} pal={pal} k={1} lx={0.35} ly={0.15} />
      <ContactShadow id={`${id}s`} cx={52} cy={69} rx={34} a={0.35} />
      {[30, 40, 64, 74].map((x, i) => <rect key={x} x={x} y={50} width={4} height={19} rx={1.5} fill={face} transform={`rotate(${Math.sin(t * 0.05 + i) * 1.5} ${x} 50)`} />)}
      <g transform={`translate(0 55) scale(1 ${1 + breath * 0.015}) translate(0 -55)`}>
        {[[30, 38, 13], [44, 32, 14], [60, 33, 14], [74, 40, 12], [38, 50, 12], [56, 50, 13], [72, 50, 10]].map(([x, y, r], k) => <circle key={k} cx={x} cy={y} r={r} fill={url(`${id}w`)} />)}
        {[[36, 30], [52, 26], [66, 30], [46, 44], [64, 44]].map(([x, y], k) => <path key={k} d={`M${x} ${y} q3 -3 6 0`} stroke={dark(wool, pal, 0.18)} strokeWidth={0.8} fill="none" />)}
        <circle cx={86} cy={36} r={4} fill={url(`${id}w`)} transform={`rotate(${sway * 10} 84 38)`} />
      </g>
      {/* cabeza */}
      <g transform={`translate(${16} ${hy}) rotate(${-10 + graze * 30})`}>
        <circle cx={6} cy={-6} r={8} fill={url(`${id}w`)} />
        <path d="M-10 -2 Q-12 8 -4 10 Q4 10 6 2 Q4 -6 -4 -6 Q-9 -6 -10 -2 Z" fill={face} />
        <path d="M2 -6 Q10 -10 12 -2 Q8 -2 4 -3 Z" fill={dark(face, pal, 0.2)} transform={`rotate(${sway * 8} 4 -4)`} />
        <circle cx={-4} cy={-0.5} r={1.1} fill="#F4E8C0" /><circle cx={-4.2} cy={-0.5} r={0.5} fill="#000" />
      </g>
    </g>
  );
};
