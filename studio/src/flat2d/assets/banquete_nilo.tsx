// banquete_nilo · La barca real dorada (talamego) navega por el Nilo al amanecer: dosel de oro sobre columnas, lámparas, César y Cleopatra recostados, un arpista y dos abanicos.
// `dawn` el sol sale detrás de la barca y el cielo se aclara (se queda); `toast` los dos alzan las copas y chocan con un destello (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";
import { Cabeza } from "./romanos";
import { CabezaCleo, gold, linen } from "./ptolomeos";

export const BanqueteNilo: AssetFC = ({ pal, p, t, seed, flick }) => {
  const dw = p.dawn ?? 0, ts = p.toast ?? 0, id = `bn${seed}`, river = lerpHex(pal.accent, pal.ink, 0.3), g = gold(pal);
  const bob = Math.sin(t * 0.06) * 0.6, up = Math.sin(clamp01(ts) * Math.PI * 0.5), spark = ts > 0.55 && ts < 1 ? Math.sin(((ts - 0.55) / 0.45) * Math.PI) : 0;
  const cupL = { x: lerp(40, 47.5, up), y: lerp(80, 72, up) }, cupR = { x: lerp(58, 50.5, up), y: lerp(80, 72, up) };
  return (
    <g>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={lerpHex(pal.bg, pal.wall, dw * 0.5)} /><stop offset="1" stopColor={lerpHex(pal.wall, pal.rim, 0.3 + 0.4 * dw)} /></linearGradient>
        <radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.9} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-2} y={-2} width={104} height={92} fill={`url(#${id}s)`} />
      <circle cx={50} cy={lerp(92, 58, dw)} r={30} fill={`url(#${id}g)`} opacity={0.4 + 0.5 * dw} />
      <circle cx={50} cy={lerp(92, 58, dw)} r={8} fill={pal.glow} />
      <path d="M-2 88 L18 84 L30 87 L46 85 L62 87 L80 84 L102 87 L102 91 L-2 91Z" fill={lerpHex(pal.rock, pal.ink, 0.45)} />
      <rect x={-2} y={90} width={104} height={44} fill={river} />
      {[...Array(12)].map((_, i) => <path key={i} d={`M${hash(i + 2) * 90 + Math.sin(t * 0.05 + i) * 3} ${100 + i * 2.6} l${6 + hash(i + 5) * 9} 0`} stroke={lerpHex(river, pal.glow, 0.4)} strokeWidth={0.4} opacity={0.6} />)}
      {[...Array(7)].map((_, i) => <path key={`r${i}`} d={`M${46 + Math.sin(t * 0.08 + i) * 2} ${100 + i * 3.2} l${8 - i * 0.6} 0`} stroke={pal.glow} strokeWidth={0.8} opacity={0.3 + 0.4 * dw} />)}
      {/* la barca */}
      <g transform={`translate(0 ${bob})`}>
        <path d="M8 96 Q50 108 92 96 L96 90 L4 90Z" fill={g} /><path d="M8 96 Q50 108 92 96" stroke={lerpHex(pal.rim, pal.ink, 0.4)} strokeWidth={0.8} fill="none" />
        <path d="M4 90 Q-2 82 2 72 Q6 70 6 76 Q4 82 9 90Z" fill={g} /><path d="M96 90 Q102 82 98 72 Q94 70 94 76 Q96 82 91 90Z" fill={g} />
        <path d="M2 72 q1 -4 4 -2 M98 72 q-1 -4 -4 -2" stroke={pal.accent} strokeWidth={1.4} fill="none" />
        {[...Array(9)].map((_, i) => <rect key={i} x={12 + i * 9.4} y={92} width={4} height={1.6} fill={pal.accent} />)}
        <path d="M14 90 L86 90" stroke={lerpHex(pal.rim, pal.ink, 0.3)} strokeWidth={0.8} />
        {[22, 36, 64, 78].map((x) => <rect key={x} x={x - 0.9} y={62} width={1.8} height={28} fill={lerpHex(g, pal.wallLit, 0.2)} />)}
        <path d="M18 63 Q50 52 82 63 L82 65 L18 65Z" fill={lerpHex(pal.accent, pal.ink, 0.15)} /><path d="M18 65 L82 65" stroke={g} strokeWidth={1.2} />
        {[...Array(8)].map((_, i) => <path key={`f${i}`} d={`M${20 + i * 8.4} 65 l2 3 l2 -3`} fill={g} />)}
        {[30, 70].map((x) => <g key={`l${x}`}><circle cx={x} cy={70} r={5 + flick} fill={pal.glow} opacity={0.3 * (1 - dw * 0.6)} /><ellipse cx={x} cy={70.5} rx={1.6} ry={0.8} fill={g} /><path d={`M${x - 0.5} 70 Q${x} ${68 - flick} ${x + 0.5} 70Z`} fill={pal.glow} /></g>)}
        {/* diván con César y Cleopatra */}
        <path d="M30 89 L70 89 L70 84 Q50 82 30 84Z" fill={lerpHex(pal.wall, pal.accent, 0.3)} />
        <path d="M34 84 Q38 79 44 80 L46 84Z" fill={lerpHex(pal.wallLit, pal.skin, 0.12)} />
        <Cabeza cx={38} cy={76.5} r={3.2} pal={pal} turn={0.5} laurel={1} bald curls={false} hair={lerpHex(pal.wallLit, pal.rock, 0.5)} />
        <path d={`M41 81 L${cupL.x} ${cupL.y}`} stroke={pal.skin} strokeWidth={1.3} strokeLinecap="round" />
        <path d="M66 84 Q62 79 56 80 L54 84Z" fill={linen(pal)} />
        <CabezaCleo cx={62} cy={76.5} r={3.1} pal={pal} turn={-0.5} />
        <path d={`M59 81 L${cupR.x} ${cupR.y}`} stroke={pal.skin} strokeWidth={1.3} strokeLinecap="round" />
        {[cupL, cupR].map((c, i) => <path key={`c${i}`} d={`M${c.x - 1.2} ${c.y - 2} L${c.x + 1.2} ${c.y - 2} L${c.x + 0.4} ${c.y} L${c.x - 0.4} ${c.y}Z`} fill={g} />)}
        {spark > 0 && [...Array(6)].map((_, i) => { const a = (i / 6) * Math.PI * 2; return <path key={`k${i}`} d={`M${49 + Math.cos(a) * 2} ${70 + Math.sin(a) * 2} l${Math.cos(a) * 3 * spark} ${Math.sin(a) * 3 * spark}`} stroke={pal.glow} strokeWidth={0.6} />; })}
        <rect x={45} y={84.5} width={10} height={1.4} fill={g} /><circle cx={48} cy={83.6} r={1} fill={pal.accent} /><circle cx={51.5} cy={83.4} r={1.2} fill={lerpHex(pal.accent, pal.rim, 0.5)} />
        {/* arpista y abanicos */}
        <path d="M80 89 L80 76 Q86 74 87 89Z" fill="none" stroke={g} strokeWidth={0.9} />{[0, 1, 2, 3].map((k) => <path key={k} d={`M80.6 ${78 + k * 2.6} L${83 + k * 0.9} ${78 + k * 2.6}`} stroke={lerpHex(pal.wallLit, pal.rim, 0.3)} strokeWidth={0.2} />)}
        <path d="M74 89 L74 81 Q76 79 78 81 L78 89Z" fill={linen(pal)} /><Cabeza cx={76} cy={77.5} r={2.4} pal={pal} turn={0.6} curls={false} hair={lerpHex(pal.ink, pal.rock, 0.2)} />
        {[24, 90].map((x, k) => <g key={`fan${k}`} transform={`rotate(${Math.sin(t * 0.1 + k) * 10} ${x} 88)`}><path d={`M${x} 88 L${x} 70`} stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={0.5} /><path d={`M${x - 3.4} 70 Q${x} 64 ${x + 3.4} 70 Q${x} 72 ${x - 3.4} 70Z`} fill={lerpHex(pal.accent, pal.wallLit, 0.2)} /></g>)}
      </g>
      {[...Array(20)].map((_, i) => { const x = i < 10 ? i * 2.4 - 2 : 78 + (i - 10) * 2.4, h = 7 + hash(i + 3) * 7, sw = Math.sin(t * 0.04 + i) * 1.2;
        return <g key={`p${i}`}><path d={`M${x} 108 Q${x + sw} ${108 - h * 0.6} ${x + sw * 2} ${108 - h}`} stroke={lerpHex(pal.rock, pal.ink, 0.3)} strokeWidth={0.8} fill="none" />
          <circle cx={x + sw * 2} cy={108 - h} r={1.3} fill={lerpHex(pal.wall, pal.ink, 0.45)} /></g>; })}
      <path d="M-2 106 Q30 103 60 105 Q85 103 102 105 L102 180 L-2 180Z" fill={lerpHex(pal.rock, pal.ink, 0.55)} />
      <g transform="translate(0 106)"><Grain n={140} w={100} h={74} seed={seed * 3 + 4} a={pal.rock} b={pal.ink} rMax={0.7} /></g>
      <Grain n={60} w={100} h={88} seed={seed * 9 + 2} a={lerpHex(pal.wall, pal.glow, 0.4)} b={pal.ink} rMax={0.5} />
    </g>
  );
};
