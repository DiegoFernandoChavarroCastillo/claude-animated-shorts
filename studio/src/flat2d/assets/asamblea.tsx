// asamblea · el joven Alejandro sobre una tribuna de piedra ante los hoplitas griegos (de espaldas, escudos redondos y cascos corintios) y dos estandartes con el sol macedonio.
// `proclaim` le alza el brazo y las lanzas suben en aclamación mientras late un halo: lo nombran jefe (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Coraza, Hoplita } from "./romanos";

export const Asamblea: AssetFC = ({ pal, p, t }) => {
  const pr = p.proclaim ?? 0, stone = lerpHex(pal.wallLit, pal.rock, 0.35), up = clamp01(pr * 1.4 - 0.2), hair = lerpHex(pal.rim, pal.rock, 0.45);
  const hx = lerp(42, 38, pr), hy = lerp(60, 20, pr);
  const banner = (x: number) => (
    <g>
      <path d={`M${x} 92 L${x} 26`} stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={1.2} />
      <rect x={x - 7} y={30} width={14} height={14} fill={pal.accent} />
      <circle cx={x} cy={37} r={2} fill={pal.rim} />{[...Array(8)].map((_, i) => <path key={i} d={`M${x} 37 L${x + Math.cos(i * 0.785) * 5} ${37 + Math.sin(i * 0.785) * 5}`} stroke={pal.rim} strokeWidth={0.8} />)}
      <path d={`M${x - 3} 26 L${x} 22 L${x + 3} 26Z`} fill={pal.rim} />
    </g>
  );
  return (
    <g transform="translate(0 -6)">
      {banner(14)}{banner(86)}
      <path d="M24 72 L76 72 L80 92 L20 92Z" fill={stone} /><path d="M28 66 L72 66 L76 72 L24 72Z" fill={lerpHex(stone, pal.wallLit, 0.35)} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${24 + i * 6.5} 76 l3 0 l0 12 l-3 0Z`} fill={lerpHex(stone, pal.ink, 0.15)} />)}
      <path d="M41 39 Q34 54 37 66 L63 66 Q66 54 59 39Z" fill={lerpHex(pal.accent, pal.ink, 0.3)} />
      <Coraza cx={50} top={39} feet={67} w={17} pal={pal} />
      <path d={`M43 40 Q${hx - 1} ${lerp(50, 30, pr)} ${hx} ${hy}`} stroke={pal.accent} strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <path d={`M${lerp(42.5, 40, pr)} ${lerp(50, 30, pr)} L${hx} ${hy}`} stroke={pal.skin} strokeWidth={2.2} strokeLinecap="round" /><circle cx={hx} cy={hy} r={1.8} fill={pal.skin} />
      <path d="M58 40 Q60 50 59 58" stroke={pal.accent} strokeWidth={3.4} fill="none" strokeLinecap="round" /><circle cx={59} cy={59} r={1.6} fill={pal.skin} />
      <path d="M48 36 L52 36 L52 40 L48 40Z" fill={pal.skin} />
      {[...Array(7)].map((_, i) => { const a = Math.PI * (0.95 + i * 0.18); return <circle key={i} cx={50 + Math.cos(a) * 5.6} cy={30 + Math.sin(a) * 5} r={2.2} fill={hair} />; })}
      <Cabeza cx={50} cy={31} r={5.4} pal={pal} hair={hair} />
      <path d="M48 25.5 Q50 22 52 25.5" stroke={hair} strokeWidth={2} fill="none" />
      {pr > 0.5 && [0, 1, 2].map((i) => { const u = ((t * 0.03 + i / 3) % 1); return <circle key={i} cx={50} cy={31} r={8 + u * 22} fill="none" stroke={pal.glow} strokeWidth={0.6} opacity={(1 - u) * 0.5 * clamp01((pr - 0.5) * 3)} />; })}
      {[...Array(6)].map((_, i) => <Hoplita key={`a${i}`} x={8 + i * 17} y={96} s={0.62} pal={pal} up={clamp01(up - hash(i) * 0.2)} seed={i} />)}
      {[...Array(5)].map((_, i) => <Hoplita key={`b${i}`} x={16 + i * 17} y={105} s={0.78} pal={pal} up={clamp01(up - hash(i + 5) * 0.2)} tilt={(hash(i + 2) - 0.5) * 4} seed={i + 1} />)}
    </g>
  );
};
