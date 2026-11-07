// vacio_luz · un vacío luminoso: degradado profundo con un resplandor central, haces de luz, suelo de reflejo y motas a la deriva; `bloom` abre la luz.
import React from "react";
import { type AssetFC, hash, lerp } from "./common";
import { Grain } from "./grain";

export const VacioLuz: AssetFC = ({ pal, p, t, seed, flick }) => {
  const id = `vl${seed}`, b = p.bloom ?? 0, r = lerp(34, 58, b);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}c`} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor={pal.glow} stopOpacity={0.55 + 0.25 * b} /><stop offset="0.5" stopColor={pal.wallLit} stopOpacity={0.18} /><stop offset="1" stopColor={pal.wallLit} stopOpacity={0} /></radialGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.ink} /><stop offset="0.6" stopColor={pal.bg} /><stop offset="1" stopColor={pal.wall} /></linearGradient>
      </defs>
      <rect x={-2} y={0} width={104} height={178} fill={`url(#${id}s)`} />
      <Grain n={240} w={100} h={178} seed={seed * 7 + 3} a={pal.wallLit} b={pal.wall} />
      {[...Array(7)].map((_, i) => { const a = -0.5 + i * 0.17, x2 = 50 + Math.sin(a) * 120; return <path key={i} d={`M50 76 L${x2 - 5} 190 L${x2 + 5} 190Z`} fill={pal.glow} opacity={0.035 + 0.02 * Math.sin(t * 0.03 + i)} />; })}
      <ellipse cx={50} cy={78} rx={r * 1.25} ry={r * 1.25} fill={`url(#${id}c)`} />
      <ellipse cx={50} cy={150} rx={62} ry={12} fill={pal.glow} opacity={0.09 + 0.03 * flick} /><ellipse cx={50} cy={150} rx={34} ry={5} fill={pal.glow} opacity={0.12} />
      {[...Array(26)].map((_, i) => { const ph = (t * 0.0045 + hash(i + seed) * 4) % 1; return <circle key={i} cx={hash(i + 11) * 100 + Math.sin(ph * 6 + i) * 3} cy={178 - ph * 190} r={0.35 + hash(i + 5) * 0.9} fill={pal.glow} opacity={Math.sin(ph * Math.PI) * 0.7} />; })}
    </g>
  );
};
