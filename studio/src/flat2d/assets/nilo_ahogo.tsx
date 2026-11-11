// nilo_ahogo · El Nilo al atardecer entre papiros y palmeras: Ptolomeo XIII, el hermano de Cleopatra, se hunde en el río con su coraza de oro tras la batalla.
// `sink` el rey niño manotea, se hunde con la coraza dorada y quedan burbujas, ondas y su diadema flotando (se queda).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";
import { Cabeza } from "./romanos";
import { gold } from "./ptolomeos";

export const NiloAhogo: AssetFC = ({ pal, p, t, seed }) => {
  const sk = p.sink ?? 0, id = `na${seed}`, river = lerpHex(pal.accent, pal.ink, 0.35), bank = lerpHex(pal.rock, pal.ink, 0.35);
  const dn = clamp01(sk / 0.75), bub = clamp01((sk - 0.45) / 0.55), cx = 50, wy = 98;
  const palm = (x: number, h: number, k: number) => (
    <g key={x} transform={`translate(${x} 78)`}>
      <path d={`M0 0 Q${1.5 + k} ${-h * 0.5} ${k} ${-h}`} stroke={lerpHex(pal.rock, pal.ink, 0.4)} strokeWidth={1.4} fill="none" />
      {[-1, -0.5, 0.2, 0.7, 1.1].map((a, i) => <path key={i} d={`M${k} ${-h} q${Math.cos(a * 1.4 - 1.6) * 9} ${Math.sin(a * 1.4 - 1.6) * 5 + 3} ${Math.cos(a * 1.4 - 1.6) * 11} ${7}`} stroke={lerpHex(pal.wall, pal.ink, 0.5)} strokeWidth={1.3} fill="none" strokeLinecap="round" />)}
    </g>
  );
  return (
    <g>
      <defs><linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.bg} /><stop offset="0.7" stopColor={pal.wall} /><stop offset="1" stopColor={pal.rim} /></linearGradient></defs>
      <rect x={-2} y={-2} width={104} height={82} fill={`url(#${id}s)`} />
      <circle cx={70} cy={72} r={9} fill={pal.glow} opacity={0.85} />
      <path d="M-2 78 L102 78 L102 84 L-2 84Z" fill={bank} />
      {[[8, 20, 2], [20, 15, -1], [84, 22, -2], [95, 16, 1]].map(([x, h, k]) => palm(x, h, k))}
      <rect x={-2} y={82} width={104} height={52} fill={river} />
      {[...Array(14)].map((_, i) => <path key={i} d={`M${hash(i + 4) * 90 + Math.sin(t * 0.05 + i) * 3} ${84 + i * 3.4} l${6 + hash(i) * 10} 0`} stroke={lerpHex(river, pal.glow, 0.35)} strokeWidth={0.4} opacity={0.6} />)}
      {[...Array(6)].map((_, i) => <path key={`s${i}`} d={`M${66 + Math.sin(t * 0.07 + i) * 2} ${84 + i * 3} l${8 - i} 0`} stroke={pal.glow} strokeWidth={0.8} opacity={0.55} />)}
      {/* el rey que se hunde */}
      <g transform={`translate(${cx} ${wy + lerp(0, 24, dn * dn)})`} opacity={1 - clamp01((sk - 0.7) / 0.2)}>
        <path d="M-7 -6 Q0 -8 7 -6 L7 8 L-7 8Z" fill={gold(pal)} /><path d="M-4 -4 Q0 -1 4 -4 M-5 1 Q0 3 5 1" stroke={lerpHex(pal.rim, pal.ink, 0.35)} strokeWidth={0.6} fill="none" />
        <path d={`M-6 -5 Q-12 ${-14 - Math.sin(t * 0.9) * 3} ${-9 + Math.sin(t * 0.7) * 2} ${-22 - Math.sin(t * 0.9) * 3}`} stroke={pal.skin} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <path d={`M6 -5 Q13 ${-10 + Math.sin(t * 0.8) * 3} ${15} ${-16 + Math.sin(t * 1.1) * 2}`} stroke={pal.skin} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        <Cabeza cx={0} cy={-11} r={4.6} pal={pal} turn={0.2} curls hair={lerpHex(pal.ink, pal.rock, 0.3)} mouth={0.8} />
      </g>
      <rect x={-2} y={wy + 1} width={104} height={34} fill={river} opacity={0.88} />
      {[0, 1, 2].map((r) => { const k = (t * 0.04 + r / 3) % 1; return <ellipse key={r} cx={cx} cy={wy + 1} rx={4 + k * 22} ry={1 + k * 3} fill="none" stroke={lerpHex(river, pal.wallLit, 0.5)} strokeWidth={0.5} opacity={(1 - k) * 0.8} />; })}
      {bub > 0 && [...Array(8)].map((_, i) => { const k = (t * 0.05 + hash(i) ) % 1; return <circle key={`b${i}`} cx={cx + (hash(i + 7) - 0.5) * 10} cy={wy + 8 - k * 9} r={0.5 + hash(i + 2) * 0.9} fill="none" stroke={pal.wallLit} strokeWidth={0.3} opacity={bub * (1 - k)} />; })}
      {sk > 0.6 && <g transform={`translate(${cx + 7 + Math.sin(t * 0.05) * 2} ${wy + 0.5})`} opacity={clamp01((sk - 0.6) * 4)}>
        <ellipse cx={0} cy={0} rx={4} ry={1.2} fill="none" stroke={gold(pal)} strokeWidth={0.8} /><circle cx={0} cy={-1.4} r={0.6} fill={gold(pal)} />
      </g>}
      {[...Array(22)].map((_, i) => { const x = i < 11 ? i * 2.6 - 2 : 74 + (i - 11) * 2.6, h = 8 + hash(i) * 8, sw = Math.sin(t * 0.04 + i) * 1.2;
        return <g key={`p${i}`}><path d={`M${x} 108 Q${x + sw} ${108 - h * 0.6} ${x + sw * 2} ${108 - h}`} stroke={lerpHex(pal.rock, pal.ink, 0.25)} strokeWidth={0.8} fill="none" />
          <path d={`M${x + sw * 2 - 2.6} ${108 - h - 2} L${x + sw * 2} ${108 - h} L${x + sw * 2 + 2.6} ${108 - h - 2}`} stroke={lerpHex(pal.wall, pal.ink, 0.45)} strokeWidth={1.2} fill="none" /></g>; })}
      <path d="M-2 106 Q30 103 60 105 Q85 103 102 105 L102 180 L-2 180Z" fill={lerpHex(bank, pal.ink, 0.3)} />
      <g transform="translate(0 106)"><Grain n={140} w={100} h={74} seed={seed * 3 + 1} a={pal.rock} b={pal.ink} rMax={0.7} /></g>
      <Grain n={70} w={100} h={88} seed={seed * 7 + 2} a={lerpHex(pal.wall, pal.glow, 0.3)} b={pal.ink} rMax={0.5} />
    </g>
  );
};
