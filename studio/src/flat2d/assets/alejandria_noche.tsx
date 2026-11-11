// alejandria_noche · Alejandría de noche desde el puerto: el faro de Faros con su hoguera, la luna, el agua con reflejos y el palacio real iluminado en la orilla.
// `skiff` un bote pequeño con dos figuras (una encapuchada) cruza el puerto hacia el palacio dejando estela (se queda junto al muelle).
import React from "react";
import { type AssetFC, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const AlejandriaNoche: AssetFC = ({ pal, p, t, seed, flick }) => {
  const sk = p.skiff ?? 0, id = `an${seed}`, sky = lerpHex(pal.bg, pal.wall, 0.25), sea = lerpHex(pal.bg, pal.accent, 0.3), stone = lerpHex(pal.wall, pal.wallLit, 0.25);
  const bx = lerp(8, 66, sk), by = 114 - sk * 3;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.bg} /><stop offset="1" stopColor={sky} /></linearGradient>
        <radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.85} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-2} y={-2} width={104} height={100} fill={`url(#${id}s)`} />
      {[...Array(40)].map((_, i) => <circle key={i} cx={hash(i + 3) * 100} cy={hash(i + 40) * 70} r={0.2 + hash(i + 9) * 0.35} fill={pal.wallLit} opacity={0.35 + 0.4 * Math.abs(Math.sin(t * 0.05 + i))} />)}
      <circle cx={76} cy={34} r={6} fill={lerpHex(pal.wallLit, pal.glow, 0.3)} /><circle cx={78} cy={32.5} r={5.4} fill={sky} opacity={0.25} />
      {/* faro */}
      <circle cx={20} cy={36} r={14 + 3 * flick} fill={`url(#${id}g)`} />
      <path d="M12 98 L13 64 L27 64 L28 98Z" fill={stone} /><path d="M14 64 L15 46 L25 46 L26 64Z" fill={lerpHex(stone, pal.wallLit, 0.15)} />
      <path d="M16 46 L17 38 L23 38 L24 46Z" fill={lerpHex(stone, pal.wallLit, 0.3)} />
      <path d={`M18 38 Q20 ${30 - 3 * flick} 22 38Z`} fill={pal.rim} /><path d={`M19 38 Q20 ${33 - 2 * flick} 21 38Z`} fill={pal.glow} />
      {[70, 80, 90].map((y) => <rect key={y} x={18.5} y={y} width={3} height={4} fill={pal.ink} />)}
      <path d="M27 64 L28 98 M25 46 L26 64" stroke={pal.rim} strokeWidth={0.5} opacity={0.6} />
      <path d={`M20 36 L${-10} ${44 + 10 * Math.sin(t * 0.02)} L${-10} ${48 + 10 * Math.sin(t * 0.02)}Z`} fill={pal.glow} opacity={0.12} />
      {/* palacio real en la orilla */}
      <path d="M56 98 L56 78 L102 78 L102 98Z" fill={lerpHex(stone, pal.ink, 0.25)} />
      <path d="M54 78 L79 66 L104 78Z" fill={lerpHex(stone, pal.ink, 0.1)} /><path d="M54 78 L79 66 L104 78" stroke={pal.rim} strokeWidth={0.5} fill="none" opacity={0.6} />
      {[59, 65, 71, 77, 83, 89, 95].map((x) => <rect key={x} x={x} y={79} width={2.4} height={19} fill={stone} />)}
      {[62, 68, 80, 86, 92].map((x, i) => <rect key={`w${x}`} x={x} y={84} width={2.8} height={9} fill={pal.glow} opacity={0.45 + 0.4 * Math.abs(Math.sin(t * 0.03 + i * 1.3))} />)}
      <path d="M50 98 L104 98 L104 101 L50 101Z" fill={lerpHex(stone, pal.ink, 0.4)} />
      {/* agua */}
      <rect x={-2} y={98} width={104} height={34} fill={sea} />
      {[...Array(14)].map((_, i) => { const y = 100 + i * 2.3, o = Math.sin(t * 0.06 + i) * 3; return <path key={i} d={`M${-2 + o + (i % 3) * 6} ${y} l${10 + (i % 4) * 4} 0 M${40 + o - (i % 2) * 8} ${y} l${8 + (i % 3) * 3} 0 M${78 + o} ${y} l8 0`} stroke={lerpHex(sea, pal.wallLit, 0.25)} strokeWidth={0.35} opacity={0.6} />; })}
      {[...Array(8)].map((_, i) => <path key={`m${i}`} d={`M${73 + Math.sin(t * 0.08 + i) * 2} ${100 + i * 3.4} l${6 - i * 0.4} 0`} stroke={pal.wallLit} strokeWidth={0.7} opacity={0.5} />)}
      {[...Array(6)].map((_, i) => <path key={`f${i}`} d={`M${18 + Math.sin(t * 0.09 + i) * 2} ${100 + i * 4} l${4 - i * 0.3} 0`} stroke={pal.rim} strokeWidth={0.7} opacity={0.5 * flick + 0.2} />)}
      {/* bote */}
      <g transform={`translate(${bx} ${by + Math.sin(t * 0.12) * 0.4})`}>
        {sk > 0 && sk < 1 && <path d={`M-6 1 L${-6 - 14 * Math.min(1, sk * 4)} 2.5 M-6 1 L${-6 - 14 * Math.min(1, sk * 4)} -0.5`} stroke={pal.wallLit} strokeWidth={0.4} opacity={0.5} />}
        <path d="M-7 0 Q0 3.5 7 0 L8 -1.4 L-8 -1.4Z" fill={lerpHex(pal.rock, pal.ink, 0.3)} />
        <path d="M-3.5 -1.4 Q-3.5 -7 -2 -8 Q-0.5 -7 -0.5 -1.4Z" fill={lerpHex(pal.ink, pal.wall, 0.3)} />
        <path d="M3 -1.4 L3 -6.5" stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={1.6} strokeLinecap="round" /><circle cx={3} cy={-7.6} r={1.2} fill={lerpHex(pal.skin, pal.ink, 0.4)} />
        <path d={`M3.5 -4 L${8 + Math.sin(t * 0.25) * 2} 2`} stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={0.5} />
      </g>
      {/* muelle en primer plano */}
      <path d="M-2 130 L102 130 L102 180 L-2 180Z" fill={lerpHex(pal.rock, pal.ink, 0.55)} />
      <path d="M-2 130 L102 130" stroke={pal.rim} strokeWidth={0.5} opacity={0.4} />
      {[...Array(9)].map((_, i) => <path key={`q${i}`} d={`M${i * 12} 130 L${i * 12 - 3} 180`} stroke={pal.ink} strokeWidth={0.5} opacity={0.6} />)}
      <g transform="translate(0 130)"><Grain n={90} w={100} h={48} seed={seed * 3 + 2} a={pal.rock} b={pal.ink} rMax={0.7} /></g>
      <Grain n={60} w={100} h={96} seed={seed * 5 + 7} a={lerpHex(sky, pal.wallLit, 0.2)} b={pal.ink} rMax={0.5} />
    </g>
  );
};
