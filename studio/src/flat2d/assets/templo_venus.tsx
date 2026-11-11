// templo_venus · Interior del templo de Venus Genetrix en el foro de César: en el ábside, la estatua de mármol de Venus y, a su lado, la estatua de Cleopatra; columnas y lámparas.
// `unveil` cae el paño púrpura que tapaba la estatua de Cleopatra y aparece dorada (se queda); `gleam` un destello recorre la estatua dorada y se enciende un halo (se queda).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";
import { Cabeza } from "./romanos";
import { Cleo, gold } from "./ptolomeos";

export const TemploVenus: AssetFC = ({ pal, p, t, seed, flick }) => {
  const uv = p.unveil ?? 1, gm = p.gleam ?? 0, id = `tv${seed}`, marble = lerpHex(pal.wallLit, pal.wall, 0.3), wall = lerpHex(pal.wall, pal.ink, 0.3);
  const goldPal = { ...pal, skin: gold(pal), wallLit: lerpHex(pal.rim, pal.glow, 0.45), glow: lerpHex(pal.rim, pal.glow, 0.45), wall: lerpHex(pal.rim, pal.ink, 0.3), ink: lerpHex(pal.rim, pal.ink, 0.65), accent: lerpHex(pal.rim, pal.ink, 0.35), rim: pal.glow };
  const marblePal = { ...pal, skin: marble, wallLit: lerpHex(marble, pal.wallLit, 0.4), ink: lerpHex(marble, pal.ink, 0.6), rim: pal.wallLit };
  const sweep = lerp(-20, 30, gm), drape = 1 - clamp01(uv);
  return (
    <g>
      <defs>
        <radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.75} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient>
        <clipPath id={`${id}c`}><path d="M57 40 L75 40 L75 100 L57 100Z" /></clipPath>
      </defs>
      <rect x={-2} y={-2} width={104} height={106} fill={wall} />
      <Grain n={160} w={100} h={102} seed={seed * 5 + 3} a={lerpHex(wall, pal.wallLit, 0.2)} b={pal.ink} rMax={0.7} />
      <path d="M14 104 L14 42 Q50 6 86 42 L86 104Z" fill={lerpHex(wall, pal.ink, 0.35)} />
      <path d="M14 42 Q50 6 86 42" stroke={lerpHex(marble, pal.rim, 0.3)} strokeWidth={1.6} fill="none" />
      {[...Array(9)].map((_, i) => <path key={i} d={`M${20 + i * 7.5} ${38 - Math.sin((i / 8) * Math.PI) * 20} l0 4`} stroke={pal.rim} strokeWidth={0.6} opacity={0.5} />)}
      {[6, 94].map((x) => <g key={x}><rect x={x - 5} y={20} width={10} height={84} fill={marble} />{[0, 1, 2].map((f) => <path key={f} d={`M${x - 3 + f * 3} 23 L${x - 3 + f * 3} 102`} stroke={lerpHex(marble, pal.ink, 0.3)} strokeWidth={0.5} />)}<rect x={x - 6.5} y={17} width={13} height={3.5} fill={lerpHex(marble, pal.wallLit, 0.3)} /></g>)}
      {gm > 0 && <circle cx={66} cy={70} r={34} fill={`url(#${id}g)`} opacity={gm} />}
      {[22, 78].map((x) => <g key={`l${x}`}><circle cx={x} cy={84} r={10 + 2 * flick} fill={`url(#${id}g)`} /><path d={`M${x} 104 L${x} 87`} stroke={lerpHex(pal.rock, pal.rim, 0.3)} strokeWidth={0.8} /><ellipse cx={x} cy={87} rx={2.6} ry={1} fill={gold(pal)} /><path d={`M${x - 0.6} 86.4 Q${x} ${83 - flick} ${x + 0.6} 86.4Z`} fill={pal.rim} /></g>)}
      {/* pedestales */}
      {[36, 66].map((x) => <g key={`pd${x}`}><rect x={x - 9} y={88} width={18} height={16} fill={lerpHex(marble, pal.ink, 0.15)} /><rect x={x - 10} y={86} width={20} height={2.6} fill={marble} /><path d={`M${x + 9} 88 L${x + 9} 104`} stroke={pal.rim} strokeWidth={0.5} opacity={0.6} /></g>)}
      {/* Venus de mármol */}
      <g transform="translate(36 86) scale(0.8)">
        <path d="M-7 -40 Q0 -42 7 -40 Q9 -16 10 0 L-10 0 Q-9 -16 -7 -40Z" fill={marble} />
        {[-4, -1, 2, 5].map((k) => <path key={k} d={`M${k} -34 Q${k + 1.6} -16 ${k + 0.8} 0`} stroke={lerpHex(marble, pal.ink, 0.3)} strokeWidth={0.5} fill="none" />)}
        <path d="M-7 -40 Q2 -30 9 -20" stroke={lerpHex(marble, pal.ink, 0.25)} strokeWidth={1.6} fill="none" />
        <path d="M6.5 -39 Q11 -32 9 -25" stroke={marble} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <path d="M-6.5 -39 Q-11 -44 -10 -52" stroke={marble} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <rect x={-1.4} y={-45} width={2.8} height={5} fill={marble} />
        <Cabeza cx={0} cy={-50} r={5} pal={marblePal} turn={0.2} curls hair={lerpHex(marble, pal.ink, 0.15)} />
      </g>
      {/* Cleopatra dorada */}
      <Cleo x={66} y={86} s={0.82} pal={goldPal} t={0} turn={-0.2} arm={0.15} />
      {gm > 0 && gm < 1 && <g clipPath={`url(#${id}c)`}><path d={`M${57 + sweep} 30 L${63 + sweep} 30 L${53 + sweep} 104 L${47 + sweep} 104Z`} fill={pal.glow} opacity={0.45} /></g>}
      {drape > 0 && <g>
        <path d={`M55 ${lerp(84, 34, drape)} Q66 ${lerp(82, 30, drape)} 77 ${lerp(84, 34, drape)} L${lerp(80, 77, drape)} 86 Q66 88 ${lerp(52, 55, drape)} 86Z`} fill={lerpHex(pal.accent, pal.wall, 0.4)} opacity={1} />
        {[60, 66, 72].map((x) => <path key={x} d={`M${x} ${lerp(84, 36, drape)} Q${x + 1.5} ${lerp(85, 60, drape)} ${x} 86`} stroke={lerpHex(pal.accent, pal.ink, 0.45)} strokeWidth={0.6} fill="none" />)}
      </g>}
      <path d="M-2 104 L102 104 L102 180 L-2 180Z" fill={lerpHex(marble, pal.ink, 0.55)} />
      {[...Array(6)].map((_, r) => [...Array(9)].map((_, c) => (r + c) % 2 ? <path key={`${r}-${c}`} d={`M${c * 12 - 4 - r * 2} ${104 + r * 9} l12 0 l${2 + r * 0.6} 9 l-12 0Z`} fill={lerpHex(marble, pal.ink, 0.72)} /> : null))}
      <g transform="translate(0 104)"><Grain n={80} w={100} h={76} seed={seed * 7 + 1} a={pal.wallLit} b={pal.ink} rMax={0.6} /></g>
    </g>
  );
};
