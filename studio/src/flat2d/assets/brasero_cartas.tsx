// brasero_cartas · un brasero de bronce sobre trípode con patas de león, fuego vivo, y a su lado un montón de cartas (rollos y tablillas con sello de cera).
// `burn` lanza las cartas una a una al fuego: el montón se vacía, cada carta se curva y se ennegrece en el aire, la llama crece y suben chispas (se queda vacío).
import React from "react";
import { type AssetFC, clamp01, hash, lerp } from "./common";
import { lerpHex } from "../palette";
import { Grain } from "./grain";

const LETTERS = 7;

export const BraseroCartas: AssetFC = ({ pal, p, t, flick, seed }) => {
  const id = `bc${seed}`, b = p.burn ?? 0, flare = clamp01((b - 0.15) / 0.5) * (1 - clamp01((b - 0.92) / 0.08) * 0.35);
  const bronze = lerpHex(pal.rim, pal.rock, 0.55), bronzeD = lerpHex(pal.rock, pal.ink, 0.35), paper = lerpHex(pal.wallLit, pal.rim, 0.15);
  const fh = 30 + 12 * flick + 22 * flare;
  const letter = (k: number, x: number, y: number, rot: number, burnt: number, sc = 1) => (
    <g key={k} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={1 - burnt * 0.6}>
      {k % 2 ? <>
        <rect x={-7} y={-2.4} width={14} height={4.8} rx={2.4} fill={lerpHex(paper, pal.ink, burnt * 0.8)} />
        <ellipse cx={-7} cy={0} rx={1.2} ry={2.4} fill={lerpHex(paper, pal.rock, 0.4)} /><circle cx={1} cy={0} r={1.5} fill={pal.accent} />
      </> : <>
        <rect x={-6} y={-4.2} width={12} height={8.4} rx={0.6} fill={lerpHex(paper, pal.ink, burnt * 0.8)} />
        {[0, 1, 2].map((l) => <path key={l} d={`M-4.4 ${-2.2 + l * 1.8} L${3.6 - l} ${-2.2 + l * 1.8}`} stroke={lerpHex(pal.rock, pal.ink, 0.4)} strokeWidth={0.45} />)}
        <circle cx={3.6} cy={2.6} r={1.4} fill={pal.accent} />
      </>}
      {burnt > 0.2 && <path d="M-6 -4 Q0 -7 6 -4" stroke={pal.glow} strokeWidth={0.8} fill="none" opacity={burnt} />}
    </g>
  );
  return (
    <g>
      <defs><radialGradient id={`${id}g`}><stop offset="0" stopColor={pal.glow} stopOpacity={0.75} /><stop offset="1" stopColor={pal.glow} stopOpacity={0} /></radialGradient></defs>
      <ellipse cx={50} cy={40} rx={46 + 12 * flare} ry={44 + 10 * flare} fill={`url(#${id}g)`} opacity={0.55 + 0.25 * flick} />
      <ellipse cx={52} cy={108} rx={44} ry={3.4} fill={pal.ink} opacity={0.55} />
      {/* trípode */}
      {[[-1, 30], [0, 50], [1, 70]].map(([s, x]) => <g key={x}>
        <path d={`M${50 + s * 16} 66 Q${x + s * 4} 86 ${x} 104`} stroke={bronzeD} strokeWidth={3.4} fill="none" strokeLinecap="round" />
        <path d={`M${50 + s * 16} 66 Q${x + s * 4} 86 ${x} 104`} stroke={pal.rim} strokeWidth={0.7} fill="none" opacity={0.5} />
        <ellipse cx={x} cy={105.5} rx={3.6} ry={2.2} fill={bronzeD} />{[0, 1, 2].map((c) => <circle key={c} cx={x - 2 + c * 2} cy={106.8} r={0.9} fill={bronze} />)}
      </g>)}
      <path d="M36 82 L64 82" stroke={bronzeD} strokeWidth={1.6} />
      {/* fuego */}
      <g transform={`translate(50 58)`}>
        <path d={`M-22 0 Q-24 ${-fh * 0.45} -12 ${-fh * 0.6} Q-14 ${-fh * 0.85} -4 ${-fh} Q-2 ${-fh * 0.7} 2 ${-fh * 0.78} Q6 ${-fh * 1.05} 12 ${-fh * 0.72} Q22 ${-fh * 0.5} 22 0Z`} fill={pal.accent} opacity={0.92} />
        <path d={`M-14 0 Q-15 ${-fh * 0.4} -6 ${-fh * 0.55} Q-4 ${-fh * 0.75} 2 ${-fh * 0.62} Q8 ${-fh * 0.72} 9 ${-fh * 0.4} Q14 ${-fh * 0.2} 14 0Z`} fill={pal.rim} />
        <path d={`M-7 0 Q-7 ${-fh * 0.3} 0 ${-fh * 0.42} Q7 ${-fh * 0.3} 7 0Z`} fill={pal.glow} />
      </g>
      {/* cuenco */}
      <path d="M20 56 L80 56 Q78 70 50 72 Q22 70 20 56Z" fill={bronze} />
      <path d="M20 56 L80 56 Q78 70 50 72 Q22 70 20 56Z" fill="none" stroke={pal.rim} strokeWidth={0.8} />
      <ellipse cx={50} cy={56} rx={30} ry={3.2} fill={bronzeD} />
      {[28, 38, 50, 62, 72].map((x, i) => <circle key={i} cx={x} cy={62.5 + (i % 2) * 1.5} r={1.5} fill={pal.rim} opacity={0.7} />)}
      <g transform="translate(22 58)"><Grain n={40} w={56} h={12} seed={seed * 7 + 3} a={pal.rim} b={pal.ink} rMax={0.5} /></g>
      {/* montón de cartas: se vacía con burn */}
      {[...Array(LETTERS)].map((_, k) => {
        const start = (k / LETTERS) * 0.7, u = clamp01((b - start) / 0.28);
        const px = 80 + (k % 3) * 6 - 4, py = 104 - Math.floor(k / 3) * 4.2, pr = (hash(k + 3) - 0.5) * 40;
        if (u <= 0) return letter(k, px, py, pr, 0);
        if (u >= 1) return null;
        const x = lerp(px, 50 + (hash(k) - 0.5) * 14, u), y = lerp(py, 54, u) - Math.sin(u * Math.PI) * 34, rot = pr + u * 220;
        return letter(k, x, y, rot, clamp01(u * 1.4 - 0.3), 1 - 0.3 * u);
      })}
      {/* chispas */}
      {[...Array(12)].map((_, i) => {
        const ph = ((t * (0.7 + hash(i) * 0.6) + hash(i + 9) * 60) % 60) / 60, k = 0.35 + flare;
        return <circle key={i} cx={50 + (hash(i + 2) - 0.5) * 30 + Math.sin(ph * 6 + i) * 4} cy={52 - ph * (40 + 30 * flare)} r={0.5 + hash(i + 5) * 0.7} fill={i % 2 ? pal.glow : pal.rim} opacity={(1 - ph) * k} />;
      })}
    </g>
  );
};
