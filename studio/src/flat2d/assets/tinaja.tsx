// tinaja · la gran tinaja de barro (pithos) tumbada de lado donde dormía Diógenes, con la boca abierta hacia la derecha, paja dentro y un cuenco y un bastón al lado.
import React from "react";
import { type AssetFC } from "./common";
import type { Pal } from "../palette";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

/** la tinaja dibujada en (x, y) = centro de la base, `s` = escala (1 → 60 de largo) */
export const Pithos: React.FC<{ x: number; y: number; s: number; pal: Pal; seed?: number }> = ({ x, y, s, pal, seed = 0 }) => {
  const clay = lerpHex(pal.rock, pal.accent, 0.35), clayD = lerpHex(clay, pal.ink, 0.35), clayL = lerpHex(clay, pal.wallLit, 0.35);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={32} ry={2.4} fill={pal.ink} opacity={0.4} />
      <path d="M-30 -14 Q-32 -34 -8 -36 L14 -34 Q24 -33 26 -26 L26 -6 Q24 0 14 0 L-8 0 Q-30 0 -30 -14Z" fill={clay} />
      <g transform="translate(-30 -36)"><Grain n={50} w={56} h={36} seed={seed + 17} a={clayL} b={clayD} rMax={0.6} /></g>
      {[-16, -2, 10].map((xx) => <path key={xx} d={`M${xx} -35 Q${xx + 2} -18 ${xx} -1`} stroke={clayD} strokeWidth={0.8} fill="none" />)}
      <path d="M-22 -32 Q-10 -36 6 -35" stroke={clayL} strokeWidth={1.4} fill="none" opacity={0.8} />
      <ellipse cx={27} cy={-17} rx={5} ry={12} fill={clayD} /><ellipse cx={27.5} cy={-17} rx={3.6} ry={10} fill={pal.ink} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${25 + i} ${-9 + i * 0.6} l${4 + i} ${1.5 - i}`} stroke={lerpHex(pal.rim, pal.rock, 0.4)} strokeWidth={0.6} />)}
      <path d="M-30 -14 Q-32 -34 -8 -36" stroke={pal.rim} strokeWidth={0.7} fill="none" opacity={0.6} />
    </g>
  );
};

export const Tinaja: AssetFC = ({ pal, seed }) => (
  <g>
    <Pithos x={46} y={62} s={1.2} pal={pal} seed={seed} />
    <path d="M78 63 L92 30" stroke={lerpHex(pal.rock, pal.ink, 0.25)} strokeWidth={1.4} strokeLinecap="round" />
    <ellipse cx={84} cy={61} rx={5} ry={1.8} fill={lerpHex(pal.rock, pal.accent, 0.3)} />
  </g>
);
