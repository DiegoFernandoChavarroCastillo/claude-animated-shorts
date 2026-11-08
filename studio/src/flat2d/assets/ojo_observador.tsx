// ojo_observador · un ojo grande que mira hacia abajo y proyecta un cono de luz con líneas de escaneo. `look` lo abre y estira el haz; `blink` lo cierra un instante (parpadeo).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { Grain } from "./grain";

export const OjoObservador: AssetFC = ({ pal, p, t, seed, flick }) => {
  const id = `oo${seed}`, look = p.look ?? 0, blink = p.blink ?? 0;
  const open = clamp01(lerp(0.3, 1, look) * (1 - 0.96 * Math.sin(Math.PI * blink))), beam = 0.15 + 0.85 * look * (0.2 + 0.8 * open);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.glow} stopOpacity={0.55} /><stop offset="1" stopColor={pal.glow} stopOpacity={0.05} /></linearGradient>
        <radialGradient id={`${id}i`}><stop offset="0" stopColor={pal.glow} /><stop offset="0.6" stopColor={pal.accent} /><stop offset="1" stopColor={pal.wall} /></radialGradient>
        <clipPath id={`${id}k`}><path d="M50 40 L6 100 L94 100 Z" /></clipPath>
      </defs>
      {/* cono de luz */}
      <g opacity={beam}>
        <path d="M44 42 L4 100 L96 100 L56 42 Z" fill={`url(#${id}h)`} />
        <g clipPath={`url(#${id}k)`}>
          {[0, 1, 2, 3, 4].map((k) => { const y = 44 + ((t * 0.7 + k * 12) % 58); return <line key={k} x1={0} x2={100} y1={y} y2={y} stroke={pal.glow} strokeWidth={0.5} opacity={0.5 * (1 - (y - 44) / 58)} />; })}
          {[...Array(18)].map((_, i) => { const ph = (t * 0.006 + hash(i + seed) * 3) % 1; return <circle key={i} cx={50 + (hash(i + 3) - 0.5) * (6 + ph * 80)} cy={44 + ph * 56} r={0.4 + hash(i + 9) * 0.6} fill="#FFF8E8" opacity={Math.sin(ph * Math.PI) * 0.8} />; })}
        </g>
      </g>
      <ellipse cx={50} cy={98} rx={44} ry={3.4} fill={pal.glow} opacity={0.1 + 0.25 * beam * (0.8 + 0.2 * flick)} />
      {/* ojo */}
      <g transform={`translate(0 30) scale(1 ${Math.max(0.04, open)}) translate(0 -30)`}>
        <ellipse cx={50} cy={30} rx={50} ry={22} fill={pal.glow} opacity={0.08 + 0.1 * look} />
        <path d="M8 30 Q50 -6 92 30 Q50 66 8 30Z" fill="#FFF3D6" stroke={pal.ink} strokeWidth={1.6} strokeLinejoin="round" />
        <path d="M8 30 Q50 66 92 30" stroke={pal.rim} strokeWidth={0.8} fill="none" opacity={0.7} />
        <Grain n={40} w={100} h={60} seed={seed + 21} a={pal.wallLit} b={pal.skin} rMax={0.6} />
        <circle cx={50} cy={31} r={15.5} fill={`url(#${id}i)`} stroke={pal.ink} strokeWidth={0.9} />
        {[...Array(14)].map((_, i) => <line key={i} x1={50 + Math.cos(i * 0.449) * 7} y1={31 + Math.sin(i * 0.449) * 7} x2={50 + Math.cos(i * 0.449) * 14.5} y2={31 + Math.sin(i * 0.449) * 14.5} stroke={pal.ink} strokeWidth={0.3} opacity={0.4} />)}
        <circle cx={50} cy={31} r={6.2 - 1.2 * look} fill={pal.ink} /><circle cx={54.5} cy={26.5} r={2.4} fill="#FFF8E8" opacity={0.95} /><circle cx={46} cy={35} r={1} fill="#FFF8E8" opacity={0.6} />
      </g>
      <path d="M6 30 Q50 -8 94 30" stroke={pal.ink} strokeWidth={2.4} fill="none" strokeLinecap="round" transform={`translate(0 ${(1 - open) * 8})`} opacity={open < 0.5 ? 1 : 0.0} />
    </g>
  );
};
