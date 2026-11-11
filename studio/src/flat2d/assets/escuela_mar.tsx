// escuela_mar · Nicópolis al atardecer: el mar con el sol bajo, colinas y un pino; Epicteto ya viejo (calvo, barba blanca, la pierna rígida y un bastón)
// sentado en un bloque de piedra enseña a tres alumnos sentados en el suelo, uno de ellos anotando en una tablilla de cera.
// `teach` alza la mano con el índice arriba (se queda); `write` el alumno de la tablilla escribe (se queda escribiendo).
import React from "react";
import { type AssetFC, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza, Himation } from "./romanos";
import { Grain } from "./grain";

export const EscuelaMar: AssetFC = ({ pal, p, t, seed }) => {
  const te = p.teach ?? 0, wr = p.write ?? 0, id = `em${seed}`;
  const sea = lerpHex(pal.wall, pal.ink, 0.25), ground = lerpHex(pal.rock, pal.ink, 0.45), stone = lerpHex(pal.wallLit, pal.rock, 0.55);
  const alumno = (x: number, s: number, k: number, tab: boolean) => (
    <g key={k} transform={`translate(${x} 104) scale(${s})`}>
      <path d="M-6 0 Q-7 -8 -3 -14 L4 -14 Q7 -6 6 0Z" fill={lerpHex(pal.wallLit, pal.rock, 0.3 + k * 0.1)} />
      <path d="M-8 0 L4 -1" stroke={pal.skin} strokeWidth={2.4} strokeLinecap="round" />
      <Cabeza cx={0} cy={-19} r={4.4} pal={pal} turn={-0.7} hair={lerpHex(pal.rock, pal.ink, 0.3 + k * 0.1)} />
      {tab ? <g><rect x={-9} y={-11} width={6} height={4.4} fill={lerpHex(pal.rock, pal.rim, 0.3)} transform="rotate(-20 -6 -9)" />
        <path d={`M-4 -12 L${-6 + Math.sin(t * 0.6 * wr) * 1.4 * wr} -8.6`} stroke={pal.wallLit} strokeWidth={0.6} /></g>
        : <path d="M-2 -12 L-6 -6" stroke={pal.skin} strokeWidth={1.8} strokeLinecap="round" />}
    </g>
  );
  return (
    <g>
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.bg} /><stop offset="1" stopColor={lerpHex(pal.accent, pal.wall, 0.4)} /></linearGradient>
        <radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.9} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
      </defs>
      <rect x={-2} y={-2} width={104} height={84} fill={`url(#${id}s)`} />
      <circle cx={68} cy={74} r={22} fill={`url(#${id}g)`} /><circle cx={68} cy={76} r={6} fill={pal.glow} />
      <path d="M-2 76 Q14 62 30 70 Q40 64 50 76Z" fill={lerpHex(pal.wall, pal.ink, 0.45)} />
      <rect x={-2} y={76} width={104} height={28} fill={sea} />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${60 - i * 1.2 + Math.sin(t * 0.05 + i) * 1.5} ${78 + i * 2.6} l${10 + i * 1.5} 0`} stroke={pal.glow} strokeWidth={0.7} opacity={0.65 - i * 0.05} />)}
      {[...Array(6)].map((_, i) => <path key={`w${i}`} d={`M${8 + i * 16 + Math.sin(t * 0.04 + i * 2) * 2} ${84 + (i % 3) * 6} q2 -1 4 0`} stroke={lerpHex(sea, pal.wallLit, 0.3)} strokeWidth={0.5} fill="none" />)}
      {/* pino */}
      <path d="M90 104 L91 62" stroke={lerpHex(pal.rock, pal.ink, 0.3)} strokeWidth={1.6} />
      <path d="M78 66 Q91 52 104 64 Q92 60 78 66Z M82 58 Q92 46 102 56 Q92 54 82 58Z" fill={lerpHex(pal.ink, pal.wall, 0.35)} />
      {/* suelo */}
      <rect x={-2} y={104} width={104} height={76} fill={ground} />
      <g transform="translate(0 104)"><Grain n={110} w={100} h={74} seed={seed * 7 + 3} a={pal.rock} b={pal.ink} rMax={0.8} /></g>
      <path d="M-2 104 L102 104" stroke={pal.rim} strokeWidth={0.6} opacity={0.5} />
      {/* Epicteto viejo en su piedra */}
      <rect x={18} y={92} width={18} height={12} rx={1} fill={stone} /><path d="M18 92 L36 92" stroke={pal.rim} strokeWidth={0.5} opacity={0.6} />
      <path d="M33 90 L44 103" stroke={pal.skin} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M24 92 L24 103" stroke={pal.skin} strokeWidth={2.6} strokeLinecap="round" />
      <path d="M14 72 L18 104" stroke={lerpHex(pal.rock, pal.rim, 0.25)} strokeWidth={1.1} />
      <Himation cx={27} top={72} feet={94} w={14} pal={pal} />
      <path d={`M21 74 Q16 82 15 ${lerp(84, 82, te)}`} stroke={pal.skin} strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d={`M33 74 Q${lerp(38, 40, te)} ${lerp(84, 70, te)} ${lerp(36, 41, te)} ${lerp(88, 62, te)}`} stroke={pal.skin} strokeWidth={2} fill="none" strokeLinecap="round" />
      {te > 0.4 && <path d={`M41 62 l0.4 -3`} stroke={pal.skin} strokeWidth={1} strokeLinecap="round" />}
      <rect x={25.5} y={66} width={3} height={6} fill={pal.skin} />
      <Cabeza cx={27} cy={62} r={5} pal={pal} turn={0.6} beard bald curls={false} hair={lerpHex(pal.wallLit, pal.rim, 0.1)} />
      {alumno(52, 1, 0, false)}{alumno(66, 0.95, 1, true)}{alumno(80, 0.9, 2, false)}
    </g>
  );
};
