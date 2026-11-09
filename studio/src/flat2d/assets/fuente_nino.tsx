// fuente_nino · una fuente de piedra con un caño en forma de cabeza de león y un niño agachado que bebe el agua con las manos juntas.
// `drink`: el niño junta las manos bajo el chorro y se las lleva a la boca; gotas caen entre los dedos (se queda bebiendo).
import React from "react";
import { type AssetFC, clamp01, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";
import { Grain } from "./grain";

export const FuenteNino: AssetFC = ({ pal, p, t, seed }) => {
  const dr = p.drink ?? 0, stone = lerpHex(pal.wallLit, pal.rock, 0.3), stoneD = lerpHex(stone, pal.ink, 0.3), water = lerpHex(pal.wall, pal.glow, 0.45);
  const hx = lerp(52, 60, dr), hy = lerp(66, 56, dr), up = clamp01((dr - 0.5) * 2);
  const handY = lerp(hy, 48, up), handX = lerp(hx, 64, up);
  return (
    <g>
      {/* fuente */}
      <rect x={6} y={10} width={30} height={70} fill={stone} />
      <g transform="translate(6 10)"><Grain n={50} w={30} h={70} seed={seed + 3} a={pal.wallLit} b={stoneD} rMax={0.6} /></g>
      <rect x={4} y={6} width={34} height={5} fill={lerpHex(stone, pal.wallLit, 0.3)} />
      <circle cx={30} cy={34} r={6} fill={stoneD} /><circle cx={28} cy={32} r={1} fill={pal.ink} /><path d="M33 36 L38 37" stroke={stoneD} strokeWidth={2.4} strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${25 + i * 2} 28 l-1 -3`} stroke={stoneD} strokeWidth={1} />)}
      <path d={`M38 37 Q46 40 ${lerp(50, 54, dr)} ${lerp(80, 64, dr)}`} stroke={water} strokeWidth={1.8} fill="none" opacity={0.9} />
      <path d="M2 80 L52 80 L50 90 L4 90Z" fill={stoneD} /><path d="M4 80 Q28 76 52 80" stroke={water} strokeWidth={1.4} fill="none" />
      {/* niño agachado */}
      <ellipse cx={70} cy={90} rx={14} ry={2} fill={pal.ink} opacity={0.4} />
      <path d="M62 88 L66 76 L74 76 L80 88" stroke={pal.skin} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M62 60 Q70 56 78 60 L80 80 L62 80Z" fill={lerpHex(pal.wallLit, pal.accent, 0.25)} />
      <path d={`M64 62 L${handX + 2} ${handY + 3}`} stroke={pal.skin} strokeWidth={3} strokeLinecap="round" />
      <path d={`M74 62 L${handX + 5} ${handY + 4}`} stroke={pal.skin} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${handX - 1} ${handY} Q${handX + 4} ${handY + 5} ${handX + 9} ${handY}`} fill={pal.skin} />
      {dr > 0.2 && [0, 1, 2].map((i) => { const ph = ((t * 0.08 + i / 3) % 1); return <circle key={i} cx={handX + 2 + i * 2} cy={handY + 3 + ph * 20} r={0.6} fill={water} opacity={1 - ph} />; })}
      <Cabeza cx={70} cy={50} r={7} pal={pal} turn={-0.7} curls />
    </g>
  );
};
