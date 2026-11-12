// criatura · personaje: la criatura de Frankenstein en silueta de cuerpo entero, como en los grabados de 1831: muy alta, hombros anchos, cabeza
// grande de frente plana, cicatrices cosidas en la frente y las muñecas, levita oscura y raída. `wake` (acción propia): abre los ojos (brillan),
// levanta despacio una mano y un relámpago lo recorta (se queda). Respira siempre.
import React from "react";
import { type AssetFC, idle } from "./common";
import { lerpHex } from "../palette";
import { ContactShadow, Grad, Halo, dark, url } from "./shade";

export const Criatura: AssetFC = ({ pal, t, seed, p }) => {
  const id = `cr${seed}`, I = idle(t, seed), wk = p.wake ?? 0, by = I.breath * 0.5;
  const skin = lerpHex(lerpHex(pal.skin, "#8FA08A", 0.55), pal.ink, 0.15), coat = dark(pal.wall, pal, 0.55), eye = lerpHex(pal.glow, "#E8FFF0", 0.4);
  const flashK = wk > 0.35 && wk < 0.5 ? 1 - Math.abs(wk - 0.42) * 12 : 0;
  const arm = wk * 70, rad = (d: number) => (d * Math.PI) / 180, ex = 66 + Math.sin(rad(10 + arm)) * 20, ey = 64 + by + Math.cos(rad(10 + arm)) * 20;
  return (
    <g>
      <Grad id={`${id}c`} a={lerpHex(coat, pal.rim, 0.12)} b={dark(coat, pal, 0.4)} /><Grad id={`${id}s`} a={lerpHex(skin, pal.wallLit, 0.2)} b={dark(skin, pal, 0.3)} />
      <ContactShadow id={`${id}sh`} cx={50} cy={155} rx={26} />
      {flashK > 0 ? <Halo id={`${id}f`} cx={50} cy={70} r={80} color="#DDEBFF" a={0.6 * flashK} /> : null}
      <path d="M40 112 L37 152 L46 152 L49 116 Z M60 112 L63 152 L54 152 L51 116 Z" fill={dark(coat, pal, 0.3)} />
      <path d={`M27 ${62 + by} Q50 ${54 + by} 73 ${62 + by} L72 118 L60 122 L58 108 L42 108 L40 122 L28 118 Z`} fill={url(`${id}c`)} />
      <path d={`M40 ${118} l2 4 l2 -4 l2 4 l2 -4 M56 120 l2 4 l2 -4`} stroke={dark(coat, pal, 0.5)} strokeWidth={0.6} fill="none" />
      <path d={`M30 ${64 + by} L24 98`} stroke={lerpHex(coat, pal.rim, 0.06)} strokeWidth={8} strokeLinecap="round" />
      <rect x={20} y={97} width={9} height={8} rx={3} fill={url(`${id}s`)} /><path d="M20.5 99 L28.5 99" stroke={pal.ink} strokeWidth={0.5} strokeDasharray="1 0.8" />
      <path d={`M70 ${64 + by} L${ex} ${ey}`} stroke={coat} strokeWidth={8} strokeLinecap="round" />
      <circle cx={ex} cy={ey} r={4.6} fill={url(`${id}s`)} /><path d={`M${ex - 4} ${ey - 2} L${ex + 4} ${ey - 2}`} stroke={pal.ink} strokeWidth={0.5} strokeDasharray="1 0.8" />
      <rect x={44} y={48 + by} width={12} height={9} fill={url(`${id}s`)} />
      <path d={`M35 ${22 + by} L65 ${22 + by} L66 ${44 + by} Q50 ${54 + by} 34 ${44 + by} Z`} fill={url(`${id}s`)} />
      <rect x={34} y={18 + by} width={32} height={8} rx={1} fill={dark(pal.ink, pal, 0)} />
      <path d={`M38 ${29 + by} L62 ${29 + by}`} stroke={pal.ink} strokeWidth={0.7} strokeDasharray="1.4 1" />
      {[[-1, 47], [1, 47]].map(([sd]) => <rect key={sd} x={sd < 0 ? 31.5 : 65} y={40 + by} width={3.5} height={3} rx={0.6} fill={lerpHex(pal.rock, pal.rim, 0.3)} />)}
      {[-1, 1].map((sd) => <g key={sd}>
        <path d={`M${50 + sd * 9 - 4} ${33 + by} L${50 + sd * 9 + 4} ${33 + by}`} stroke={pal.ink} strokeWidth={1.4} strokeLinecap="round" />
        <ellipse cx={50 + sd * 8} cy={37 + by} rx={2.4} ry={wk > 0.15 ? 1.6 : 0.3} fill={wk > 0.15 ? eye : pal.ink} />
        {wk > 0.15 ? <Halo id={`${id}e${sd}`} cx={50 + sd * 8} cy={37 + by} r={5} color={eye} a={0.7} /> : null}
      </g>)}
      <path d={`M44 ${46 + by} L56 ${46 + by}`} stroke={dark(skin, pal, 0.5)} strokeWidth={0.9} />
      <path d={`M66 ${24 + by} Q67.5 ${36 + by} 65.5 ${44 + by}`} stroke={pal.rim} strokeWidth={0.8} fill="none" opacity={0.4 + 0.6 * flashK} />
    </g>
  );
};
