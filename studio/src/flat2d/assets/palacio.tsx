// palacio · interior romano de noche: muro con frisos, columnas de mármol, cortinajes púrpura recogidos, un vano oscuro al fondo, lámparas de aceite en pie y suelo de mármol en damero.
import React from "react";
import { type AssetFC } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const Palacio: AssetFC = ({ pal, seed, flick }) => {
  const id = `pa${seed}`, marble = lerpHex(pal.wallLit, pal.wall, 0.4), wall = lerpHex(pal.wall, pal.ink, 0.25), drape = lerpHex(pal.wall, pal.accent, 0.35);
  const column = (x: number) => (
    <g key={x}>
      <rect x={x - 6} y={34} width={12} height={92} fill={marble} />
      {[0, 1, 2, 3].map((f) => <path key={f} d={`M${x - 4.2 + f * 2.8} 38 L${x - 4.2 + f * 2.8} 122`} stroke={lerpHex(marble, pal.ink, 0.3)} strokeWidth={0.5} />)}
      <rect x={x - 8} y={30} width={16} height={4} fill={lerpHex(marble, pal.wallLit, 0.3)} /><rect x={x - 8} y={126} width={16} height={4} fill={lerpHex(marble, pal.ink, 0.2)} />
      <path d={`M${x + 6} 34 L${x + 6} 126`} stroke={pal.rim} strokeWidth={0.6} opacity={0.5 + 0.3 * flick} />
    </g>
  );
  const lamp = (x: number) => (
    <g key={`l${x}`}>
      <circle cx={x} cy={96} r={16 + 3 * flick} fill={`url(#${id}g)`} />
      <path d={`M${x} 130 L${x} 100`} stroke={lerpHex(pal.rock, pal.rim, 0.3)} strokeWidth={1} /><path d={`M${x - 4} 130 L${x} 126 L${x + 4} 130`} stroke={lerpHex(pal.rock, pal.rim, 0.3)} strokeWidth={0.8} fill="none" />
      <ellipse cx={x} cy={99.5} rx={3.4} ry={1.4} fill={lerpHex(pal.rock, pal.rim, 0.4)} /><path d={`M${x - 0.8} 98.5 Q${x} ${94 - 1.5 * flick} ${x + 0.8} 98.5Z`} fill={pal.rim} />
    </g>
  );
  return (
    <g>
      <defs><radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.7} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <rect x={-2} y={-2} width={104} height={134} fill={wall} />
      <Grain n={180} w={100} h={130} seed={seed * 7 + 5} a={lerpHex(wall, pal.wallLit, 0.2)} b={pal.ink} rMax={0.8} />
      <rect x={-2} y={20} width={104} height={5} fill={lerpHex(wall, pal.rim, 0.25)} />{[...Array(17)].map((_, i) => <rect key={i} x={i * 6.2} y={21.2} width={3} height={2.6} fill={lerpHex(wall, pal.ink, 0.3)} />)}
      <path d="M36 126 L36 62 Q50 46 64 62 L64 126Z" fill={pal.ink} /><path d="M36 62 Q50 46 64 62" stroke={marble} strokeWidth={1.4} fill="none" />
      <path d="M-2 26 Q8 70 2 126 L-2 126Z" fill={drape} /><path d="M102 26 Q92 70 98 126 L102 126Z" fill={drape} />
      <path d="M14 26 Q26 50 22 70 Q30 52 34 26Z" fill={drape} /><path d="M86 26 Q74 50 78 70 Q70 52 66 26Z" fill={drape} />
      <path d="M22 70 L22 74 M78 70 L78 74" stroke={pal.rim} strokeWidth={1.2} />
      {[12, 88].map(column)}
      {[28, 72].map(lamp)}
      <path d="M-2 130 L102 130 L102 178 L-2 178Z" fill={marble} />
      {[...Array(6)].map((_, r) => [...Array(9)].map((_, c) => (r + c) % 2 ? <path key={`${r}-${c}`} d={`M${c * 12 - 4 - r * 2} ${130 + r * 8} l12 0 l${2 + r * 0.6} 8 l-12 0Z`} fill={lerpHex(marble, pal.ink, 0.3)} /> : null))}
      <g transform="translate(0 130)"><Grain n={80} w={100} h={48} seed={seed * 5 + 1} a={pal.wallLit} b={pal.ink} rMax={0.6} /></g>
    </g>
  );
};
