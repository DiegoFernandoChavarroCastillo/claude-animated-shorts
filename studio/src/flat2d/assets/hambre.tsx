// hambre · Patio con las tinajas del grano vacías (una volcada), un saco hueco y un niño flaco con un cuenco: el hambre, silos vacíos, no hay pan.
// `beg` el niño alza el cuenco vacío hacia ti (se queda).
import React from "react";
import { type AssetFC, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Cabeza } from "./romanos";

export const Hambre: AssetFC = ({ pal, p, t }) => {
  const bg = p.beg ?? 0, clay = lerpHex(pal.rock, pal.rim, 0.3), clayD = lerpHex(clay, pal.ink, 0.35);
  const pithos = (x: number, s: number, k: number) => (
    <g key={k} transform={`translate(${x} 75) scale(${s})`}>
      <path d="M-6 0 Q-12 -14 -9 -26 Q-6 -32 -4 -33 L4 -33 Q6 -32 9 -26 Q12 -14 6 0Z" fill={k % 2 ? clay : clayD} />
      <ellipse cx={0} cy={-33} rx={4.6} ry={1.4} fill={pal.ink} />
      {[-20, -12].map((yy) => <path key={yy} d={`M-10 ${yy} Q0 ${yy + 2} 10 ${yy}`} stroke={lerpHex(clay, pal.ink, 0.5)} strokeWidth={0.6} fill="none" />)}
    </g>
  );
  return (
    <g>
      {pithos(10, 1, 0)}{pithos(26, 1.1, 1)}{pithos(42, 0.95, 2)}
      <g transform="translate(60 74) rotate(-80)"><path d="M-6 0 Q-12 -14 -9 -26 Q-6 -32 -4 -33 L4 -33 Q6 -32 9 -26 Q12 -14 6 0Z" fill={clay} /><ellipse cx={0} cy={-33} rx={4.6} ry={1.4} fill={pal.ink} /></g>
      {[...Array(5)].map((_, i) => <circle key={i} cx={94 - i * 2.4 + hash(i) * 2} cy={74 + hash(i * 2) * 1} r={0.45} fill={pal.rim} />)}
      <path d="M46 75 Q44 68 49 66 Q52 64 55 68 L56 75Z" fill={lerpHex(pal.wallLit, pal.rock, 0.55)} />
      {/* niño */}
      <g transform="translate(84 75)">
        <path d="M-2 0 L-2 -12 M2 0 L2 -12" stroke={pal.skin} strokeWidth={1.6} strokeLinecap="round" />
        <path d="M-4.5 -11 L-4 -26 L4 -26 L4.5 -11Z" fill={lerpHex(pal.wallLit, pal.rock, 0.5)} />
        <path d="M3.6 -25 Q5 -19 3.6 -14" stroke={pal.skin} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        <path d={`M-3.6 -25 Q${lerp(-6, -8, bg)} ${lerp(-19, -27, bg)} ${lerp(-4, -10, bg)} ${lerp(-15, -30, bg)}`} stroke={pal.skin} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        <path d={`M${lerp(-4, -10, bg) - 3.6} ${lerp(-15, -30, bg) - 1} Q${lerp(-4, -10, bg)} ${lerp(-15, -30, bg) + 3} ${lerp(-4, -10, bg) + 3.6} ${lerp(-15, -30, bg) - 1}Z`} fill={clayD} />
        <rect x={-1} y={-29} width={2} height={3.4} fill={pal.skin} />
        <Cabeza cx={0} cy={-32.5} r={3.8} pal={pal} turn={lerp(-0.4, -0.9, bg)} curls eyesClosed={0} mouth={bg > 0.5 ? 0.25 + 0.1 * Math.sin(t * 0.2) : 0} />
      </g>
      <ellipse cx={50} cy={75.5} rx={48} ry={1.6} fill={pal.ink} opacity={0.4} />
    </g>
  );
};
