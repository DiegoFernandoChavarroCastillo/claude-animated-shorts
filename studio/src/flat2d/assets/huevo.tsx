// huevo · un huevo enorme cuya cáscara contiene un cosmos (estrellas y una espiral de luz): el universo como incubadora. `crack` lo resquebraja y deja escapar la luz.
import React from "react";
import { type AssetFC, hash, lerp } from "./common";
import { Grain } from "./grain";

export const Huevo: AssetFC = ({ pal, p, t, seed, flick }) => {
  const id = `hu${seed}`, c = p.crack ?? 0, egg = "M50 8 C74 8 88 50 88 82 C88 108 72 118 50 118 C28 118 12 108 12 82 C12 50 26 8 50 8 Z";
  const cracks = [["M50 8 L46 24 L55 36 L47 52 L58 66", 0], ["M47 52 L34 60 L30 76", 0.3], ["M58 66 L72 74 L70 92", 0.45], ["M55 36 L68 40 L74 52", 0.6]] as const;
  return (
    <g>
      <defs>
        <clipPath id={`${id}k`}><path d={egg} /></clipPath>
        <radialGradient id={`${id}o`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.6 + 0.35 * c} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={pal.wall} /><stop offset="1" stopColor={pal.ink} /></linearGradient>
      </defs>
      <ellipse cx={50} cy={64} rx={lerp(52, 66, c)} ry={lerp(58, 72, c)} fill={`url(#${id}o)`} opacity={0.55 * (0.85 + 0.15 * flick)} />
      <ellipse cx={50} cy={120} rx={36} ry={4.5} fill={pal.ink} opacity={0.6} />
      <path d={egg} fill={`url(#${id}s)`} />
      <g clipPath={`url(#${id}k)`}>
        <Grain n={140} w={100} h={125} seed={seed * 5 + 1} a={pal.wallLit} b={pal.wall} />
        {[...Array(46)].map((_, i) => <circle key={i} cx={10 + hash(i + 30) * 80} cy={8 + hash(i + 60) * 110} r={0.3 + hash(i + 90) * 0.9} fill="#FFF8E8" opacity={0.35 + 0.5 * Math.abs(Math.sin(t * 0.05 + i))} />)}
        <g transform={`translate(50 66) rotate(${t * 0.12})`}>{[0, 1, 2, 3, 4].map((a) => <path key={a} d={`M0 0 C8 -6 20 -4 32 -16 C40 -24 46 -26 50 -24`} stroke={a % 2 ? pal.wallLit : pal.rim} strokeWidth={5 - a * 0.7} fill="none" strokeLinecap="round" opacity={0.2 + 0.05 * a} transform={`rotate(${a * 72})`} />)}<circle r={9} fill={pal.glow} opacity={0.35} /><circle r={4.2} fill={pal.glow} opacity={0.9} /></g>
        <path d="M18 34 Q22 22 34 14" stroke="#FFF8E8" strokeWidth={2.6} fill="none" strokeLinecap="round" opacity={0.22} />
      </g>
      <path d={egg} fill="none" stroke={pal.rim} strokeWidth={1.3} opacity={0.85} /><path d="M82 52 Q88 70 86 88" stroke={pal.glow} strokeWidth={1.8} fill="none" opacity={0.6} />
      {cracks.map(([d, s], i) => { const u = Math.max(0, Math.min(1, (c - s) / (1 - s))); return u > 0 ? <g key={i}><path d={d} stroke="#FFF1CF" strokeWidth={5} fill="none" opacity={0.4 * u} strokeLinejoin="round" /><path d={d} stroke="#FFFBEA" strokeWidth={2} fill="none" strokeLinejoin="round" pathLength={100} strokeDasharray="100" strokeDashoffset={100 * (1 - u)} /></g> : null; })}
    </g>
  );
};
