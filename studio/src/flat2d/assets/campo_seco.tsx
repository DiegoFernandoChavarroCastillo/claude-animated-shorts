// campo_seco · Un sol blanco sobre campos de trigo muerto y tierra cuarteada: la sequía, sin lluvia, la cosecha perdida.
// `crack` las grietas se abren y el trigo se dobla (se queda).
import React from "react";
import { type AssetFC, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";
import { seg } from "./bronce";

export const CampoSeco: AssetFC = ({ pal, p, t, seed }) => {
  const id = `cs${seed}`, cr = p.crack ?? 0, soil = lerpHex(pal.rock, pal.wall, 0.35), soilD = lerpHex(soil, pal.ink, 0.5);
  const cracks = [...Array(14)].map((_, i) => { const x0 = hash(i * 3 + 1) * 100, y0 = 84 + hash(i * 7) * 24; let d = `M${x0} ${y0}`; let x = x0, y = y0; for (let k = 0; k < 4; k++) { x += (hash(i * 11 + k) - 0.5) * 16; y += (hash(i * 13 + k) - 0.3) * 6; d += ` L${x.toFixed(1)} ${y.toFixed(1)}`; } return d; });
  return (
    <g>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.bg} /><stop offset="1" stopColor={lerpHex(pal.rim, pal.wall, 0.4)} /></linearGradient>
        <radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.9} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-2} y={-2} width={104} height={84} fill={`url(#${id}s)`} />
      <circle cx={66} cy={40} r={26 + Math.sin(t * 0.05) * 1.5} fill={`url(#${id}g)`} /><circle cx={66} cy={40} r={7} fill={pal.glow} />
      {[...Array(4)].map((_, i) => <path key={i} d={`M${-2 + ((t * 0.08 + i * 30) % 110)} ${70 + i * 3} q8 -2 16 0`} stroke={lerpHex(pal.rim, pal.wall, 0.3)} strokeWidth={1.4} opacity={0.35} fill="none" />)}
      <path d="M-2 80 Q20 74 44 78 Q70 72 102 77 L102 84 L-2 84Z" fill={lerpHex(pal.wall, pal.ink, 0.35)} />
      {/* trigo muerto */}
      {[...Array(30)].map((_, i) => { const x = 1 + i * 3.4 + hash(i) * 1.5, h = 7 + hash(i * 3) * 5, bend = (0.3 + cr * 0.9) * (0.6 + hash(i * 5) * 0.6) + Math.sin(t * 0.06 + i) * 0.1;
        const tx = x + Math.sin(bend) * h, ty = 86 - Math.cos(bend) * h;
        return <g key={`w${i}`}><path d={`M${x} 86 Q${x + Math.sin(bend) * h * 0.4} ${86 - h * 0.7} ${tx} ${ty}`} stroke={lerpHex(pal.rim, pal.rock, 0.45)} strokeWidth={0.5} fill="none" /><ellipse cx={tx} cy={ty} rx={0.7} ry={1.6} transform={`rotate(${bend * 57} ${tx} ${ty})`} fill={lerpHex(pal.rim, pal.rock, 0.5)} /></g>; })}
      {/* tierra cuarteada */}
      <rect x={-2} y={84} width={104} height={96} fill={soil} />
      <rect x={-2} y={110} width={104} height={70} fill={soilD} />
      <Grain n={140} w={100} h={94} seed={seed * 3 + 4} a={lerpHex(soil, pal.wallLit, 0.2)} b={pal.ink} rMax={0.7} />
      {cracks.map((d, i) => <path key={`c${i}`} d={d} stroke={lerpHex(soil, pal.ink, 0.75)} strokeWidth={0.3 + cr * 0.35} fill="none" pathLength={100} strokeDasharray={`${(0.35 + 0.65 * seg(cr, i / 20, i / 20 + 0.4)) * 100} 100`} strokeLinejoin="round" />)}
    </g>
  );
};
