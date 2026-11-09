// agora · Corinto al sol: cielo claro, la colina de Acrocorinto con su muralla, un pórtico de columnas dóricas, cipreses (el Craneo era un bosquecillo de cipreses) y suelo de tierra clara.
import React from "react";
import { type AssetFC, hash } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

export const Agora: AssetFC = ({ pal, t, seed }) => {
  const id = `ag${seed}`, marble = lerpHex(pal.wallLit, pal.wall, 0.15), marbleD = lerpHex(marble, pal.ink, 0.3), cypress = lerpHex(pal.rock, pal.ink, 0.45);
  const tree = (x: number, y: number, s: number) => (
    <g key={`c${x}`} transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-0.8} y={-4} width={1.6} height={5} fill={lerpHex(pal.rock, pal.ink, 0.2)} />
      <path d="M0 -40 Q6 -24 4.5 -4 L-4.5 -4 Q-6 -24 0 -40Z" fill={cypress} /><path d="M0 -40 Q6 -24 4.5 -4 L1 -4 Q3 -22 0 -40Z" fill={lerpHex(cypress, pal.rim, 0.15)} />
    </g>
  );
  return (
    <g>
      <defs><linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.bg} /><stop offset="1" stopColor={pal.wall} /></linearGradient>
        <radialGradient id={`${id}h`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.9} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <rect x={-2} y={-2} width={104} height={120} fill={`url(#${id}s)`} />
      <circle cx={82} cy={24} r={26} fill={`url(#${id}h)`} /><circle cx={82} cy={24} r={7} fill={pal.glow} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${((t * 0.03 + i * 40) % 130) - 15} ${18 + i * 9} q4 -3 8 0 q4 -3 8 0`} stroke={pal.wallLit} strokeWidth={1.4} fill="none" opacity={0.6} />)}
      <g transform="translate(0 -34)">
      <path d="M-2 96 Q20 60 46 62 Q62 56 76 74 Q90 80 102 78 L102 130 L-2 130Z" fill={lerpHex(pal.wall, pal.rock, 0.45)} />
      <path d="M26 64 L30 60 L34 64 L38 60 L42 64 L46 60 L50 64" stroke={lerpHex(pal.wallLit, pal.rock, 0.3)} strokeWidth={1} fill="none" />
      {/* pórtico */}
      <rect x={-2} y={92} width={60} height={5} fill={marble} /><path d="M-2 92 L28 84 L58 92Z" fill={lerpHex(marble, pal.wallLit, 0.2)} />
      {[...Array(7)].map((_, i) => <g key={i}><rect x={1 + i * 8.5} y={97} width={4} height={26} fill={marble} /><rect x={1 + i * 8.5 + 3} y={97} width={1} height={26} fill={marbleD} /></g>)}
      <rect x={-2} y={123} width={60} height={3} fill={marbleD} />
      {tree(66, 126, 1.1)}{tree(76, 124, 0.9)}{tree(88, 127, 1.2)}{tree(98, 125, 1)}
      </g>
      <path d="M-2 90 L102 90 L102 180 L-2 180Z" fill={lerpHex(pal.rock, pal.ink, 0.12)} />
      <g transform="translate(0 90)"><Grain n={260} w={100} h={90} seed={seed * 7 + 2} a={lerpHex(pal.rock, pal.wallLit, 0.35)} b={pal.ink} rMax={0.8} /></g>
      {[...Array(16)].map((_, i) => <path key={`s${i}`} d={`M${hash(i + seed) * 100} ${96 + hash(i + 3) * 80} l1.5 -1.4 l1.5 1.4`} stroke={lerpHex(pal.rock, pal.ink, 0.2)} strokeWidth={0.4} fill="none" />)}
    </g>
  );
};
