// bronce · piezas comunes del video colapso-bronce (Ugarit, c. 1185 a. C.): la nave de los Pueblos del Mar, el rey cananeo y el escriba sentado.
import React from "react";
import { clamp01, lerp } from "./common";
import { lerpHex, type Pal } from "../palette";
import { Cabeza } from "./romanos";

export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/** nave de los Pueblos del Mar (Medinet Habu): casco curvo con proa y popa en cabeza de pájaro, vela cuadrada, remos y guerreros con tocado de plumas; flotación en (x, y), eslora ~44·s */
export const NaveMar: React.FC<{ x: number; y: number; s: number; pal: Pal; t: number; seed?: number; glow?: number; sail?: string }> = ({ x, y, s, pal, t, seed = 0, glow = 0, sail }) => {
  const hull = lerpHex(pal.rock, pal.ink, 0.35), sc = sail ?? lerpHex(pal.wallLit, pal.rock, 0.35), bob = Math.sin(t * 0.07 + seed * 1.7) * 0.6;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s}) rotate(${Math.sin(t * 0.05 + seed) * 1.2})`}>
      {glow > 0 && <ellipse cx={0} cy={-14} rx={24} ry={20} fill={pal.glow} opacity={0.35 * glow} />}
      <path d="M0 -2 L0 -32" stroke={hull} strokeWidth={1.1} />
      <path d="M-13 -30 L13 -30 M-13 -12 L13 -12" stroke={hull} strokeWidth={0.9} />
      <path d={`M-12 -29.5 Q${Math.sin(t * 0.06 + seed) * 1.5} -20 -12 -12.5 L12 -12.5 Q${2 + Math.sin(t * 0.06 + seed) * 1.5} -20 12 -29.5Z`} fill={sc} />
      {[-6, 0, 6].map((k) => <path key={k} d={`M${k} -29.5 L${k} -12.5`} stroke={lerpHex(sc, pal.ink, 0.25)} strokeWidth={0.4} />)}
      <path d="M0 -32 L-21 -6 M0 -32 L21 -6" stroke={hull} strokeWidth={0.35} />
      <circle cx={0} cy={-33} r={1.2} fill={hull} />
      {[-12, -6, 0, 6, 12].map((k, i) => <g key={k}>
        <circle cx={k} cy={-6.5} r={1.6} fill={lerpHex(pal.skin, pal.ink, 0.35)} />
        {[-1, -0.5, 0, 0.5, 1].map((f) => <path key={f} d={`M${k + f} -7.6 L${k + f * 1.6} -10.6`} stroke={lerpHex(pal.wallLit, pal.rim, 0.3)} strokeWidth={0.45} />)}
        <path d={`M${k} -4 L${k - 4 + Math.sin(t * 0.12 + i) * 1.5} 3`} stroke={hull} strokeWidth={0.5} />
      </g>)}
      <path d="M-20 -5 Q-22 -12 -24 -16 Q-21 -18 -19 -15 L-18 -12 Q-10 2 0 2 Q10 2 18 -12 L19 -15 Q21 -18 24 -16 Q22 -12 20 -5 L20 -4 L-20 -4Z" fill={hull} />
      <path d="M-24 -16 L-27 -15.4 L-23.6 -14.6Z M24 -16 L27 -15.4 L23.6 -14.6Z" fill={pal.rim} />
      <circle cx={-22.6} cy={-16.2} r={0.5} fill={pal.rim} /><circle cx={22.6} cy={-16.2} r={0.5} fill={pal.rim} />
      <path d="M-18 -4 L18 -4" stroke={pal.rim} strokeWidth={0.5} opacity={0.6} />
      {[...Array(6)].map((_, i) => <path key={i} d={`M${-15 + i * 6} -2.5 l2 0`} stroke={lerpHex(hull, pal.rim, 0.3)} strokeWidth={0.6} />)}
    </g>
  );
};

/** rey cananeo de pie: túnica larga con orla, manto cruzado, gorro alto y barba; pies en (x, y), alto ~60·s */
export const ReyUgarit: React.FC<{ x: number; y: number; s: number; pal: Pal; arm?: number; mouth?: number; turn?: number; step?: number }> = ({ x, y, s, pal, arm = 0, mouth = 0, turn = 0.5, step = 0 }) => {
  const robe = lerpHex(pal.accent, pal.ink, 0.25), mant = lerpHex(pal.wall, pal.accent, 0.3), gold = pal.rim;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M-4 0 L${-3 + step * 2} -6 M4 0 L${3 - step * 2} -6`} stroke={lerpHex(pal.skin, pal.ink, 0.3)} strokeWidth={2.4} strokeLinecap="round" />
      <path d="M-9 -2 L-7 -40 L7 -40 L9 -2Z" fill={robe} />
      {[...Array(7)].map((_, i) => <path key={i} d={`M${-8.6 + i * 2.8} -2 l0.4 2.2`} stroke={gold} strokeWidth={0.6} />)}
      <path d="M-9 -3 L9 -3" stroke={gold} strokeWidth={0.9} />
      <path d="M-8 -38 Q2 -30 8 -14 L5 -12 Q0 -26 -7.6 -30Z" fill={mant} />
      <path d="M-8 -38 Q2 -30 8 -14" stroke={gold} strokeWidth={0.6} fill="none" />
      <path d="M-7 -40 L-9 -26" stroke={pal.skin} strokeWidth={2.2} strokeLinecap="round" />
      <path d={`M7 -39 Q${lerp(10, 13, arm)} ${lerp(-30, -42, arm)} ${lerp(9, 18, arm)} ${lerp(-24, -46, arm)}`} stroke={pal.skin} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      {arm > 0.5 && <path d={`M18 -46 l1.6 -2`} stroke={pal.skin} strokeWidth={1} strokeLinecap="round" />}
      <rect x={-1.5} y={-44} width={3} height={4.5} fill={pal.skin} />
      <Cabeza cx={0} cy={-49} r={5.2} pal={pal} turn={turn} beard curls={false} mouth={mouth} hair={lerpHex(pal.ink, pal.rock, 0.3)} />
      <path d="M-4.6 -52 Q-5 -62 0 -63 Q5 -62 4.6 -52Z" fill={lerpHex(pal.wallLit, pal.rim, 0.25)} />
      <path d="M-4.8 -52.4 L4.8 -52.4" stroke={gold} strokeWidth={1} />
    </g>
  );
};

/** escriba sentado con las piernas cruzadas, tablilla de arcilla en el regazo y punzón de caña; base en (x, y), alto ~34·s */
export const Escriba: React.FC<{ x: number; y: number; s: number; pal: Pal; t: number; write?: number; turn?: number; shake?: number }> = ({ x, y, s, pal, t, write = 0, turn = -0.5, shake = 0 }) => {
  const kilt = lerpHex(pal.wallLit, pal.rock, 0.45), clay = lerpHex(pal.rock, pal.rim, 0.35), j = Math.sin(t * 1.9) * 0.5 * shake;
  const sx = Math.sin(t * 0.5) * 1.6 * write;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-13 0 Q-12 -6 -4 -6 L6 -6 Q13 -6 13 0Z" fill={lerpHex(kilt, pal.ink, 0.2)} />
      <path d="M-7 -6 Q-8 -20 -5 -26 L5 -26 Q8 -20 7 -6Z" fill={kilt} />
      <path d="M-5 -26 Q0 -22 5 -26" stroke={pal.rim} strokeWidth={0.5} fill="none" />
      <rect x={-8} y={-13} width={10} height={7} rx={1.5} fill={clay} transform="rotate(-12 -3 -9)" />
      {[0, 1, 2].map((r) => <path key={r} d={`M-7 ${-11.4 + r * 1.8} l${2 + 6 * clamp01(write * 3 - r)} -0.4`} stroke={lerpHex(clay, pal.ink, 0.45)} strokeWidth={0.5} strokeDasharray="0.6 0.5" transform="rotate(-12 -3 -9)" />)}
      <path d="M-5 -24 Q-10 -16 -6 -11" stroke={pal.skin} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d={`M5 -24 Q8 -17 ${-0.5 + sx + j} ${-11.5 + j}`} stroke={pal.skin} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d={`M${-0.5 + sx + j} ${-11.5 + j} L${3 + sx + j} ${-17 + j}`} stroke={lerpHex(pal.wallLit, pal.rim, 0.2)} strokeWidth={0.7} />
      <rect x={-1.3} y={-29.5} width={2.6} height={4} fill={pal.skin} />
      <Cabeza cx={0} cy={-33} r={4.4} pal={pal} turn={turn} curls={false} hair={lerpHex(pal.ink, pal.rock, 0.2)} />
    </g>
  );
};

