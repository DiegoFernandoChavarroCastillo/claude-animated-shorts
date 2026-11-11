// homero · Un aedo viejo y ciego con barba canta con su lira junto a una hoguera ante tres oyentes: Homero, cantar a los héroes, la tradición oral, Grecia.
// `sing` canta.
import React from "react";
import { type AssetFC, clamp01 } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";

export const Homero: AssetFC = ({ pal, p, t, flick }) => {
  const sg = p.sing ?? 0, mouth = sg > 0 ? clamp01(0.4 + 0.6 * Math.sin(t * 0.5)) : 0, robe = lerpHex(pal.wallLit, pal.rock, 0.45);
  return (
    <g>
      <ellipse cx={52} cy={70} rx={22 + 2 * flick} ry={12} fill={pal.glow} opacity={0.3} />
      <path d="M46 75 L58 75 L55 72 L49 72Z" fill={lerpHex(pal.rock, pal.ink, 0.3)} />
      <path d={`M48 72 Q50 ${62 - 3 * flick} 52 ${58 - 4 * flick} Q55 ${63 - flick} 56 72Z`} fill={pal.rim} /><path d={`M50.5 72 Q52 ${65 - 2 * flick} 53.5 72Z`} fill={pal.glow} />
      {sg > 0 && [...Array(5)].map((_, i) => { const u = ((t * 0.02 + i / 5) % 1); return <circle key={i} cx={52 + Math.sin(u * 8 + i) * 3} cy={60 - u * 30} r={0.4} fill={pal.glow} opacity={1 - u} />; })}
      {/* aedo */}
      <g transform="translate(24 75)">
        <rect x={-8} y={-12} width={16} height={12} rx={1} fill={lerpHex(pal.rock, pal.wallLit, 0.2)} />
        <path d="M-9 -12 L-7 -38 L7 -38 L9 -12 L14 -10 L14 0 L-9 0Z" fill={robe} />
        <g transform="translate(9 -24) rotate(15)">
          <path d="M-4 6 Q-6 -6 -3 -12 M4 6 Q6 -6 3 -12" stroke={lerpHex(pal.rock, pal.rim, 0.35)} strokeWidth={1.1} fill="none" />
          <path d="M-4 -10 L4 -10" stroke={lerpHex(pal.rock, pal.rim, 0.35)} strokeWidth={1} /><ellipse cx={0} cy={6} rx={5} ry={3} fill={lerpHex(pal.rock, pal.rim, 0.3)} />
          {[-2, 0, 2].map((k, i) => <path key={k} d={`M${k} -10 Q${k + Math.sin(t * 1.3 + i) * 0.5 * sg} -2 ${k} 5`} stroke={pal.wallLit} strokeWidth={0.25} fill="none" />)}
        </g>
        <path d="M6 -36 Q12 -30 10 -22" stroke={pal.skin} strokeWidth={2} fill="none" strokeLinecap="round" />
        <rect x={-1.5} y={-42} width={3} height={4} fill={pal.skin} />
        <Cabeza cx={0} cy={-46} r={5} pal={pal} turn={0.7} beard bald curls={false} eyesClosed={1} mouth={mouth} hair={lerpHex(pal.wallLit, pal.rim, 0.1)} />
      </g>
      {/* oyentes de espaldas */}
      {[[70, 1], [82, 0.9], [94, 0.85]].map(([x, s], i) => <g key={i} transform={`translate(${x} 75) scale(${s})`}>
        <path d="M-7 0 Q-8 -14 -4 -20 L4 -20 Q8 -14 7 0Z" fill={lerpHex(pal.rock, pal.ink, 0.35 + i * 0.1)} />
        <circle cx={0} cy={-24} r={4} fill={lerpHex(pal.rock, pal.ink, 0.45 + i * 0.1)} />
        <path d="M-3.6 -23 A4 4 0 0 1 -1 -27.6" stroke={pal.rim} strokeWidth={0.5} fill="none" opacity={0.7} />
      </g>)}
      <ellipse cx={50} cy={75.5} rx={48} ry={1.6} fill={pal.ink} opacity={0.4} />
    </g>
  );
};
