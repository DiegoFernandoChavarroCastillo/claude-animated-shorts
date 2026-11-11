// huida_barco · De noche en el mar: Cleopatra encapuchada, con Cesarión niño abrazado, huye en un barco pequeño de vela oscura; detrás se alejan las luces de Roma.
// `row` el barco avanza y la estela se alarga mientras Roma se aleja (se queda); `look_back` Cleopatra gira la cabeza hacia Roma y aprieta al niño (se queda).
import React from "react";
import { type AssetFC, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";
import { Cabeza } from "./romanos";
import { CabezaCleo } from "./ptolomeos";

export const HuidaBarco: AssetFC = ({ pal, p, t, seed }) => {
  const rw = p.row ?? 0, lb = p.look_back ?? 0, id = `hb${seed}`, sea = lerpHex(pal.bg, pal.accent, 0.22), hull = lerpHex(pal.rock, pal.ink, 0.45), cloak = lerpHex(pal.ink, pal.wall, 0.35);
  const romeX = lerp(18, 4, rw), romeS = lerp(1, 0.7, rw), bob = Math.sin(t * 0.09) * 1, roll = Math.sin(t * 0.07) * 2;
  return (
    <g>
      <defs><linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.bg} /><stop offset="1" stopColor={lerpHex(pal.bg, pal.wall, 0.5)} /></linearGradient></defs>
      <rect x={-2} y={-2} width={104} height={90} fill={`url(#${id}s)`} />
      {[...Array(45)].map((_, i) => <circle key={i} cx={hash(i + 11) * 100} cy={hash(i + 60) * 74} r={0.2 + hash(i + 5) * 0.35} fill={pal.wallLit} opacity={0.3 + 0.4 * Math.abs(Math.sin(t * 0.04 + i))} />)}
      <circle cx={82} cy={24} r={4.5} fill={lerpHex(pal.wallLit, pal.glow, 0.2)} opacity={0.85} />
      {/* Roma a lo lejos */}
      <g transform={`translate(${romeX} 84) scale(${romeS})`}>
        <path d="M-6 0 L-6 -6 L2 -10 L10 -6 L18 -9 L26 -5 L34 -7 L34 0Z" fill={lerpHex(pal.wall, pal.ink, 0.4)} />
        <path d="M6 -6 L12 -10 L18 -6Z" fill={lerpHex(pal.wall, pal.ink, 0.3)} />
        {[...Array(9)].map((_, i) => <rect key={i} x={-4 + i * 4} y={-4 - (i % 3)} width={0.9} height={1.2} fill={pal.glow} opacity={0.5 + 0.4 * Math.sin(t * 0.1 + i)} />)}
      </g>
      <rect x={-2} y={84} width={104} height={50} fill={sea} />
      {[...Array(16)].map((_, i) => { const y = 86 + i * 3, o = Math.sin(t * 0.07 + i) * 4; return <path key={`w${i}`} d={`M${hash(i) * 70 + o} ${y} l${8 + hash(i + 3) * 10} 0`} stroke={lerpHex(sea, pal.wallLit, 0.25)} strokeWidth={0.4} opacity={0.6} />; })}
      {[...Array(7)].map((_, i) => <path key={`m${i}`} d={`M${80 + Math.sin(t * 0.08 + i) * 2} ${86 + i * 3.2} l${5 - i * 0.4} 0`} stroke={pal.wallLit} strokeWidth={0.7} opacity={0.4} />)}
      {/* estela */}
      <path d={`M44 102 Q${lerp(36, 16, rw)} 104 ${lerp(30, -4, rw)} ${108} M44 103 Q${lerp(36, 16, rw)} 101 ${lerp(30, -4, rw)} 99`} stroke={lerpHex(sea, pal.wallLit, 0.45)} strokeWidth={0.6} fill="none" />
      {/* barco */}
      <g transform={`translate(62 ${101 + bob}) rotate(${roll})`}>
        <path d="M0 -4 L0 -46" stroke={hull} strokeWidth={1.2} />
        <path d={`M1 -44 Q${16 + Math.sin(t * 0.08) * 1.5} -30 1 -8Z`} fill={lerpHex(pal.wall, pal.ink, 0.35)} />
        <path d="M0 -46 L-20 -2 M0 -46 L20 -2" stroke={hull} strokeWidth={0.3} />
        {/* Cleopatra con el niño */}
        <g transform="translate(-8 -4)">
          <path d="M-6 0 Q-7 -12 -4 -18 L5 -18 Q7 -12 6 0Z" fill={cloak} />
          <path d="M3 -13 Q8 -11 7 -6 Q4 -4 1 -6Z" fill={lerpHex(pal.wallLit, pal.rock, 0.2)} />
          <Cabeza cx={5} cy={-14} r={2.3} pal={pal} turn={lerp(-0.4, -0.7, lb)} curls hair={lerpHex(pal.rock, pal.ink, 0.5)} eyesClosed={1 - lb} />
          <path d="M-5.6 -15 Q-6.4 -29 0 -28.6 Q6.4 -29 5.6 -15Z" fill={cloak} />
          <CabezaCleo cx={0} cy={-22} r={3.6} pal={pal} turn={lerp(0.6, -0.9, lb)} crown={0} />
          <path d="M-4.6 -23 Q-4.4 -27.6 0 -27.4 Q4.4 -27.6 4.6 -23 Q0 -25.6 -4.6 -23Z" fill={cloak} />
          <path d="M-5.6 -16 Q-6.4 -29 0 -28.6 Q6.4 -29 5.6 -16" stroke={pal.rim} strokeWidth={0.4} fill="none" opacity={0.5} />
          <path d="M5 -10 Q2 -8 -1 -9" stroke={pal.skin} strokeWidth={1} fill="none" strokeLinecap="round" />
        </g>
        <path d="M-22 -3 Q0 6 22 -3 L24 -6 L-24 -6Z" fill={hull} /><path d="M-24 -6 L24 -6" stroke={pal.rim} strokeWidth={0.4} opacity={0.5} />
        <path d={`M14 -5 L${22 + Math.sin(t * 0.2) * 3} 4`} stroke={hull} strokeWidth={0.6} />
      </g>
      <path d="M-2 132 L102 132 L102 180 L-2 180Z" fill={lerpHex(sea, pal.ink, 0.5)} />
      <g transform="translate(0 84)"><Grain n={120} w={100} h={96} seed={seed * 3 + 8} a={lerpHex(sea, pal.wallLit, 0.2)} b={pal.ink} rMax={0.6} /></g>
    </g>
  );
};
