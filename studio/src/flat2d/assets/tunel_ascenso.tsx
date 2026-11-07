// tunel_ascenso · rampa empinada con escalones que sube por un túnel de roca hacia una luz blanca; `light_grow` abre la luz del fondo.
import React from "react";
import { type AssetFC, lerp } from "./common";
import { Grain } from "./grain";

export const TunelAscenso: AssetFC = ({ pal, p, seed, flick }) => {
  const id = `ta${seed}`, g = p.light_grow ?? 0, rx = lerp(9, 30, g), ry = lerp(8, 26, g), cy = 40;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}l`}><stop offset="0" stopColor="#FFF1CF" /><stop offset="0.45" stopColor={pal.glow} stopOpacity={0.9} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
        <linearGradient id={`${id}r`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={pal.rock} /><stop offset="1" stopColor={pal.wallLit} /></linearGradient>
      </defs>
      <rect x={-2} y={0} width={104} height={150} fill={pal.ink} />
      <Grain n={180} w={100} h={150} seed={seed * 9 + 5} a={pal.wallLit} b={pal.rock} />
      <ellipse cx={50} cy={cy} rx={rx * 2.1} ry={ry * 2.1} fill={`url(#${id}l)`} opacity={0.55 + 0.1 * flick} />
      <path d={`M-2 150 L-2 8 L${50 - rx - 8} ${cy - ry - 6} Q50 ${cy - ry - 14} ${50 + rx + 8} ${cy - ry - 6} L102 8 L102 150 Z`} fill={pal.rock} />
      <path d={`M-2 150 L-2 60 L${50 - rx - 2} ${cy + ry * 0.4} L${50 - 24} 150Z M102 150 L102 60 L${50 + rx + 2} ${cy + ry * 0.4} L${50 + 24} 150Z`} fill={pal.ink} opacity={0.65} />
      <ellipse cx={50} cy={cy} rx={rx} ry={ry} fill="#FFF1CF" /><ellipse cx={50} cy={cy} rx={rx * 0.7} ry={ry * 0.7} fill={pal.glow} opacity={0.55} />
      <path d={`M${50 - 30} 150 L${50 - rx * 0.55} ${cy + ry * 0.6} L${50 + rx * 0.55} ${cy + ry * 0.6} L${50 + 30} 150 Z`} fill={`url(#${id}r)`} />
      {[...Array(11)].map((_, i) => { const u = i / 11, y = lerp(150, cy + ry * 0.6, u ** 0.8), w = lerp(30, rx * 0.55, u ** 0.8); return <path key={i} d={`M${50 - w} ${y} L${50 + w} ${y}`} stroke={pal.ink} strokeWidth={lerp(1.2, 0.4, u)} opacity={0.65} />; })}
    </g>
  );
};
